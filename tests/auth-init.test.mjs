import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = ts.transpileModule(readFileSync('src/features/auth/hooks/useAuth.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

function setup() {
  const timers = new Map()
  let nextTimer = 0
  let callback, cleanup, resolveProfile, rejectProfile
  let inCallback = false, calls = 0, unsubscribed = false
  const state = { user: null, role: null, isLoading: true, error: null }
  const store = {
    setLoading: (isLoading) => Object.assign(state, { isLoading, error: null }),
    setUser: (user, role) => Object.assign(state, { user, role, isLoading: false, error: null }),
    clear: () => Object.assign(state, { user: null, role: null, isLoading: false, error: null }),
    setError: (error) => Object.assign(state, { user: null, role: null, isLoading: false, error }),
  }
  const supabase = {
    auth: { onAuthStateChange: (fn) => {
      callback = fn
      return { data: { subscription: { unsubscribe: () => { unsubscribed = true } } } }
    } },
    from: () => {
      assert.equal(inCallback, false, 'Profile query must run outside the auth callback')
      calls++
      const query = {
        select: () => query, eq: () => query, abortSignal: () => query,
        single: () => new Promise((resolve, reject) => { resolveProfile = resolve; rejectProfile = reject }),
      }
      return query
    },
  }
  const context = {
    exports: {}, AbortController,
    setTimeout: (fn, delay) => { timers.set(++nextTimer, { fn, delay }); return nextTimer },
    clearTimeout: (id) => timers.delete(id),
    require: (name) => {
      if (name === 'react') return { useEffect: (fn) => { cleanup = fn() } }
      if (name === '@/lib/supabase') return { supabase }
      if (name === '@/store/authStore') return { useAuthStore: () => store }
      throw new Error(name)
    },
  }
  vm.runInNewContext(source, context)
  context.exports.useAuthInit()
  return {
    state, timers,
    emit: (session) => {
      inCallback = true
      try { assert.equal(callback('INITIAL_SESSION', session), undefined) }
      finally { inCallback = false }
    },
    run: (delay) => {
      for (const [id, timer] of [...timers]) if (timer.delay === delay) { timers.delete(id); timer.fn() }
    },
    resolve: (value) => resolveProfile(value), reject: () => rejectProfile(new Error('offline')),
    cleanup: () => cleanup(), calls: () => calls, unsubscribed: () => unsubscribed,
  }
}
const settle = async () => { for (let i = 0; i < 5; i++) await Promise.resolve() }
const session = { user: { id: 'test-user' } }

test('restores a saved session without reentering the auth lock', async () => {
  const app = setup()
  app.emit(session)
  assert.equal(app.calls(), 0)
  app.run(0)
  app.resolve({ data: { role: 'pastor' }, error: null })
  await settle()
  assert.equal(app.state.role, 'pastor')
  assert.equal(app.state.isLoading, false)
  assert.equal(app.timers.size, 0)
})
test('no saved session finishes loading without fetching a profile', () => {
  const app = setup(); app.emit(null)
  assert.equal(app.state.isLoading, false)
  assert.equal(app.calls(), 0)
})
test('a network failure exits loading with an error', async () => {
  const app = setup(); app.emit(session); app.run(0); app.reject(); await settle()
  assert.equal(app.state.isLoading, false)
  assert.ok(app.state.error)
  assert.equal(app.state.role, null)
})
test('missing role does not grant secretary access', async () => {
  const app = setup(); app.emit(session); app.run(0)
  app.resolve({ data: null, error: null }); await settle()
  assert.ok(app.state.error)
  assert.equal(app.state.user, null)
})
test('late profile response cannot undo sign out', async () => {
  const app = setup(); app.emit(session); app.run(0); app.emit(null)
  app.resolve({ data: { role: 'admin' }, error: null }); await settle()
  assert.equal(app.state.user, null)
})
test('initialization and profile requests have a bounded wait', async () => {
  const initial = setup(); initial.run(15000)
  assert.ok(initial.state.error)
  const app = setup(); app.emit(session); app.run(0); app.run(15000)
  app.resolve({ data: { role: 'admin' }, error: null }); await settle()
  assert.ok(app.state.error)
  assert.equal(app.state.user, null)
})
test('unmount cancels deferred work and unsubscribes', () => {
  const app = setup(); app.emit(session); app.cleanup(); app.run(0)
  assert.equal(app.calls(), 0)
  assert.equal(app.timers.size, 0)
  assert.equal(app.unsubscribed(), true)
})
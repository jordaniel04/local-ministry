import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Users, Church, BookOpen, ClipboardList, CalendarCheck, FileText, BarChart3, LogOut, HeartHandshake, Sun, Moon, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { signOut } from '@/features/auth/hooks/useAuth'
import { useThemeStore } from '@/store/themeStore'

const navItems = [
  { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { to: '/people', icon: Users, label: 'Personas' },
  { to: '/ministries', icon: Church, label: 'Ministerios' },
  { to: '/formation', icon: BookOpen, label: 'Formación' },
  { to: '/attendance', icon: CalendarCheck, label: 'Asistencia' },
  { to: '/tasks', icon: ClipboardList, label: 'Tareas' },
  { to: '/notes', icon: FileText, label: 'Notas' },
  { to: '/leader-tracking', icon: HeartHandshake, label: 'Seguimiento' },
]

// En móvil mostramos solo los 4 primeros en la barra inferior; el resto en un menú "Más"
const BOTTOM_NAV_LIMIT = 4

export function AppLayout() {
  const navigate = useNavigate()
  const { isDark, toggle } = useThemeStore()
  const [showMore, setShowMore] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const primaryItems = navItems.slice(0, BOTTOM_NAV_LIMIT)
  const secondaryItems = navItems.slice(BOTTOM_NAV_LIMIT)

  return (
    <div className="flex h-screen bg-background">

      {/* ── Sidebar lateral — solo visible en md+ ── */}
      <aside className="hidden md:flex w-56 flex-col border-r border-border bg-sidebar shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
          <span className="font-semibold text-sidebar-foreground tracking-wide">ESLIDER</span>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors',
                  'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-sidebar-border space-y-1">
          <button
            onClick={toggle}
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded-md text-sm w-full transition-colors',
              'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            <span>{isDark ? 'Tema claro' : 'Tema oscuro'}</span>
          </button>
          <button
            onClick={handleSignOut}
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded-md text-sm w-full transition-colors',
              'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Header móvil */}
        <div className="md:hidden flex items-center justify-between px-4 h-12 border-b border-border bg-background sticky top-0 z-10">
          <span className="font-semibold text-sm tracking-wide">ESLIDER</span>
          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>

      {/* ── Bottom navigation — solo visible en móvil ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-20">
        <div className="flex items-center justify-around px-2 h-16">
          {primaryItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg flex-1 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </NavLink>
          ))}

          {/* Botón "Más" para el resto de secciones */}
          <button
            onClick={() => setShowMore((v) => !v)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg flex-1 transition-colors',
              showMore ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">Más</span>
          </button>
        </div>

        {/* Panel "Más" — overlay sobre el contenido */}
        {showMore && (
          <>
            {/* Fondo semitransparente para cerrar al tocar afuera */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMore(false)}
            />
            <div className="fixed bottom-16 left-0 right-0 z-20 bg-sidebar border-t-2 border-sidebar-border shadow-2xl px-4 pt-4 pb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                Más secciones
              </p>
              <div className="grid grid-cols-2 gap-2">
                {secondaryItems.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setShowMore(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-sidebar-accent text-sidebar-foreground hover:bg-primary/10'
                      )
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}
      </nav>
    </div>
  )
}

import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type LeaderSession = Tables<'leader_sessions'>
export type LeaderSessionInsert = TablesInsert<'leader_sessions'>
export type LeaderSessionUpdate = TablesUpdate<'leader_sessions'>

export type LeaderSessionWithPerson = LeaderSession & {
  leader: { first_name: string; last_name: string } | null
}

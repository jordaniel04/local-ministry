import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Ministry = Tables<'ministries'>
export type MinistryInsert = TablesInsert<'ministries'>
export type MinistryUpdate = TablesUpdate<'ministries'>

export type LeaderMinistry = Tables<'leader_ministries'>

// Ministerio con sus líderes ya cargados (para la vista combinada)
export type MinistryWithLeaders = Ministry & {
  leaders: {
    id: string          // id de la fila en leader_ministries
    person_id: string
    first_name: string
    last_name: string
    person_type: string
  }[]
}

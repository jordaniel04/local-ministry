import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Person = Tables<'people'>

export type PersonInsert = TablesInsert<'people'>

export type PersonUpdate = TablesUpdate<'people'>

export type PersonType = 'member' | 'believer' | 'visitor'

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

export type HolySpiritExperience = 'none' | 'sanctified' | 'baptized'

export const PERSON_TYPE_LABELS: Record<PersonType, string> = {
  member: 'Miembro',
  believer: 'Creyente',
  visitor: 'Visitante',
}

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: 'Soltero/a',
  married: 'Casado/a',
  divorced: 'Divorciado/a',
  widowed: 'Viudo/a',
}

export const HOLY_SPIRIT_LABELS: Record<HolySpiritExperience, string> = {
  none: 'Sin experiencia aún',
  sanctified: 'Santificado/a',
  baptized: 'Bautizado/a con el Espíritu Santo',
}

import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type ExpositionNote = Tables<'exposition_notes'>
export type ExpositionNoteInsert = TablesInsert<'exposition_notes'>
export type ExpositionNoteUpdate = TablesUpdate<'exposition_notes'>

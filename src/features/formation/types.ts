import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type FormationModule = Tables<'formation_modules'>
export type FormationModuleInsert = TablesInsert<'formation_modules'>
export type FormationModuleUpdate = TablesUpdate<'formation_modules'>

export type FormationLesson = Tables<'formation_lessons'>
export type FormationLessonInsert = TablesInsert<'formation_lessons'>
export type FormationLessonUpdate = TablesUpdate<'formation_lessons'>

export type LessonProgress = Tables<'person_lesson_progress'>
export type LessonProgressInsert = TablesInsert<'person_lesson_progress'>
export type LessonProgressUpdate = TablesUpdate<'person_lesson_progress'>

export type ModuleWithLessons = FormationModule & {
  formation_lessons: FormationLesson[]
}

export type LessonWithProgress = FormationLesson & {
  progress: LessonProgress | null
}

export type ModuleWithProgress = FormationModule & {
  lessons: LessonWithProgress[]
  completedCount: number
  totalCount: number
  averageScore: number | null
}

import type { Tables } from '@/types/supabase'

export type ClassSession = Tables<'class_sessions'>
export type Attendance = Tables<'attendance'>

export type AttendanceStatus = 'present' | 'absent' | 'justified' | 'late'

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Presente',
  absent: 'Ausente',
  justified: 'Justificado',
  late: 'Tarde',
}

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  justified: 'bg-yellow-100 text-yellow-800',
  late: 'bg-blue-100 text-blue-800',
}

export type SessionWithAttendance = ClassSession & {
  attendance: Attendance[]
  presentCount: number
  totalCount: number
}

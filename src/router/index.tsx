import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PeoplePage } from '@/pages/PeoplePage'
import { PersonDetailPage } from '@/pages/PersonDetailPage'
import { MinistriesPage } from '@/pages/MinistriesPage'
import { TasksPage } from '@/pages/TasksPage'
import { NotesPage } from '@/pages/NotesPage'
import { LeaderTrackingPage } from '@/pages/LeaderTrackingPage'
import { AttendancePage } from '@/pages/AttendancePage'
import { FormationPage } from '@/pages/FormationPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'people', element: <PeoplePage /> },
      { path: 'people/:id', element: <PersonDetailPage /> },
      { path: 'ministries', element: <MinistriesPage /> },
      { path: 'formation', element: <FormationPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'leader-tracking', element: <LeaderTrackingPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])

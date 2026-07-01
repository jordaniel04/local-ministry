import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Users, Church, BookOpen, ClipboardList, CalendarCheck, FileText, BarChart3, LogOut, HeartHandshake, Sun, Moon } from 'lucide-react'
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

export function AppLayout() {
  const navigate = useNavigate()
  const { isDark, toggle } = useThemeStore()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-16 md:w-56 flex flex-col border-r border-border bg-sidebar shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
          <span className="hidden md:block font-semibold text-sidebar-foreground tracking-wide">
            ESLIDER
          </span>
          <span className="md:hidden font-bold text-sidebar-foreground text-sm">ES</span>
        </div>

        {/* Nav */}
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
              <span className="hidden md:block">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Tema y logout */}
        <div className="p-2 border-t border-sidebar-border space-y-1">
          <button
            onClick={toggle}
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded-md text-sm w-full transition-colors',
              'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            <span className="hidden md:block">{isDark ? 'Tema claro' : 'Tema oscuro'}</span>
          </button>
          <button
            onClick={handleSignOut}
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded-md text-sm w-full transition-colors',
              'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden md:block">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

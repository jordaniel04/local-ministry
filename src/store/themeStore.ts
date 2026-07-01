import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeStore = {
  isDark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggle: () => {
        const next = !get().isDark
        document.documentElement.classList.toggle('dark', next)
        set({ isDark: next })
      },
    }),
    {
      name: 'eslider-theme',
      // Aplica la clase al cargar la página desde localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.isDark) {
          document.documentElement.classList.add('dark')
        }
      },
    }
  )
)

import { useCallback, useState } from 'react'

const STORAGE_KEY = 'eslider.active-formation-module'

export function useActiveFormationModule() {
  const [moduleId, setModuleId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))

  const updateModule = useCallback((nextModuleId: string | null) => {
    if (nextModuleId) localStorage.setItem(STORAGE_KEY, nextModuleId)
    else localStorage.removeItem(STORAGE_KEY)
    setModuleId(nextModuleId)
  }, [])

  return { activeModuleId: moduleId, setActiveModuleId: updateModule }
}

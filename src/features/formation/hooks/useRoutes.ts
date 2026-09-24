import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const db = supabase as any

export type FormationRoute = {
  id: string
  key: string
  name: string
  version: string
  scope: string
  is_active: boolean
}

export type RouteModule = { module_id: string; order_index: number }

export function useFormationRoutes() {
  return useQuery({
    queryKey: ['formation-routes'],
    queryFn: async (): Promise<FormationRoute[]> => {
      const { data, error } = await db.from('formation_routes')
        .select('id,key,name,version,scope,is_active')
        .order('name')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useRouteModules(routeId: string | null) {
  return useQuery({
    queryKey: ['formation-route-modules', routeId],
    enabled: Boolean(routeId),
    queryFn: async (): Promise<RouteModule[]> => {
      const { data, error } = await db.from('formation_route_modules')
        .select('module_id,order_index')
        .eq('route_id', routeId)
        .order('order_index')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateFormationRoute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { name: string; version: string }): Promise<FormationRoute> => {
      const { data, error } = await db.from('formation_routes')
        .insert({ key: `local-${crypto.randomUUID()}`, name: values.name.trim(), version: values.version.trim(), scope: 'local' })
        .select('id,key,name,version,scope,is_active')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-routes'] }),
  })
}

export function useUpdateFormationRoute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { id: string; name: string; version: string }) => {
      const { error } = await db.rpc('update_formation_route_details', {
        p_route_id: values.id,
        p_name: values.name.trim(),
        p_version: values.version.trim(),
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-routes'] }),
  })
}
export function useAddRouteModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { routeId: string; moduleId: string; orderIndex: number }) => {
      const { error } = await db.from('formation_route_modules')
        .insert({ route_id: values.routeId, module_id: values.moduleId, order_index: values.orderIndex })
      if (error) throw error
    },
    onSuccess: (_data, values) => queryClient.invalidateQueries({ queryKey: ['formation-route-modules', values.routeId] }),
  })
}

export function useRemoveRouteModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { routeId: string; moduleId: string }) => {
      const { error } = await db.from('formation_route_modules')
        .delete().eq('route_id', values.routeId).eq('module_id', values.moduleId)
      if (error) throw error
    },
    onSuccess: (_data, values) => queryClient.invalidateQueries({ queryKey: ['formation-route-modules', values.routeId] }),
  })
}

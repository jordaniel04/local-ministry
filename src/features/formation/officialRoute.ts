export type OfficialRouteModule = {
  key: string
  name: string
  description: string
  orderIndex: number
  aliases: string[]
}

export const OFFICIAL_ROUTE_MODULES: OfficialRouteModule[] = [
  {
    key: 'consolidado',
    name: 'Consolidado',
    description: 'Bases iniciales de fe, conversión, bautismo, membresía y evangelismo.',
    orderIndex: 0,
    aliases: ['consolidado', 'manual de consolidado'],
  },
  {
    key: 'discipulado-1',
    name: 'Discipulado I',
    description: 'Disciplinas espirituales y fundamentos de vida cristiana.',
    orderIndex: 1,
    aliases: ['discipulado i', 'discipulado 1', 'manual de discipulado 1'],
  },
  {
    key: 'discipulado-2',
    name: 'Discipulado II',
    description: 'Identidad, sexualidad, compromisos cristianos y mayordomía.',
    orderIndex: 2,
    aliases: ['discipulado ii', 'discipulado 2', 'manual de discipulado 2'],
  },
  {
    key: 'discipulado-3',
    name: 'Discipulado III',
    description: 'Carácter de Cristo, servicio, adoración, Espíritu Santo y pasión por las almas.',
    orderIndex: 3,
    aliases: ['discipulado iii', 'discipulado 3', 'manual de discipulado 3'],
  },
  {
    key: 'principios-biblicos-idp',
    name: 'Principios Bíblicos, Creencias y Prácticas de la IDP',
    description: 'Doctrina y práctica de la Iglesia de Dios de la Profecía.',
    orderIndex: 4,
    aliases: ['principios biblicos creencias y practicas de la idp'],
  },
  {
    key: 'historia-identidad-cogop-peru',
    name: 'Historia e Identidad COGOP - Perú',
    description: 'Historia, identidad institucional y legado ministerial.',
    orderIndex: 5,
    aliases: ['historia e identidad cogop peru'],
  },
  {
    key: 'un-siervo-de-dios',
    name: 'Un Siervo de Dios',
    description: 'Servicio, llamado, perfil y preparación ministerial.',
    orderIndex: 6,
    aliases: ['un siervo de dios'],
  },
  {
    key: 'leyes-liderazgo',
    name: 'Las 21 Leyes del Liderazgo',
    description: 'Principios generales de liderazgo.',
    orderIndex: 7,
    aliases: ['las 21 leyes del liderazgo', '21 leyes del liderazgo'],
  },
  {
    key: 'leyes-trabajo-equipo',
    name: 'Las 17 Leyes de Trabajo en Equipo',
    description: 'Trabajo en equipo y liderazgo colaborativo.',
    orderIndex: 8,
    aliases: ['las 17 leyes de trabajo en equipo', '17 leyes de trabajo en equipo'],
  },
]

export function normalizeRouteName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function matchesOfficialModule(moduleName: string, official: OfficialRouteModule) {
  const normalizedName = normalizeRouteName(moduleName)
  return official.aliases.some((alias) => normalizeRouteName(alias) === normalizedName)
}

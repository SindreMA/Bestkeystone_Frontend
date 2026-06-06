/* ============================================================
   KEYSTONE CONSOLE — shared data helpers for the Home redesign.
   Resolves specs / classes / dungeons from the live Vuex store and
   formats Cloudinary asset URLs. Keeps the new presentational
   components thin and consistent.
   ============================================================ */
import { useStore } from 'src/store'
import SF from 'src/SharedFunctions'
import { colors } from 'quasar'

const { rgbToHex } = colors

// The backend usually sends a hex `color` per class, but not always. Mirror the
// rest of the app (PlayerText / classTextColor / ClassFilter) and fall back to
// the static Class_Colors RGB map before giving up to a neutral grey.
function colorFromMap(data: any, className?: string): string | null {
  try {
    if (!className || !data.Class_Colors) return null
    const key = String(className).replace(/\s/g, '').toUpperCase()
    const rgb = data.Class_Colors[key]
    if (!rgb) return null
    return rgbToHex({ r: Math.round(rgb[0] * 255), g: Math.round(rgb[1] * 255), b: Math.round(rgb[2] * 255) })
  } catch (e) {
    return null
  }
}

// Roles come from the backend as TANK / HEALER / DAMAGE. The redesign
// labels DPS, so map the display label here in one place.
export function roleLabel(role?: string): string {
  const r = (role || '').toUpperCase()
  if (r === 'TANK') return 'Tank'
  if (r === 'HEALER') return 'Healer'
  if (r === 'DAMAGE' || r === 'DPS') return 'DPS'
  return role || ''
}

export function useKc() {
  const store = useStore()
  const data: any = store.state.data

  const specById = (id: number) => SF.GetSpec(data.Specs, id)
  const classById = (id: number) => SF.GetClass(data.Classes, id)

  // Robust class color: backend hex -> Class_Colors map -> neutral grey.
  const classColorForSpec = (specId: number): string => {
    const spec: any = specById(specId)
    if (!spec) return 'var(--kc-text-mid)'
    const cls: any = classById(spec.class ?? spec.Class)
    return cls?.color || colorFromMap(data, cls?.name) || 'var(--kc-text-mid)'
  }
  const classColorById = (classId: number): string => {
    const cls: any = classById(classId)
    return cls?.color || colorFromMap(data, cls?.name) || 'var(--kc-text-mid)'
  }

  const dungeonByKeystoneId = (id: number) => {
    const list: any[] = data.Dungeons || []
    return list.find((d) => d.keystone_id === id)
  }

  const cloud = (url?: string, size?: number, quality?: number) =>
    url ? SF.FormatToCloudinary(url, quality ?? 50, size ?? 64) : ''

  const fmtNum = (n: number | null | undefined) =>
    n == null ? '—' : Number(n).toLocaleString('en-US')

  return {
    store,
    data,
    specById,
    classById,
    classColorForSpec,
    classColorById,
    dungeonByKeystoneId,
    cloud,
    fmtNum,
    roleLabel,
  }
}

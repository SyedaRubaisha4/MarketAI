export type ClassValue = string | number | null | false | undefined | ClassValue[]

export function clsx(...inputs: ClassValue[]): string {
  const out: string[] = []
  const push = (v: ClassValue) => {
    if (!v) return
    if (Array.isArray(v)) { v.forEach(push); return }
    out.push(String(v))
  }
  inputs.forEach(push)
  return out.join(' ')
}

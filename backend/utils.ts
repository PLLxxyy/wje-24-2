export function toCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    result[camelKey] = obj[key]
  }
  return result
}

export function toCamelCaseArray(arr: Record<string, any>[]): Record<string, any>[] {
  return arr.map(toCamelCase)
}

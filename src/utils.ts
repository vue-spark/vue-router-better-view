export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function'
}

export function isNumber(value: any): value is number {
  return typeof value === 'number'
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

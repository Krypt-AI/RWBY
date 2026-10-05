import { useContext, type Context } from 'react'

export function useRequiredContext<T>(context: Context<T | null>, name: string): T {
  const value = useContext(context)
  if (value === null) throw new Error(`${name} must be used inside its provider`)
  return value
}

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

/** How long a notice stays up before it dismisses itself. */
const NOTICE_MS = 6_000

type Notice = { id: number; message: string }

type NoticeContextValue = {
  notice: Notice | null
  /** Shows a short message, e.g. why the server refused a change. */
  report: (error: unknown) => void
  dismiss: () => void
}

export const NoticeContext = createContext<NoticeContextValue | null>(null)

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : typeof error === 'string' ? error : 'Something went wrong. Try again.'

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), NOTICE_MS)
    return () => window.clearTimeout(timer)
  }, [notice])

  const report = useCallback((error: unknown) => {
    setNotice(current => ({ id: (current?.id ?? 0) + 1, message: messageOf(error) }))
  }, [])

  const dismiss = useCallback(() => setNotice(null), [])

  const value = useMemo(() => ({ notice, report, dismiss }), [notice, report, dismiss])

  return <NoticeContext.Provider value={value}>{children}</NoticeContext.Provider>
}

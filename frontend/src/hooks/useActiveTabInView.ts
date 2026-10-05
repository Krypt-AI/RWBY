import { useEffect, useRef } from 'react'

/**
 * Keeps the active link of a sideways-scrolling tab strip visible.
 * Scrolls the strip only, never the page.
 */
export function useActiveTabInView<T extends HTMLElement>(activeKey: string | undefined) {
  const stripRef = useRef<T>(null)

  useEffect(() => {
    const strip = stripRef.current
    const active = strip?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!strip || !active) return
    const offset = active.getBoundingClientRect().left - strip.getBoundingClientRect().left
    strip.scrollLeft += offset - (strip.clientWidth - active.offsetWidth) / 2
  }, [activeKey])

  return stripRef
}

import { SiteContext } from '../lib/SiteContext'
import { useRequiredContext } from './useRequiredContext'

export const useSite = () => useRequiredContext(SiteContext, 'useSite')

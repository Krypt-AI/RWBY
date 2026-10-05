import { ViewerContext } from '../lib/ViewerContext'
import { useRequiredContext } from './useRequiredContext'

export const useViewer = () => useRequiredContext(ViewerContext, 'useViewer')

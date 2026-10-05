import { ModeContext } from '../lib/ModeContext'
import { useRequiredContext } from './useRequiredContext'

export const useMode = () => useRequiredContext(ModeContext, 'useMode')

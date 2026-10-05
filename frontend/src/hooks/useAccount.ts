import { AccountContext } from '../lib/AccountContext'
import { useRequiredContext } from './useRequiredContext'

export const useAccount = () => useRequiredContext(AccountContext, 'useAccount')

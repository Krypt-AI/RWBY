import { NoticeContext } from '../lib/NoticeContext'
import { useRequiredContext } from './useRequiredContext'

export const useNotice = () => useRequiredContext(NoticeContext, 'useNotice')

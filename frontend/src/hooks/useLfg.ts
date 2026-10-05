import type { LfgPost } from '../lib/types'
import { useSite } from './useSite'
import { useViewer } from './useViewer'

export type LfgDraft = Omit<LfgPost, 'id' | 'joined' | 'at' | 'author' | 'authorId'>

/** The Squad board plus the current viewer's relationship to each post. */
export function useLfg() {
  const { state, dispatch } = useSite()
  const viewer = useViewer()

  const isJoined = (post: LfgPost) => viewer.joinedPosts.includes(post.id)
  const isOwn = (post: LfgPost) => post.authorId === viewer.id
  const isFull = (post: LfgPost) => post.joined >= post.slots

  const toggleJoin = (post: LfgPost) => {
    const joining = !isJoined(post)
    if (isOwn(post) || (joining && isFull(post))) return
    dispatch({ type: 'lfg/join', id: post.id, joining })
    viewer.toggleJoinedPost(post.id)
  }

  const publish = (draft: LfgDraft) =>
    dispatch({ type: 'lfg/post', post: { ...draft, author: viewer.name, authorId: viewer.id } })

  const remove = (post: LfgPost) => {
    if (isOwn(post)) dispatch({ type: 'lfg/remove', id: post.id })
  }

  return { posts: state.lfg, isJoined, isOwn, isFull, toggleJoin, publish, remove }
}

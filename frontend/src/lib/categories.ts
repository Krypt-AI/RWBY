import type { Accent, Category } from './types'

type CategoryMeta = {
  label: string
  plural: string
  /** Team colour used as the category accent (see tokens.css). */
  accent: Accent
  blurb: string
}

export const CATEGORIES: Category[] = ['game', 'music', 'anime', 'manga', 'movie']

/** Where /votes lands. */
export const DEFAULT_CATEGORY: Category = 'game'

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  game: { label: 'Game', plural: 'Games', accent: 'blake', blurb: 'Pick what the squad plays on the next game night.' },
  music: { label: 'Music', plural: 'Music', accent: 'nora', blurb: 'Crown the song of the week for the shared playlist.' },
  anime: { label: 'Anime', plural: 'Anime', accent: 'ruby', blurb: 'Pick the next series we watch together on stream.' },
  manga: { label: 'Manga', plural: 'Manga', accent: 'weiss', blurb: 'Choose the next read for the book-club nights.' },
  movie: { label: 'Movie', plural: 'Movies', accent: 'yang', blurb: 'Vote for the feature film on movie night.' },
}

export function isCategory(value: string | undefined): value is Category {
  return CATEGORIES.includes(value as Category)
}

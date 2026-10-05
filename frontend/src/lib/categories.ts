import type { Accent, Category } from './types'

type CategoryMeta = {
  label: string
  plural: string
  /** Team colour used as the category accent (see tokens.css). */
  accent: Accent
  blurb: string
}

export const CATEGORIES: Category[] = ['game', 'music', 'anime', 'movie']

/** Where /votes lands. */
export const DEFAULT_CATEGORY: Category = 'game'

/** The poll whose options come from the current anime season (see services/seasonalAnime.ts). */
export const SEASONAL_CATEGORY: Category = 'anime'

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  game: { label: 'Game', plural: 'Games', accent: 'blake', blurb: 'Pick what the squad plays on the next game night.' },
  music: { label: 'Music', plural: 'Music', accent: 'nora', blurb: 'Crown the song of the week for the shared playlist.' },
  anime: {
    label: 'Anime',
    plural: 'Seasonal anime',
    accent: 'ruby',
    blurb: 'Crown the best show airing this season. The lineup changes with every anime season.',
  },
  movie: { label: 'Movie', plural: 'Movies', accent: 'yang', blurb: 'Vote for the feature film on movie night.' },
}

export function isCategory(value: string | undefined): value is Category {
  return CATEGORIES.includes(value as Category)
}

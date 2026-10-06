import type { Category, TeamMember } from './types'

type CategoryMeta = {
  label: string
  plural: string
  /** The member lit beside the poll (see VotesPage); her colour is the category accent. */
  accent: TeamMember
  blurb: string
}

/** In this order the members run Ruby, Weiss, Blake, Yang, so the vote tabs walk along the team. */
export const CATEGORIES: Category[] = ['game', 'music', 'anime', 'movie']

/** Where /votes lands. */
export const DEFAULT_CATEGORY: Category = 'game'

/** The poll whose options come from the current anime season (see services/seasonalAnime.ts). */
export const SEASONAL_CATEGORY: Category = 'anime'

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  game: { label: 'Game', plural: 'Games', accent: 'ruby', blurb: 'Pick what the squad plays on the next game night.' },
  music: { label: 'Music', plural: 'Music', accent: 'weiss', blurb: 'Crown the song of the week for the shared playlist.' },
  anime: {
    label: 'Anime',
    plural: 'Seasonal anime',
    accent: 'blake',
    blurb: 'Crown the best show airing this season. The lineup changes with every anime season.',
  },
  movie: { label: 'Movie', plural: 'Movies', accent: 'yang', blurb: 'Vote for the feature film on movie night.' },
}

export function isCategory(value: string | undefined): value is Category {
  return CATEGORIES.includes(value as Category)
}

function parseUrl(rawUrl: string): { url: URL; host: string } | null {
  try {
    const url = new URL(rawUrl.trim())
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return { url, host: url.hostname.replace(/^www\./, '') }
  } catch {
    return null
  }
}

const isYouTubeHost = (host: string) => host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com'

/** True for http(s) links, which are the only links we render as anchors. */
export const isWebUrl = (rawUrl: string) => parseUrl(rawUrl) !== null

/**
 * Turns a YouTube or Twitch link into an embeddable player URL.
 * Returns null for links we don't know how to embed.
 */
export function toEmbedUrl(rawUrl: string, hostname = window.location.hostname): string | null {
  const parsed = parseUrl(rawUrl)
  if (!parsed) return null
  const { url, host } = parsed

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1)
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null
  }

  if (isYouTubeHost(host)) {
    const id = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:live|embed|shorts)\/([\w-]+)/)?.[1]
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null
  }

  if (host === 'twitch.tv' || host === 'm.twitch.tv') {
    const channel = url.pathname.split('/').filter(Boolean)[0]
    return channel ? `https://player.twitch.tv/?channel=${channel}&parent=${hostname}` : null
  }

  return null
}

/**
 * Turns a Spotify playlist/album/track link or a YouTube playlist link into
 * an embeddable player URL. Returns null for anything else.
 */
export function toPlaylistEmbedUrl(rawUrl: string): string | null {
  const parsed = parseUrl(rawUrl)
  if (!parsed) return null
  const { url, host } = parsed

  if (host === 'open.spotify.com') {
    const match = url.pathname.match(/\/(playlist|album|track)\/([A-Za-z0-9]+)/)
    return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : null
  }

  if (isYouTubeHost(host)) {
    const list = url.searchParams.get('list')
    return list ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(list)}` : null
  }

  return null
}

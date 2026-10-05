import assert from 'node:assert/strict'
import { before, describe, test } from 'node:test'
import { randomUUID } from 'node:crypto'
import { createDatabase } from './database.mjs'

describe('chat', () => {
  let db
  before(async () => {
    db = await createDatabase()
  })

  test('stores the message under the client id and the sender profile name', async () => {
    const member = await db.signUp({ name: 'Blake' })
    const id = randomUUID()
    await member.rpc('send_chat_message', { p_id: id, p_text: '  On my way  ' })
    const [message] = await db.admin(`select * from public.chat_messages where id = $1`, [id])
    assert.equal(message.author_name, 'Blake')
    assert.equal(message.author_id, member.id)
    assert.equal(message.text, 'On my way')
  })

  test('only moderators can post with the Mod badge', async () => {
    const member = await db.signUp()
    const moderator = await db.signUp({ moderator: true })
    const memberId = randomUUID()
    const moderatorId = randomUUID()
    await member.rpc('send_chat_message', { p_id: memberId, p_text: 'hi', p_as_moderator: true })
    await moderator.rpc('send_chat_message', { p_id: moderatorId, p_text: 'hi', p_as_moderator: true })
    const rows = await db.admin(
      `select id, from_moderator from public.chat_messages where id in ($1, $2)`,
      [memberId, moderatorId],
    )
    const badge = Object.fromEntries(rows.map(row => [row.id, row.from_moderator]))
    assert.equal(badge[memberId], false)
    assert.equal(badge[moderatorId], true)
  })

  test('rejects empty and overlong messages', async () => {
    const member = await db.signUp()
    await assert.rejects(member.rpc('send_chat_message', { p_id: null, p_text: '   ' }), /Message can't be empty/)
    await assert.rejects(
      member.rpc('send_chat_message', { p_id: null, p_text: 'x'.repeat(281) }),
      /at most 280 characters/,
    )
  })

  test('keeps only the newest 200 messages', async () => {
    const member = await db.signUp()
    for (let index = 0; index < 205; index++) {
      await member.rpc('send_chat_message', { p_id: null, p_text: `message ${index}` })
    }
    const [{ count }] = await db.admin(`select count(*)::int as count from public.chat_messages`)
    assert.equal(count, 200)
    const [oldest] = await db.admin(`select text from public.chat_messages order by created_at limit 1`)
    assert.equal(oldest.text, 'message 5')
  })
})

describe('polls', () => {
  let db
  let options
  before(async () => {
    db = await createDatabase()
    options = await db.admin(`select id from public.poll_options where category = 'movie' order by created_at`)
  })

  const votes = async id => (await db.admin(`select votes from public.poll_options where id = $1`, [id]))[0].votes

  test('counts one ballot per member and moves it when they change their vote', async () => {
    const [first, second] = options
    const voter = await db.signUp()
    await voter.rpc('cast_vote', { p_category: 'movie', p_option_id: first.id })
    await voter.rpc('cast_vote', { p_category: 'movie', p_option_id: first.id })
    assert.equal(await votes(first.id), 1)

    await voter.rpc('cast_vote', { p_category: 'movie', p_option_id: second.id })
    assert.equal(await votes(first.id), 0)
    assert.equal(await votes(second.id), 1)
  })

  test('rejects votes for options from another poll', async () => {
    const voter = await db.signUp()
    const [gameOption] = await db.admin(`select id from public.poll_options where category = 'game' limit 1`)
    await assert.rejects(
      voter.rpc('cast_vote', { p_category: 'movie', p_option_id: gameOption.id }),
      /no longer in the poll/,
    )
  })

  test('closed polls refuse votes until reopened', async () => {
    const moderator = await db.signUp({ moderator: true })
    const voter = await db.signUp()
    await moderator.rpc('update_poll', { p_category: 'movie', p_is_open: false })
    await assert.rejects(
      voter.rpc('cast_vote', { p_category: 'movie', p_option_id: options[2].id }),
      /Voting is closed/,
    )
    await moderator.rpc('update_poll', { p_category: 'movie', p_is_open: true })
    await voter.rpc('cast_vote', { p_category: 'movie', p_option_id: options[2].id })
  })

  test('resetting votes clears ballots and starts a new round', async () => {
    const moderator = await db.signUp({ moderator: true })
    await moderator.rpc('reset_poll_votes', { p_category: 'movie' })
    const [poll] = await db.admin(`select round from public.polls where category = 'movie'`)
    const [{ total }] = await db.admin(
      `select coalesce(sum(votes), 0)::int as total from public.poll_options where category = 'movie'`,
    )
    const [{ ballots }] = await db.admin(`select count(*)::int as ballots from public.ballots where category = 'movie'`)
    assert.equal(poll.round, 2)
    assert.equal(total, 0)
    assert.equal(ballots, 0)
  })

  test('starting an anime season replaces the lineup in order and opens a new round', async () => {
    const moderator = await db.signUp({ moderator: true })
    const shows = [
      { title: 'Frieren', note: 'Season 2 · Madhouse' },
      { title: 'Dandadan', note: 'Season 3 · Science SARU' },
    ]
    await moderator.rpc('start_anime_season', {
      p_year: 2027,
      p_season: 'winter',
      p_title: 'Anime of the season · Winter 2027',
      p_shows: JSON.stringify(shows),
    })
    const [poll] = await db.admin(`select * from public.polls where category = 'anime'`)
    const lineup = await db.admin(
      `select title, note from public.poll_options where category = 'anime' order by created_at`,
    )
    assert.equal(poll.season_year, 2027)
    assert.equal(poll.season_name, 'winter')
    assert.equal(poll.round, 2)
    assert.equal(poll.is_open, true)
    assert.deepEqual(lineup, shows)
  })
})

describe('squad board', () => {
  let db
  before(async () => {
    db = await createDatabase()
  })

  const post = async (author, slots = 2) => {
    const id = randomUUID()
    await author.rpc('post_lfg', {
      p_id: id,
      p_game: 'mlbb',
      p_mode: 'Ranked',
      p_rank: 'Mythic',
      p_roles: ['Roam'],
      p_slots: slots,
      p_note: 'Voice on',
    })
    return id
  }
  const joined = async id => (await db.admin(`select joined from public.lfg_posts where id = $1`, [id]))[0].joined

  test('joins fill the open spots and refuse once the squad is full', async () => {
    const author = await db.signUp()
    const id = await post(author, 2)
    const [first, second, third] = [await db.signUp(), await db.signUp(), await db.signUp()]

    await first.rpc('set_lfg_join', { p_post_id: id, p_joining: true })
    await first.rpc('set_lfg_join', { p_post_id: id, p_joining: true })
    await second.rpc('set_lfg_join', { p_post_id: id, p_joining: true })
    assert.equal(await joined(id), 2)
    await assert.rejects(third.rpc('set_lfg_join', { p_post_id: id, p_joining: true }), /already full/)

    await first.rpc('set_lfg_join', { p_post_id: id, p_joining: false })
    assert.equal(await joined(id), 1)
  })

  test('authors cannot join their own squad', async () => {
    const author = await db.signUp()
    const id = await post(author)
    await assert.rejects(author.rpc('set_lfg_join', { p_post_id: id, p_joining: true }), /your own squad/)
  })

  test('only the author or a moderator can remove a post', async () => {
    const author = await db.signUp()
    const stranger = await db.signUp()
    const moderator = await db.signUp({ moderator: true })
    const first = await post(author)
    const second = await post(author)

    await assert.rejects(stranger.rpc('remove_lfg_post', { p_post_id: first }), /Only the author or a moderator/)
    await author.rpc('remove_lfg_post', { p_post_id: first })
    await moderator.rpc('remove_lfg_post', { p_post_id: second })
    const left = await db.admin(`select id from public.lfg_posts where id in ($1, $2)`, [first, second])
    assert.deepEqual(left, [])
  })
})

describe('music queue', () => {
  let db
  before(async () => {
    db = await createDatabase()
  })

  test('counts one like per member', async () => {
    const adder = await db.signUp({ name: 'Nora' })
    const id = randomUUID()
    await adder.rpc('add_track', { p_id: id, p_title: 'Boop', p_artist: 'Jeff Williams', p_url: '' })
    const fans = [await db.signUp(), await db.signUp()]
    for (const fan of fans) {
      await fan.rpc('set_track_like', { p_track_id: id, p_liking: true })
      await fan.rpc('set_track_like', { p_track_id: id, p_liking: true })
    }
    await fans[0].rpc('set_track_like', { p_track_id: id, p_liking: false })

    const [track] = await db.admin(`select likes, added_by from public.tracks where id = $1`, [id])
    assert.deepEqual(track, { likes: 1, added_by: 'Nora' })
  })

  test('only moderators remove songs or change the playlist', async () => {
    const member = await db.signUp()
    const [track] = await db.admin(`select id from public.tracks limit 1`)
    await assert.rejects(member.rpc('remove_track', { p_id: track.id }), /Only moderators/)
    await assert.rejects(member.rpc('update_playlist', { p_url: 'https://open.spotify.com/x' }), /Only moderators/)
  })
})

describe('schedule', () => {
  let db
  before(async () => {
    db = await createDatabase()
  })

  test('members RSVP and cancel; removed sessions refuse RSVPs', async () => {
    const member = await db.signUp()
    const moderator = await db.signUp({ moderator: true })
    const id = randomUUID()
    await moderator.rpc('add_session', {
      p_id: id,
      p_title: 'Movie night',
      p_category: 'movie',
      p_starts_at: '2026-10-09T13:00:00Z',
    })

    await member.rpc('set_rsvp', { p_session_id: id, p_going: true })
    assert.equal((await member.query(`select * from public.rsvps`)).length, 1)
    await member.rpc('set_rsvp', { p_session_id: id, p_going: false })
    assert.equal((await member.query(`select * from public.rsvps`)).length, 0)

    await moderator.rpc('remove_session', { p_id: id })
    await assert.rejects(member.rpc('set_rsvp', { p_session_id: id, p_going: true }), /removed from the schedule/)
  })

  test('members cannot add sessions', async () => {
    const member = await db.signUp()
    await assert.rejects(
      member.rpc('add_session', {
        p_id: null,
        p_title: 'Sneaky',
        p_category: 'game',
        p_starts_at: '2026-10-09T13:00:00Z',
      }),
      /Only moderators/,
    )
  })
})

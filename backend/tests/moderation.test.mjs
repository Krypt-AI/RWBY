import assert from 'node:assert/strict'
import { before, describe, test } from 'node:test'
import { randomUUID } from 'node:crypto'
import { createDatabase } from './database.mjs'

describe('moderator controls', () => {
  let db
  let moderator
  let member
  before(async () => {
    db = await createDatabase()
    moderator = await db.signUp({ moderator: true })
    member = await db.signUp()
  })

  const settings = async () => (await db.admin(`select * from public.site_settings`))[0]

  test('members are refused every moderator action', async () => {
    const calls = [
      ['update_announcement', { p_text: 'hi' }],
      ['update_stream', { p_is_live: true }],
      ['clear_chat', {}],
      ['update_poll', { p_category: 'game', p_title: 'Mine now' }],
      ['add_poll_option', { p_id: null, p_category: 'game', p_title: 'Tetris', p_note: '' }],
      ['reset_poll_votes', { p_category: 'game' }],
      ['clear_lfg', {}],
      ['reset_site', { p_time_zone: 'UTC' }],
    ]
    for (const [fn, args] of calls) {
      await assert.rejects(member.rpc(fn, args), /Only moderators can do that/, fn)
    }
  })

  test('updating one field leaves the others as they were', async () => {
    const before = await settings()
    await moderator.rpc('update_announcement', { p_visible: false })
    await moderator.rpc('update_stream', { p_is_live: true })
    const after = await settings()
    assert.equal(after.announcement_text, before.announcement_text)
    assert.equal(after.announcement_visible, false)
    assert.equal(after.stream_title, before.stream_title)
    assert.equal(after.stream_is_live, true)

    await moderator.rpc('update_stream', { p_title: 'Movie Night', p_host: '', p_url: 'https://twitch.tv/beacon' })
    const renamed = await settings()
    assert.equal(renamed.stream_title, 'Movie Night')
    assert.equal(renamed.stream_host, '')
    assert.equal(renamed.stream_is_live, true)
  })

  test('pins one chat message at a time and unpins on a second toggle', async () => {
    const [first, second] = [randomUUID(), randomUUID()]
    await member.rpc('send_chat_message', { p_id: first, p_text: 'first' })
    await member.rpc('send_chat_message', { p_id: second, p_text: 'second' })
    const pinned = async () =>
      (await db.admin(`select id from public.chat_messages where pinned`)).map(row => row.id)

    await moderator.rpc('toggle_chat_pin', { p_id: first })
    assert.deepEqual(await pinned(), [first])
    await moderator.rpc('toggle_chat_pin', { p_id: second })
    assert.deepEqual(await pinned(), [second])
    await moderator.rpc('toggle_chat_pin', { p_id: second })
    assert.deepEqual(await pinned(), [])
  })

  test('removing a poll option also removes its ballots', async () => {
    const id = randomUUID()
    await moderator.rpc('add_poll_option', { p_id: id, p_category: 'game', p_title: 'Tetris', p_note: 'Classic' })
    await member.rpc('cast_vote', { p_category: 'game', p_option_id: id })
    await moderator.rpc('remove_poll_option', { p_option_id: id })
    assert.equal((await member.query(`select * from public.ballots where category = 'game'`)).length, 0)
  })

  test('resetting the site restores the starter content and keeps accounts', async () => {
    await member.rpc('send_chat_message', { p_id: null, p_text: 'still here?' })
    await moderator.rpc('clear_lfg')
    await moderator.rpc('reset_site', { p_time_zone: 'Asia/Kuala_Lumpur' })

    const [{ chat }] = await db.admin(`select count(*)::int as chat from public.chat_messages`)
    const [{ posts }] = await db.admin(`select count(*)::int as posts from public.lfg_posts`)
    const [{ profiles }] = await db.admin(`select count(*)::int as profiles from public.profiles`)
    assert.equal(chat, 0)
    assert.equal(posts, 2)
    assert.equal(profiles, 2)
    assert.equal((await settings()).stream_title, 'Friday Squad Night')

    // Seeded sessions land at 21:00 in the moderator's time zone.
    const [session] = await db.admin(
      `select to_char(starts_at at time zone 'Asia/Kuala_Lumpur', 'HH24:MI') as local
       from public.sessions where title = 'MLBB 5-stack customs'`,
    )
    assert.equal(session.local, '21:00')
  })

  test('an unknown time zone falls back to UTC', async () => {
    await moderator.rpc('reset_site', { p_time_zone: 'Remnant/Vale' })
    const [session] = await db.admin(
      `select to_char(starts_at at time zone 'UTC', 'HH24:MI') as local
       from public.sessions where title = 'MLBB 5-stack customs'`,
    )
    assert.equal(session.local, '21:00')
  })
})

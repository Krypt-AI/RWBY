import assert from 'node:assert/strict'
import { beforeEach, describe, test } from 'node:test'
import { createDatabase } from './database.mjs'

describe('game rooms', () => {
  let db
  beforeEach(async () => {
    db = await createDatabase()
  })

  const members = async game =>
    (await db.admin(`select name from public.room_members where game = $1 order by joined_at`, [game])).map(
      row => row.name,
    )
  const picks = async game =>
    (await db.admin(`select hero from public.room_enemy_picks where game = $1 order by picked_at`, [game])).map(
      row => row.hero,
    )

  test('seats five, in join order, and joining twice is a no-op', async () => {
    const players = []
    for (const name of ['Ruby', 'Weiss', 'Blake', 'Yang', 'Jaune']) {
      const player = await db.signUp({ name })
      await player.rpc('join_room', { p_game: 'valorant' })
      players.push(player)
    }
    await players[0].rpc('join_room', { p_game: 'valorant' })
    assert.deepEqual(await members('valorant'), ['Ruby', 'Weiss', 'Blake', 'Yang', 'Jaune'])

    const late = await db.signUp({ name: 'Pyrrha' })
    await assert.rejects(late.rpc('join_room', { p_game: 'valorant' }), /The room is full/)

    await players[4].rpc('leave_room', { p_game: 'valorant' })
    await late.rpc('join_room', { p_game: 'valorant' })
    assert.deepEqual(await members('valorant'), ['Ruby', 'Weiss', 'Blake', 'Yang', 'Pyrrha'])
  })

  test('only members and moderators set the start time and the enemy draft', async () => {
    const member = await db.signUp()
    const outsider = await db.signUp()
    const moderator = await db.signUp({ moderator: true })
    await member.rpc('join_room', { p_game: 'mlbb' })

    await member.rpc('set_room_start', { p_game: 'mlbb', p_starts_at: '2026-10-07T13:00:00Z' })
    await assert.rejects(
      outsider.rpc('set_room_start', { p_game: 'mlbb', p_starts_at: null }),
      /Join the room to change it/,
    )
    await assert.rejects(outsider.rpc('pick_enemy', { p_game: 'mlbb', p_hero: 'Fanny' }), /Join the room/)
    await moderator.rpc('pick_enemy', { p_game: 'mlbb', p_hero: 'Fanny' })

    const [room] = await db.admin(`select starts_at from public.game_rooms where game = 'mlbb'`)
    assert.equal(room.starts_at.toISOString(), '2026-10-07T13:00:00.000Z')
    assert.deepEqual(await picks('mlbb'), ['Fanny'])
  })

  test('keeps the enemy draft in pick order, without repeats, up to five heroes', async () => {
    const member = await db.signUp()
    await member.rpc('join_room', { p_game: 'mlbb' })
    for (const hero of ['Fanny', 'Ling', 'Fanny', 'Tigreal', 'Lunox', 'Beatrix']) {
      await member.rpc('pick_enemy', { p_game: 'mlbb', p_hero: hero })
    }
    await assert.rejects(member.rpc('pick_enemy', { p_game: 'mlbb', p_hero: 'Chou' }), /already has 5 picks/)
    assert.deepEqual(await picks('mlbb'), ['Fanny', 'Ling', 'Tigreal', 'Lunox', 'Beatrix'])

    await member.rpc('unpick_enemy', { p_game: 'mlbb', p_hero: 'Ling' })
    await member.rpc('pick_enemy', { p_game: 'mlbb', p_hero: 'Chou' })
    assert.deepEqual(await picks('mlbb'), ['Fanny', 'Tigreal', 'Lunox', 'Beatrix', 'Chou'])

    await member.rpc('clear_enemy_picks', { p_game: 'mlbb' })
    assert.deepEqual(await picks('mlbb'), [])
  })

  test('moderators reset a room to empty', async () => {
    const moderator = await db.signUp({ moderator: true })
    const member = await db.signUp()
    await member.rpc('join_room', { p_game: 'mlbb' })
    await member.rpc('pick_enemy', { p_game: 'mlbb', p_hero: 'Fanny' })

    await assert.rejects(member.rpc('reset_room', { p_game: 'mlbb' }), /Only moderators/)
    await moderator.rpc('reset_room', { p_game: 'mlbb' })

    const [room] = await db.admin(`select starts_at from public.game_rooms where game = 'mlbb'`)
    assert.equal(room.starts_at, null)
    assert.deepEqual(await members('mlbb'), [])
    assert.deepEqual(await picks('mlbb'), [])
  })
})

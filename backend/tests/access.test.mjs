import assert from 'node:assert/strict'
import { before, describe, test } from 'node:test'
import { createDatabase } from './database.mjs'

describe('accounts', () => {
  let db
  before(async () => {
    db = await createDatabase()
  })

  test('first sign-in creates a member profile from the Discord details', async () => {
    const member = await db.signUp({ name: 'Ruby Rose' })
    const [profile] = await db.admin(`select * from public.profiles where id = $1`, [member.id])
    assert.equal(profile.display_name, 'Ruby Rose')
    assert.equal(profile.role, 'member')
    assert.match(profile.avatar_url, /^https:/)
  })

  test('prefers the Discord global name and trims long names to 24 characters', async () => {
    const [user] = await db.admin(
      `insert into auth.users (raw_user_meta_data) values ($1::jsonb) returning id`,
      [JSON.stringify({ name: 'ruby_rose', custom_claims: { global_name: 'Ruby the Reaper of Patch Seven' } })],
    )
    const [profile] = await db.admin(`select display_name from public.profiles where id = $1`, [user.id])
    assert.equal(profile.display_name, 'Ruby the Reaper of Patch')
  })

  test('members can rename themselves but not promote themselves', async () => {
    const member = await db.signUp()
    await member.rpc('update_display_name', { p_name: '  Crescent Rose  ' })
    const [profile] = await member.query(`select display_name, role from public.profiles where id = $1`, [member.id])
    assert.deepEqual(profile, { display_name: 'Crescent Rose', role: 'member' })

    await assert.rejects(
      member.query(`update public.profiles set role = 'moderator' where id = $1`, [member.id]),
      /permission denied/,
    )
    await assert.rejects(member.rpc('update_display_name', { p_name: '   ' }), /Name can't be empty/)
  })
})

describe('table access', () => {
  let db
  before(async () => {
    db = await createDatabase()
  })

  test('visitors can read community content without signing in', async () => {
    const [settings] = await db.visitor.query(`select stream_title from public.site_settings`)
    assert.equal(settings.stream_title, 'Friday Squad Night')
    const polls = await db.visitor.query(`select category from public.polls`)
    assert.equal(polls.length, 4)
  })

  test('nobody writes tables directly, not even moderators', async () => {
    const moderator = await db.signUp({ moderator: true })
    for (const caller of [db.visitor, moderator]) {
      await assert.rejects(caller.query(`update public.site_settings set stream_is_live = true`), /permission denied/)
      await assert.rejects(
        caller.query(`insert into public.chat_messages (author_name, text) values ('x', 'y')`),
        /permission denied/,
      )
      await assert.rejects(caller.query(`delete from public.tracks`), /permission denied/)
    }
  })

  test('visitors cannot call the API', async () => {
    await assert.rejects(db.visitor.rpc('send_chat_message', { p_id: null, p_text: 'hi' }), /permission denied/)
  })

  test('the private helpers are out of reach', async () => {
    const member = await db.signUp()
    await assert.rejects(member.query(`select private.seed_site('UTC')`), /permission denied/)
  })

  test('ballots, RSVPs, joins and likes are visible only to their owner', async () => {
    const voter = await db.signUp()
    const other = await db.signUp()
    const [option] = await db.admin(`select id from public.poll_options where category = 'game' limit 1`)
    await voter.rpc('cast_vote', { p_category: 'game', p_option_id: option.id })

    assert.equal((await voter.query(`select * from public.ballots`)).length, 1)
    assert.equal((await other.query(`select * from public.ballots`)).length, 0)
    assert.equal((await db.visitor.query(`select * from public.ballots`)).length, 0)
    // The total stays public.
    const [tally] = await db.visitor.query(`select votes from public.poll_options where id = $1`, [option.id])
    assert.equal(tally.votes, 1)
  })

  test('every public table has row-level security on and is in the realtime feed', async () => {
    const unsecured = await db.admin(
      `select relname from pg_class
       where relnamespace = 'public'::regnamespace and relkind = 'r' and not relrowsecurity`,
    )
    assert.deepEqual(unsecured, [])

    const unpublished = await db.admin(
      `select relname from pg_class c
       where relnamespace = 'public'::regnamespace and relkind = 'r'
         and not exists (select 1 from pg_publication_tables p
                         where p.pubname = 'supabase_realtime' and p.tablename = c.relname)`,
    )
    assert.deepEqual(unpublished, [])
  })
})

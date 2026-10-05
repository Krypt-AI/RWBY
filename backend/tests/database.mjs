import { readdir, readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const STUB = new URL('./supabase-stub.sql', import.meta.url)
const MIGRATIONS = new URL('../../database/supabase/migrations/', import.meta.url)

const readSql = url => readFile(url, 'utf8')

/**
 * A fresh Postgres with the real migrations applied and the starter content seeded.
 * Calls run as Supabase would run them: as the `anon` or `authenticated` role, with the
 * caller's id in the JWT claims, so row-level security and grants apply.
 */
export async function createDatabase() {
  const pg = new PGlite()
  await pg.exec(await readSql(STUB))
  const files = (await readdir(MIGRATIONS)).filter(name => name.endsWith('.sql')).sort()
  for (const file of files) await pg.exec(await readSql(new URL(file, MIGRATIONS)))
  await pg.query(`select private.seed_site('UTC')`)
  return new TestDatabase(pg)
}

class TestDatabase {
  #pg
  #users = 0

  constructor(pg) {
    this.#pg = pg
  }

  /** Runs SQL as the database owner, past every policy. For setup and checks. */
  async admin(sql, params = []) {
    return (await this.#pg.query(sql, params)).rows
  }

  /** A visitor who isn't signed in. */
  get visitor() {
    return new Caller(this.#pg, 'anon', null)
  }

  /** Signs up a new user the way Discord sign-in does, and returns a caller acting as them. */
  async signUp({ name = `Member ${++this.#users}`, moderator = false } = {}) {
    const [user] = await this.admin(
      `insert into auth.users (raw_user_meta_data) values ($1::jsonb) returning id`,
      [JSON.stringify({ full_name: name, avatar_url: 'https://cdn.discordapp.com/avatar.png' })],
    )
    if (moderator) await this.admin(`update public.profiles set role = 'moderator' where id = $1`, [user.id])
    return new Caller(this.#pg, 'authenticated', user.id)
  }
}

class Caller {
  #pg
  #role
  #claims

  constructor(pg, role, userId) {
    this.#pg = pg
    this.#role = role
    this.#claims = JSON.stringify(userId ? { sub: userId, role } : { role })
    this.id = userId
  }

  /** Calls an API function with named arguments, like supabase.rpc(). */
  rpc(fn, args = {}) {
    const names = Object.keys(args)
    const list = names.map((name, index) => `${name} => $${index + 1}`).join(', ')
    return this.query(`select public.${fn}(${list})`, names.map(name => args[name]))
  }

  /** Runs SQL as this caller, inside a transaction like an API request. */
  query(sql, params = []) {
    return this.#pg.transaction(async tx => {
      await tx.query(`set local role ${this.#role}`)
      await tx.query(`select set_config('request.jwt.claims', $1, true)`, [this.#claims])
      return (await tx.query(sql, params)).rows
    })
  }
}

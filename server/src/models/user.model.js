import { getPool } from '../config/db.js'

export const createUser = async ({ id, username, email, password }) => {
  const pool = getPool()
  const result = await pool.query(
    `INSERT INTO users (id, username, email, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, avatar, is_admin, created_at`,
    [id, username, email, password]
  )
  return result.rows[0]
}

export const findUserByEmail = async (email) => {
  const pool = getPool()
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  )
  return result.rows[0]
}

export const findUserByUsername = async (username) => {
  const pool = getPool()
  const result = await pool.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  )
  return result.rows[0]
}

export const findUserById = async (id) => {
  const pool = getPool()
  const result = await pool.query(
    `SELECT id, username, email, avatar, is_admin, is_online, last_seen, created_at
     FROM users WHERE id = $1`,
    [id]
  )
  return result.rows[0]
}

export const updateUserOnlineStatus = async (id, is_online) => {
  const pool = getPool()
  const result = await pool.query(
    `UPDATE users SET is_online = $1, last_seen = NOW()
     WHERE id = $2
     RETURNING id, is_online, last_seen`,
    [is_online, id]
  )
  return result.rows[0]
}

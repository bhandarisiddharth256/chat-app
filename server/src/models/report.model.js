import { getPool } from '../config/db.js'

export const createReport = async ({ message_id, reported_by, reason }) => {
  const pool = getPool()

  const result = await pool.query(
    `INSERT INTO reports (message_id, reported_by, reason)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [message_id, reported_by, reason]
  )

  return result.rows[0]
}

export const getAllReports = async () => {
  const pool = getPool()

  const result = await pool.query(
    `SELECT r.*, m.content, m.sender_id
     FROM reports r
     JOIN messages m ON r.message_id = m.id
     ORDER BY r.created_at DESC`
  )

  return result.rows
}
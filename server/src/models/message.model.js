import { getPool } from '../config/db.js'

export const createMessage = async ({ sender_id, receiver_id, content }) => {
  const pool = getPool()

  const result = await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [sender_id, receiver_id, content]
  )

  return result.rows[0]
}

export const getMessagesBetweenUsers = async (user1, user2) => {
  const pool = getPool()

  const result = await pool.query(
    `SELECT * FROM messages
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)
     ORDER BY created_at ASC`,
    [user1, user2]
  )

  return result.rows
}

// EDIT MESSAGE
export const editMessage = async (messageId, newContent, userId) => {
  const pool = getPool()

  const result = await pool.query(
    `UPDATE messages
     SET content = $1, is_edited = TRUE, updated_at = NOW()
     WHERE id = $2 AND sender_id = $3
     RETURNING *`,
    [newContent, messageId, userId]
  )

  return result.rows[0]
}

// DELETE MESSAGE (soft delete)
export const deleteMessage = async (messageId, userId) => {
  const pool = getPool()

  const result = await pool.query(
    `UPDATE messages
     SET content = 'This message was deleted',
         is_deleted = TRUE,
         updated_at = NOW()
     WHERE id = $1 AND sender_id = $2
     RETURNING *`,
    [messageId, userId]
  )

  return result.rows[0]
}

// CREATE GROUP MESSAGE
export const createGroupMessage = async ({ sender_id, group_id, content }) => {
  const pool = getPool()

  const result = await pool.query(
    `INSERT INTO messages (sender_id, group_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [sender_id, group_id, content]
  )

  return result.rows[0]
}
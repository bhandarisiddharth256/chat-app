import { getPool } from '../config/db.js'

export const createMessage = async ({ sender_id, receiver_id, content, message_type = 'text' }) => {
  const pool = getPool()

  const result = await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, content, message_type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [sender_id, receiver_id, content, message_type]
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
export const createGroupMessage = async ({ sender_id, group_id, content, message_type = 'text' }) => {
  const pool = getPool()

  const result = await pool.query(
    `INSERT INTO messages (sender_id, group_id, content, message_type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [sender_id, group_id, content, message_type]
  )

  return result.rows[0]
}

// GET CONVERSATIONS
export const getConversations = async (userId) => {
  const pool = getPool()

  const result = await pool.query(
    `
    SELECT DISTINCT ON (u.id)
      u.id,
      u.username,
      m.content,
      m.message_type,
      m.created_at
    FROM users u
    LEFT JOIN messages m 
      ON (
        (m.sender_id = $1 AND m.receiver_id = u.id)
        OR
        (m.sender_id = u.id AND m.receiver_id = $1)
      )
    WHERE u.id != $1
    ORDER BY u.id, m.created_at DESC;
    `,
    [userId]
  )

  return result.rows.map((row) => ({
    id: row.id,
    name: row.username,
    last_message: row.content
      ? {
          content: row.content,
          message_type: row.message_type,
          created_at: row.created_at,
        }
      : null,
  }))
}


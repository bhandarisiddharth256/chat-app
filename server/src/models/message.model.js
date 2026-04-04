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

  // 1-to-1 chats
  const personalChats = await pool.query(
    `
    SELECT DISTINCT ON (
      CASE 
        WHEN sender_id = $1 THEN receiver_id 
        ELSE sender_id 
      END
    )
      id,
      content,
      message_type,
      created_at,
      sender_id,
      receiver_id
    FROM messages
    WHERE sender_id = $1 OR receiver_id = $1
    ORDER BY 
      CASE 
        WHEN sender_id = $1 THEN receiver_id 
        ELSE sender_id 
      END,
      created_at DESC
    `,
    [userId]
  )

  // group chats
  const groupChats = await pool.query(
    `
    SELECT DISTINCT ON (m.group_id)
      m.id,
      m.content,
      m.message_type,
      m.created_at,
      m.group_id,
      g.name AS group_name
    FROM messages m
    JOIN groups g ON m.group_id = g.id
    JOIN group_members gm ON gm.group_id = g.id
    WHERE gm.user_id = $1
    ORDER BY m.group_id, m.created_at DESC
    `,
    [userId]
  )

  return {
    personal: personalChats.rows,
    groups: groupChats.rows
  }
}


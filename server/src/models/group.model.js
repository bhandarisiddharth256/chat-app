import { getPool } from '../config/db.js'

// CREATE GROUP
export const createGroup = async ({ name, created_by }) => {
  const pool = getPool()

  const result = await pool.query(
    `INSERT INTO groups (name, created_by)
     VALUES ($1, $2)
     RETURNING *`,
    [name, created_by]
  )

  return result.rows[0]
}

// ADD MEMBER
export const addGroupMember = async ({ group_id, user_id, role = 'member' }) => {
  const pool = getPool()

  const result = await pool.query(
    `INSERT INTO group_members (group_id, user_id, role)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [group_id, user_id, role]
  )

  return result.rows[0]
}

// GET GROUP MEMBERS
export const getGroupMembers = async (group_id) => {
  const pool = getPool()

  const result = await pool.query(
    `SELECT user_id FROM group_members WHERE group_id = $1`,
    [group_id]
  )

  return result.rows
}

// CHECK IF USER IS ADMIN
export const isGroupAdmin = async (group_id, user_id) => {
  const pool = getPool()

  const result = await pool.query(
    `SELECT role FROM group_members
     WHERE group_id = $1 AND user_id = $2`,
    [group_id, user_id]
  )

  if (result.rows.length === 0) return false

  return result.rows[0].role === 'admin'
}

// REMOVE MEMBER
export const removeGroupMember = async (group_id, user_id) => {
  const pool = getPool()

  const result = await pool.query(
    `DELETE FROM group_members
     WHERE group_id = $1 AND user_id = $2
     RETURNING *`,
    [group_id, user_id]
  )

  return result.rows[0]
}
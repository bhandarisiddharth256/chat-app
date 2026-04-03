import { createGroup, addGroupMember , isGroupAdmin } from '../models/group.model.js'
import { getPool } from '../config/db.js'
// CREATE GROUP
export const createGroupHandler = async (req, res) => {
  try {
    const { name, members } = req.body
    const userId = req.userId

    if (!name || !members || members.length === 0) {
      return res.status(400).json({ message: 'Name and members required' })
    }

    // Create group
    const group = await createGroup({
      name,
      created_by: userId,
    })

    // Add creator as admin
    await addGroupMember({
      group_id: group.id,
      user_id: userId,
      role: 'admin',
    })

    // Add other members
    for (const memberId of members) {
      await addGroupMember({
        group_id: group.id,
        user_id: memberId,
      })
    }

    return res.status(201).json({
      message: 'Group created successfully',
      group,
    })

  } catch (error) {
    console.error('Create group error:', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// ADD MEMBER
export const addMemberHandler = async (req, res) => {
  try {
    const { groupId, userIdToAdd } = req.body
    const userId = req.userId

    // Check admin
    const isAdmin = await isGroupAdmin(groupId, userId)
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admin can add members' })
    }

    const member = await addGroupMember({
      group_id: groupId,
      user_id: userIdToAdd,
    })

    return res.status(200).json({
      message: 'Member added',
      member,
    })

  } catch (error) {
    console.error('Add member error:', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// RENAME GROUP
export const renameGroupHandler = async (req, res) => {
  try {
    const { groupId, newName } = req.body
    const userId = req.userId

    const isAdmin = await isGroupAdmin(groupId, userId)
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admin can rename group' })
    }

    const pool = getPool()

    const result = await pool.query(
      `UPDATE groups SET name = $1 WHERE id = $2 RETURNING *`,
      [newName, groupId]
    )

    return res.status(200).json({
      message: 'Group renamed',
      group: result.rows[0],
    })

  } catch (error) {
    console.error('Rename error:', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
import { getPool } from "../config/db.js";

export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.json([]);
    }

    const pool = getPool();

    const result = await pool.query(
      `
      SELECT id, username, email, avatar
      FROM users
      WHERE username ILIKE $1
      LIMIT 10
      `,
      [`%${query}%`]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("SEARCH ERROR:", error.message);
    res.status(500).json({ message: "Search failed" });
  }
};
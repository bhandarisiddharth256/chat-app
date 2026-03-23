import pg from 'pg'

const { Pool } = pg

let pool

export const connectDB = async () => {
  try {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: String(process.env.DB_PASSWORD),
    })

    const client = await pool.connect()
    console.log('PostgreSQL connected successfully')
    client.release()
  } catch (error) {
    console.error('PostgreSQL connection error:', error.message)
    process.exit(1)
  }
}

export const getPool = () => pool
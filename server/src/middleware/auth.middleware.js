import jwt from 'jsonwebtoken'

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    req.userId = decoded.userId

    next()
  } catch (error) {
    console.error('Auth middleware error:', error.message)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
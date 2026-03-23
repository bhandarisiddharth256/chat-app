import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById
} from '../models/user.model.js'

const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  )
}

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  )
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Validate fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Check if email already exists
    const existingEmail = await findUserByEmail(email)
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    // Check if username already exists
    const existingUsername = await findUserByUsername(username)
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already taken' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const id = uuidv4()
    const user = await createUser({
      id,
      username,
      email,
      password: hashedPassword,
    })

    // Generate tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, cookieOptions)

    return res.status(201).json({
      message: 'User registered successfully',
      user,
      accessToken,
    })
  } catch (error) {
    console.error('Register error:', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Check if user exists
    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, cookieOptions)

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        is_admin: user.is_admin,
      },
      accessToken,
    })
  } catch (error) {
    console.error('Login error:', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// LOGOUT
export const logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', cookieOptions)
    return res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken

    if (!token) {
      return res.status(401).json({ message: 'No refresh token provided' })
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

    // Check if user still exists
    const user = await findUserById(decoded.userId)
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Generate new access token
    const accessToken = generateAccessToken(user.id)

    return res.status(200).json({ accessToken })
  } catch (error) {
    console.error('Refresh token error:', error.message)
    return res.status(401).json({ message: 'Invalid or expired refresh token' })
  }
}

// GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.status(200).json({ user })
  } catch (error) {
    console.error('Get me error:', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
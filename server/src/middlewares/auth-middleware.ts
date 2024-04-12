import { Request, Response } from 'express'
import prisma from '../db/db'
import jwt from 'jsonwebtoken'
import authReq from './auth-types'

const secret = process.env.SECRET || ''

const authMiddleware = async (req: authReq, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized', loggedIn: false })
    }

    const decoded = jwt.verify(token, secret) as { id: number }
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized', loggedIn: false })
    }

    const user = await prisma.users.findUnique({ where: { id: decoded.id } })
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized', loggedIn: false })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

export default authMiddleware

import { user } from './../db/db-types.d'
import { Router, Request, Response } from 'express'
import authReq from '../middlewares/auth-types'
import authMiddleware from '../middlewares/auth-middleware'
const router = Router()

interface updateDetailsRequest extends authReq {
  body: {
    avatar: number
    about: string
    tags: string[]
  }
}

router.put('/update-details', async (req: updateDetailsRequest, res) => {
  const user = req.user
  const { avatar, about, tags } = req.body
  if (!avatar || !about || !tags) {
    return res.status(400).json({ message: 'All fields not provided' })
  }
  // Update user details in the database
  res.json({ message: 'Details updated' })
})

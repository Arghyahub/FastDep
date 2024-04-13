import { user } from './../db/db-types.d'
import { Router, Request, Response } from 'express'
import authReq from '../middlewares/auth-types'
import authMiddleware from '../middlewares/auth-middleware'
import prisma from '../db/db'
const router = Router()

interface updateDetailsRequest extends authReq {
  body: {
    avatar?: number
    about?: string
    tags?: string[]
  }
}

router.put('/update-details', async (req: updateDetailsRequest, res) => {
  try {
    const user = req.user
    const { avatar, about, tags } = req.body

    if (avatar) user.avatar = avatar
    if (about) user.about = about

    if (tags && tags.length > 0) {
      await prisma.tags.deleteMany({ where: { user_id: user.id } })
      const TagPromises = tags.map((tag) => {
        return prisma.tags.create({
          data: {
            user_id: user.id,
            tag,
          },
        })
      })

      await Promise.all(TagPromises)
    }

    res.json({ message: 'Details updated' })
  } catch (error) {
    console.log('==update-details==\n', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

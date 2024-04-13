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

interface newChatRequest extends authReq {
  body: {
    friend_id: number
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

router.post('/new-chat', async (req: newChatRequest, res) => {
  try {
    const friend_id = req.body.friend_id
    if (!friend_id) {
      console.log('Friend Id not provided')
      return res.json({ message: 'Friend Id not provided' })
    }
    const friend_user = await prisma.users.findUnique({
      where: { id: friend_id },
      select: { name: true },
    })
    if (!friend_user) {
      console.log('User friend not found')
      return res.json({ message: 'User friend not found' })
    }

    // check if they are already friends
    const isFriend = await prisma.friends.findFirst({
      where: {
        user_id: req.user.id,
        friend_id: friend_id,
      },
    })
    if (isFriend) {
      console.log('Already friends')
      const group = await prisma.groups.findFirst({
        where: {
          personal: true,
          AND: [
            // { personl: true },
            {
              GroupMembers: {
                some: { user_id: req.user.id },
              },
            },
            {
              GroupMembers: {
                some: { user_id: friend_id },
              },
            },
          ],
        },
      })
      return res.json({ message: 'Already friends', data: group })
    }

    // if not, create a group
    const group = await prisma.groups.create({
      data: {
        name: `${req.user.name} ${friend_user.name}`,
        personal: true,
        // add both users to group members
        GroupMembers: {
          createMany: {
            data: [{ user_id: req.user.id }, { user_id: friend_id }],
          },
        },
      },
    })

    // Add friends
    await prisma.friends.createMany({
      data: [
        { user_id: req.user.id, friend_id: friend_id },
        { user_id: friend_id, friend_id: req.user.id },
      ],
    })

    // return group_members and group
    return res.status(201).json({ data: group })
  } catch (error) {
    console.log('==new-chat==\n', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/get-all-groups', async (req: authReq, res) => {
  try {
    const group = await prisma.groupMembers.findMany({
      where: { user_id: req.user.id },
      include: {
        group: true,
      },
    })

    return res.json(group)
  } catch (error) {
    console.log('==get-all-groups==\n', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

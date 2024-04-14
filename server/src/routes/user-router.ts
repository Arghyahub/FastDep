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

interface getChatGroupIdReq extends authReq {
  body: {
    group_id: number
  }
}

interface postChatReq extends authReq {
  body: {
    group_id: number
    message: string
  }
}

router.patch('/update-details', async (req: updateDetailsRequest, res) => {
  try {
    const user = req.user
    const { avatar, about, tags } = req.body

    if (avatar) user.avatar = avatar
    if (about) user.about = about

    if (tags && tags.length > 0) {
      await prisma.tags.deleteMany({ where: { user_id: user.id } })
      await prisma.tags.createMany({
        data: tags.map((tag) => ({ tag, user_id: user.id })),
      })
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
      select: {
        group: true,
      },
    })
    if (isFriend) {
      console.log('Already friends')
      return res.json({ message: 'Already friends', data: isFriend?.group })
    }

    // if not, check if a group exist from friend to user else create a group
    let group = (
      await prisma.friends.findFirst({
        where: {
          user_id: friend_id,
          friend_id: req.user.id,
        },
        select: {
          group: true,
        },
      })
    )?.group

    // If group doesn't exist, create a new group
    if (!group) {
      group = await prisma.groups.create({
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
    }

    // Add friends
    await prisma.friends.create({
      data: {
        user_id: req.user.id,
        friend_id: friend_id,
        group_id: group.id,
      },
    })

    // return group
    return res.status(201).json({ data: group })
  } catch (error) {
    console.log('==new-chat==\n', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/get-all-groups', async (req: authReq, res) => {
  try {
    const group = await prisma.groups.findMany({
      where: {
        GroupMembers: {
          some: {
            user_id: req.user.id,
          },
        },
      },
    })

    return res.json(group)
  } catch (error) {
    console.log('==get-all-groups==\n', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/post-chat', async (req: postChatReq, res) => {
  try {
    if (!req.body.group_id || !req.body.message)
      return res
        .status(400)
        .json({ message: 'Group Id or message not provided' })

    // Check if the person is part of the group
    const isPart = await prisma.groupMembers.findFirst({
      where: {
        user_id: req.user.id,
        group_id: req.body.group_id,
      },
    })
    if (!isPart) {
      console.log('post-chat not part of group')
      return res.status(400).json({ message: 'You are not part of the group' })
    }

    await prisma.chats.create({
      data: {
        group_id: req.body.group_id,
        user_id: req.user.id,
        content: req.body.message,
      },
    })

    return res.status(201).json({ success: true, message: 'successful' })
  } catch (error) {
    console.log('==post-chat==\n', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/get-chat-groupId', async (req: getChatGroupIdReq, res) => {
  try {
    if (!req.body.group_id)
      return res.status(400).json({ message: 'Group Id not provided' })

    const chats = await prisma.chats.findMany({
      where: {
        AND: [
          { group_id: req.body.group_id },
          { group: { GroupMembers: { some: { user_id: req.user.id } } } },
        ],
      },
    })

    return res.status(200).json({ data: chats })
  } catch (error) {
    console.log('==get-chat-groupId==\n', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

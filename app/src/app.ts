import { DynamoDBClient, DynamoDBRecord } from './dynamodb-client.js'
const dbClient = new DynamoDBClient('lambda_template_posts')
import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import uuid from 'node-uuid'
import { isString } from 'lodash'

const app: Application = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

type Post = {
  userId: string
  title: string
  description: string
  photo: string | undefined
} & DynamoDBRecord

app.get('/posts', async (req: Request, res: Response) => {
  const {
    userId,
    limit: limitStr,
    page: pageStr,
  } = {
    userId: req.query['userId'],
    limit: req.query['limit'],
    page: req.query['page'],
  }
  try {
    if (userId !== undefined && !isString(userId)) {
      throw new Error('userId is invalid.')
    }
    let limit = Number(limitStr)
    if (isNaN(limit)) {
      limit = 10
    }
    let page = Number(pageStr)
    if (isNaN(page)) {
      page = 1
    }
    let filter = undefined
    let attributeValues = undefined
    if (userId) {
      filter = 'sk = :sk'
      attributeValues = {
        ':sk': userId,
      }
    }
    const posts = await dbClient
      .scan<Post>(filter, undefined, attributeValues)
      .then((e) =>
        e.sort(function (a, b) {
          return a.created_at < b.created_at ? -1 : 1
        })
      )
      .then((e) => e.slice((page - 1) * limit, page * limit))
    res.json(posts)
  } catch (e: unknown) {
    console.error('error', e)
    let message = ''
    if (e instanceof Error) {
      message = e.message
    }
    res.sendStatus(500).json({
      message,
    })
  }
})
app.get('/posts/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    if (!id) {
      throw new Error('ID is required.')
    }
    const post = await getPost(id)
    res.json(post)
  } catch (e: unknown) {
    console.error('error', e)
    let message = ''
    if (e instanceof Error) {
      message = e.message
    }
    res.sendStatus(500).json({
      message,
    })
  }
})
app.post('/posts', async (req: Request, res: Response) => {
  const { userId, title, description, photo } = {
    userId: req.body['userId'],
    title: req.body['title'],
    description: req.body['description'],
    photo: req.body['photo'],
  }
  try {
    if (userId === undefined) {
      throw new Error('userId is required.')
    }
    if (title === undefined) {
      throw new Error('title is required.')
    }
    if (description === undefined) {
      throw new Error('description is required.')
    }
    const params = {
      pk: uuid.v4(),
      sk: userId,
      title: title,
      description: description,
      photo: photo,
    } as Post
    const post = await dbClient.post<Post>(params)
    res.json(post)
  } catch (e: unknown) {
    console.error('error', e)
    let message = ''
    if (e instanceof Error) {
      message = e.message
    }
    res.sendStatus(500).json({
      message,
    })
  }
})
app.put('/posts/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const { userId, title, description, photo } = {
    userId: req.body['userId'],
    title: req.body['title'],
    description: req.body['description'],
    photo: req.body['photo'],
  }
  if (!id) {
    throw new Error('ID is required.')
  }
  if (userId === undefined) {
    throw new Error('userId is required.')
  }
  if (title === undefined) {
    throw new Error('title is required.')
  }
  if (description === undefined) {
    throw new Error('description is required.')
  }
  const params = {
    pk: id,
    sk: userId,
    title: title,
    description: description,
    photo: photo,
  } as Post
  try {
    let post = await getPost(id)
    if (!post) {
      res.sendStatus(404).json({
        message: 'Data Not found.',
      })
      return
    }
    post = await dbClient.put<Post>({ pk: post.pk, sk: post.sk }, params)
    res.json(post)
  } catch (e: unknown) {
    console.error('error', e)
    let message = ''
    if (e instanceof Error) {
      message = e.message
    }
    res.sendStatus(500).json({
      message,
    })
  }
})
app.delete('/posts/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    if (!id) {
      throw new Error('ID is required.')
    }
    const post = await getPost(id)
    if (!post) {
      res.sendStatus(404).json({
        message: 'Data Not found.',
      })
      return
    }
    const key = await dbClient.delete({ pk: post.pk, sk: post.sk })
    res.json(key)
  } catch (e: unknown) {
    console.error('error', e)
    let message = ''
    if (e instanceof Error) {
      message = e.message
    }
    res.sendStatus(500).json({
      message,
    })
  }
})

const getPost = async (pk: string): Promise<Post | undefined> => {
  const post = await dbClient.query<Post>('pk = :pk', undefined, undefined, {
    ':pk': pk,
  })
  if (0 === post.length) {
    return undefined
  }
  return post[0]
}

export { app }

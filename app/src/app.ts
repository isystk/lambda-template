import { DynamoDBClient, DynamoDBRecord } from './dynamodb-client.js'
const dbClient = new DynamoDBClient('simple_app_posts')
import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import uuid from 'node-uuid'
import { isNumber, isString } from 'lodash'

const app: Application = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

type RequestParam = {
  userId: string | undefined
  limit: string | undefined
  last: string | undefined
}

type Post = {
  userId: string
  title: string
  description: string
  photo: string
} & DynamoDBRecord

app.get('/posts', async (req: Request, res: Response) => {
  const { userId, limit, last }: RequestParam = {
    userId: req.params['userId'],
    limit: req.params['limit'],
    last: req.params['last'],
  }

  try {
    if (userId !== undefined && !isString(userId)) {
      throw new Error('An unexpected error occurred.')
    }
    if (limit !== undefined && !isNumber(limit)) {
      throw new Error('An unexpected error occurred.')
    }
    if (last !== undefined && !isString(last)) {
      throw new Error('An unexpected error occurred.')
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
  try {
    const params = {
      pk: uuid.v4(),
      sk: req.body['userId'],
      title: req.body['title'],
      description: req.body['description'],
      photo: req.body['photo'],
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
  const params = {
    title: req.body['title'],
    description: req.body['description'],
    photo: req.body['photo'],
  } as Post
  try {
    if (!id) {
      throw new Error('ID is required.')
    }
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

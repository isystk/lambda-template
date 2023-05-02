import { DynamoDBClient } from './dynamodb-client.js'
const dbClient = new DynamoDBClient('simple_app_posts')
import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import { isNumber, isString } from 'lodash'

const app: Application = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.get('/posts', async (req: Request, res: Response) => {
  const { userId, limit, last } = req.query
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
    const json = await request(async () => {
      return await dbClient.list(userId, limit, last)
    })
    res.json(json)
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
      throw new Error('id is undefined')
    }
    const json = await request(async () => {
      return await dbClient.find(id)
    })
    res.json(json)
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
    const json = await request(async () => {
      const params = req.body
      return await dbClient.post(params)
    })
    res.json(json)
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
  try {
    if (!id) {
      throw new Error('id is undefined')
    }
    const json = await request(async () => {
      const params = JSON.parse(req.body)
      return await dbClient.put(id, params)
    })
    res.json(json)
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
      throw new Error('id is undefined')
    }
    const json = await request(async () => {
      return await dbClient.delete(id)
    })
    res.json(json)
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

const request = async (callback: () => Record<never, never>) => {
  let body = undefined
  let statusCode = 200
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, access_token',
  }
  try {
    body = await callback()
  } catch (err: unknown) {
    console.error(err)
    statusCode = 400
    if (err instanceof Error) {
      body = err.message
    }
  }
  return {
    statusCode,
    body,
    headers,
  }
}

export { app }

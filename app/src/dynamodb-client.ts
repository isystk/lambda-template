import AWS from 'aws-sdk'
import uuid from 'node-uuid'
import moment from 'moment'
class DynamoDBClient {
  private documentClient: AWS.DynamoDB.DocumentClient
  constructor(private readonly tableName: string) {
    const nodeEnv = process.env.NODE_ENV
    const awsSamLocal = process.env.AWS_SAM_LOCAL
    let config: Record<never, never> = { region: 'ap-northeast-1' }
    if (awsSamLocal) {
      config = {
        endpoint: 'http://dynamodb:8000',
        credentials: { accessKeyId: 'FAKE', secretAccessKey: 'FAKE' },
      }
    } else if (nodeEnv === 'development') {
      config = {
        endpoint: 'http://localhost:8000',
        credentials: { accessKeyId: 'FAKE', secretAccessKey: 'FAKE' },
      }
    }

    this.documentClient = new AWS.DynamoDB.DocumentClient(config)
    this.tableName = tableName
  }

  async list(userId: string | undefined, limit = 10, last: string | undefined) {
    const dbParams = {
      TableName: this.tableName,
    }
    console.log('scan')
    const result = await this.documentClient
      .scan(dbParams, (err, data) => {
        console.log('result', err, data)
        if (!data || !data.Items) return {}
        const items = data.Items.filter((e) => {
          return !userId || e.data.userId === userId
        }).sort(function (a, b) {
          return b.data.regist_datetime - a.data.regist_datetime
        })
        let index = last ? items.findIndex((item) => item.id === last) : 0
        index = index < 0 ? 0 : index
        data.Items = items.slice(index, index + limit)
        if (err) {
          return err
        } else {
          return data
        }
      })
      .promise()
    return result.Items
  }

  async find(id: string) {
    const dbParams = {
      TableName: this.tableName,
      Key: {
        id,
      },
    }
    const result = await this.documentClient.get(dbParams).promise()
    return result.Item
  }

  async post(itemParams: Record<never, never>) {
    const dbParams = {
      TableName: this.tableName,
      Item: {
        id: uuid.v4(),
        data: {
          ...itemParams,
          regist_datetime: moment().format(),
          update_datetime: moment().format(),
        },
      },
    }

    // console.log("post", dbParams)
    await this.documentClient.put(dbParams).promise()
    return dbParams.Item
  }

  async put(id: string, itemParams: Record<never, never>) {
    const dbParams = {
      TableName: this.tableName,
      Item: {
        id,
        data: {
          ...itemParams,
          update_datetime: moment().format(),
        },
      },
    }

    // console.log("put", dbParams)
    await this.documentClient.put(dbParams).promise()
    return dbParams.Item
  }

  async delete(id: string) {
    const dbParams = {
      TableName: this.tableName,
      Key: {
        id,
      },
    }
    await this.documentClient.delete(dbParams).promise()
    return { id }
  }
}

export { DynamoDBClient }

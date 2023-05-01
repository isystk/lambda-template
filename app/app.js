import {DynamoDBClient} from './dynamodb-client.js'
const dbClient = new DynamoDBClient('simple_app_posts');
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get('/posts', async (req, res) => {
    const {userId, limit, last} = req.query;
    const json = await request(async () => {
        return await dbClient.list(userId, limit, last);
    });
    res.json(json);
});
app.get('/posts/:id', async (req, res) => {
    const {id} = req.params;
    const json = await request(async () => {
        return await dbClient.find(id);
    });
    res.json(json);
})
app.post('/posts', async (req, res) => {
    const json = await request(async () => {
        const params = req.body;
        return await dbClient.post(params);
    });
    res.json(json);
})
app.put('/posts/:id', async (req, res) => {
    const {id} = req.params;
    const json = await request(async () => {
        const params = JSON.parse(req.body);
        return await dbClient.put(id, params);
    });
    res.json(json);
})
app.delete('/posts/:id', async (req, res) => {
    const {id} = req.params;
    const json = await request(async () => {
        return await dbClient.delete(id);
    });
    res.json(json);
})

const request = async (callback) => {
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, access_token",
    };
    try {
        body = await callback();
    } catch (err) {
        console.log(err)
        statusCode = 400;
        body = err.message;
    }
    return {
        statusCode,
        body,
        headers
    };
};

export {app}

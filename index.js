const express = require("express");
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('Assainment server is running')
})


const uri = `mongodb+srv://${process.env.SECRET_USER_ID}:${process.env.SECRET_PASS}@cluster0.di4ojvf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    const serviceCollection = client.db("travel").collection('services')

    app.get('/services', async (req, res) => {
        const query = {};
        const services = serviceCollection.find(query);
        const result = await services.limit(3).toArray();
        res.send(result)
    })
}

run().catch(err => console.log(err))

app.listen(port, () => {
    console.log('assainment 11 server on ', port)
})
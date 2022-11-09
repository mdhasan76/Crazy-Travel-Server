const express = require("express");
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();


//middleware
app.use(express.json())
app.use(cors());

app.get('/', (req, res) => {
    res.send('Assainment server is running')
})


const uri = `mongodb+srv://${process.env.SECRET_USER_ID}:${process.env.SECRET_PASS}@cluster0.di4ojvf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    const serviceCollection = client.db("travel").collection('services');
    const reviewData = client.db("travel").collection("Client_Review");


    //Home page data
    app.get('/shortServices', async (req, res) => {
        const query = {};
        const services = serviceCollection.find(query);
        const result = await services.limit(3).toArray();
        res.send(result)
    })

    //service page data
    app.get('/services', async (req, res) => {
        const query = {}
        const services = serviceCollection.find(query);
        const result = await services.toArray();
        res.send(result)
    })

    // Service Dtails page
    app.get('/service/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const service = await serviceCollection.findOne(query);
        res.send(service)
    })

    //review post
    app.post('/addreview', async (req, res) => {
        const data = req.body;
        const doc = {
            reviewText: data.review,
            serviceId: data.serviceId,
            title: data.title,
            userInfo: data.reviewer,
            email: data.reviewer.email
        }
        const result = await reviewData.insertOne(doc)
        res.send(result)
        // console.log(result)
    })


    //add New Service
    app.post('/addservice', async (req, res) => {
        const data = req.body;
        const doc = {
            img: data.img,
            title: data.title,
            price: data.price,
            description: data.description
        }
        const result = await serviceCollection.insertOne(doc);
        res.send(result)
    })


    //Get review Data
    app.get('/review/:id', async (req, res) => {
        const id = req.params.id;
        const query = { serviceId: id }
        const review = reviewData.find(query)
        const result = await review.toArray();
        // const review = reviewData.filter(review => review.serviceId === id);
        res.send(result)
    })

    //perticuler User Reviews
    app.get('/myreviews', async (req, res) => {
        const userEmail = req.query.email;
        console.log(userEmail)
        const query = {
            userInfo: {
                email: userEmail
            }
        }
        const cursor = reviewData.find(query);
        const result = await cursor.toArray();
        res.send(result)
    })

}

run().catch(err => console.log(err))

app.listen(port, () => {
    console.log('assainment 11 server on ', port)
})
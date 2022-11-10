const express = require("express");
const cors = require('cors');
const jwt = require('jsonwebtoken');
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


const verifyJwt = (req, res, next) => {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        return res.status(401).send({ message: "invalid User" })
    }
    const token = authHeaders.split(' ')[1];
    jwt.verify(token, process.env.SECRET_jwt, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "invalid User" })
        }
        req.decoded = decoded;
        next()
    })
}

const uri = `mongodb+srv://${process.env.SECRET_USER_ID}:${process.env.SECRET_PASS}@cluster0.di4ojvf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    const serviceCollection = client.db("travel").collection('services');
    const reviewData = client.db("travel").collection("Client_Review");


    //create json web token 
    app.post('/jwt', async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.SECRET_jwt, { expiresIn: '1h' })
        res.send({ token })
    })

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




    //Get review Data
    app.get('/review/:id', async (req, res) => {
        const id = req.params.id;
        const query = { serviceId: id }
        const review = reviewData.find(query)
        const result = await review.toArray();
        res.send(result)
    })

    //perticuler User Reviews
    app.get('/myreviews', verifyJwt, async (req, res) => {
        const decoded = req.decoded;
        if (decoded.email !== req.query.email) {
            return res.status(403).send({ message: "2 numberi koro keno vai" })
        }
        let query = {};
        if (req.query.email) {
            query = {
                email: req.query.email
            }
        }
        const cursor = reviewData.find(query);
        const result = await cursor.toArray();
        // console.log(result)
        res.send(result)
    })

    app.delete('/deletereview/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const result = await reviewData.deleteOne(query);
        res.send(result)
    })

    app.get('/editreview/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const review = await reviewData.findOne(query);
        res.send(review);
    })

    app.patch('/editreview/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const updateDoc = {
            $set: {
                reviewText: req.body.updateText
            }
        }
        const result = await reviewData.updateOne(filter, updateDoc);

        res.send(result)
    })

}

run().catch(err => console.log(err))

app.listen(port, () => {
    console.log('assainment 11 server on ', port)
})

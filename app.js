//jshint esversion:6
const dotenv = require('dotenv')
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')
dotenv.config()

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))

//connect to Database
mongoose.connect('mongodb://localhost:27017/authDB', {useUnifiedTopology: true, useNewUrlParser: true})

//User Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

//defining secret
const secret = process.env.SECRET_STRING
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']}) //to be added before mongoose model

const User = new mongoose.model('User', userSchema)

//Routes
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

//Creating new user inside register
app.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })

    //Saving New User in DBs
    newUser.save(function(error){
        if(error){
            console.log(error)
        }
        else{
            res.render('secrets')
        }
    })
})

app.post('/login', (req, res) => {
    
    //getting input data from login form
    const username = req.body.username
    const password = req.body.password

    //looking user in DB
    User.findOne({email: username}, (err, foundUser) => {
        //display error
        if(err){
            console.log(err)
        }
        else{
            if(foundUser){ //if user is found in DB and password stored in DB matches with input password => Login Successful
                if(foundUser.password === password){
                    res.render('secrets')
                }
            }
        }
    })

})

app.listen(3000 || process.env.PORT, () => {
    console.log('Server running on port 3000')
})

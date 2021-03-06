//jshint esversion:6
const dotenv = require('dotenv')
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
dotenv.config()

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))

//establishing a session
app.use(session({
    secret: 'our little secret',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

//connect to Database
mongoose.connect('mongodb://localhost:27017/authDB', {useUnifiedTopology: true, useNewUrlParser: true})

//User Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model('User', userSchema)

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

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

app.get("/secrets", function(req, res){
    User.find({'secret': {$ne: null}}, function(err, foundUsers){
        if (err){
            console.log(err)
        } 
        else {
            if(foundUsers) {
                res.render('secrets', {usersWithSecrets: foundUsers})
            }
        }
    })
});
  
app.get('/submit', function(req, res){
    if (req.isAuthenticated()){
        res.render('submit')
    } 
    else {
        res.redirect('/login')
    }
})
  
app.post('/submit', function(req, res){
    const submittedSecret = req.body.secret
  
    //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
    // console.log(req.user.id);
  
    User.findById(req.user.id, function(err, foundUser){
        if (err) {
            console.log(err)
        } 
        else {
            if (foundUser) {
                foundUser.secret = submittedSecret
                foundUser.save(function(){
                    res.redirect('/secrets')
                })
            }
        }
    })
})
  

//logging out 
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if(err){
            console.log(err)
        }
        res.redirect('/')
    })
   
})

//Creating new user inside register
app.post('/register', (req, res) => {
    
   User.register({username: req.body.username}, req.body.password, (err, user) => {
        if(err){
            console.log(err)
            res.redirect('/register')
        }
        else{
            res.redirect('/login')
        }
   })
    
})

//login a user
app.post('/login', (req, res) => {
    
    //getting data from login form
   const user = new User({
        username: req.body.username,
        password: req.body.password
   })

   req.login(user, (err) => {
        if(err){
            console.log(err)
        }
        else{
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            })
        }
   })

})

app.listen(3000 || process.env.PORT, () => {
    console.log('Server running on port 3000')
})

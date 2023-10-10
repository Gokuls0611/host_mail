const express = require('express')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const cors = require('cors')
require('dotenv').config({path:'config.env'})
const app = express()
app.use(express.json())
app.use(cors(
    {
    origin:["https://gokuls-host-frontend.vercel.app/"],
    methods:["POST","GET"],
    credentials:true
    }
))

try {
    mongoose.connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    console.log("Database connected")
    } catch (err) {
    console.error(err)
}

//Mail Configuration
const transporter = nodemailer.createTransport({
    host:process.env.HOST,
    service:process.env.SERVICE,
    port:567,
    secure:process.env.SECURE,
    auth:{
        user:process.env.USER,
        pass:process.env.PASS
    }
})

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    logouttime:String,
    cart:[
    {
         items:[
            {

             _id: {
            type: Number,
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
        },]
        
    } 
    ],
    otp:Number,
},
)
const User = new mongoose.model("User", userSchema)

// otp
app.post("/forgotPassword",(req,res)=>{
    const {email} = req.body
    User.findOne({email:email})
    .then((foundUser)=>{
            if(foundUser){
                OTP = Math.floor(1000+ Math.random() * 9000)
                let content = `<p>Hi ${foundUser.name} your OTP to change Password ${OTP}</p>`
                let mailOptions = {
                    from: process.env.USER,
                    to: foundUser.email,
                    subject: 'Reset Password',
                    html:content,
                    }
                    console.log(email)
                transporter.sendMail(mailOptions,(error, info) => {
                    if (error) {
                    console.log('Error occurred:', error);
                    } else {
                    console.log('Email sent:', info.response);
                    OTP  = 0
                    }
                });
                console.log(OTP) 
                User.updateOne({email:foundUser.email},{$set:{otp:OTP}})
                .then(
                res.send({
                    message:"Enter OTP",
                    b:true
                }))
               
            }
            else{
                res.send({message:"Invalid Mail",b:false})
            }
        })
        .catch((err)=>{
            console.log(err)
            res.send({
                message:"Please try again later",
                b:false
            })
        })
})
    


app.listen(8000,() => {console.log("Server Started on 8000")})

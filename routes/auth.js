import express from "express";
import User from '../models/User'
import { body,validationResult } from "express-validator";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fetchUser from '../middlewares/fetchUser'


const JWT_SECRET= process.env.JWT_SECRET
const router = express.Router();

router.post('/createuser',[
    body('email','Enter a valid Email').isEmail(),
    body('password','Enter a valid Password').isLength({min:3})
], async (req,res)=>{

    let success=false;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ success,errors: errors.array() });
    }

    try{

        let user = await User.findOne({email: req.body.email});
        if(user){
            return res.status(400).json({success:false,error: 'Sorry a User with this email Already exists'})
        }

        // createing a scecured hash from password
        const salt = await bcrypt.genSalt(10);
        const secPassword = await bcrypt.hash(req.body.password,salt);
        
        // create user
        user = await User.create({
            name: req.body.name,
            password: secPassword,
            email : req.body.email
        });

        const data = {
            user : {
                id : user.id
            }
        }
        
        const authToken =  jwt.sign(data, JWT_SECRET);
        success=true;
        res.status(200).json({success,authToken});
        



    }catch(err){
        return res.status(500).json({success:false,error:err})
    }


})



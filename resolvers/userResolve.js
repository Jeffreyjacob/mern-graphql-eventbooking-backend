import mongoose from "mongoose";
import User from "../models/user.model.js"
import sendEmail from "../utils/sendMail.js"
import crypto from "crypto";
import Booking from "../models/booking.model.js";
import Event from "../models/event.model.js";

const userResolver = {
    Mutation: {
        signUp: async (_, { input: { email, name, password } }, { req }) => {
            try {
                const existingUser = await User.findOne({ email })
                if (existingUser) {
                    throw new Error("email already exist")
                }
                const profilePic = `https://avatar.iran.liara.run/public/boy?username=${name}`
                const newUser = new User({
                    email,
                    name,
                    password,
                    profilePicture: profilePic
                })
                await newUser.save()
                req.session.userId = newUser._id
                return newUser
            } catch (error) {
                console.log("Signup Error", error)
                throw new Error(error)
            }
        },
        login: async (_, { input: { email, password } }, { req }) => {
            try {
                const user = await User.findOne({ email })
                if (!user) {
                    throw new Error("Invalid credentials")
                }
                const isMatch = await user.matchPassword(password)
                if (!isMatch) {
                    throw new Error("Invalid credentials")
                }
                req.session.userId = user._id
                return user
            } catch (error) {
                console.log("Login Error", error)
                throw new Error(error)
            }
        },
        logOut: async (_, __, { req }) => {
            try {
                req.session.destroy((err) => {
                    if (err) {
                        throw new Error("Logout Error")
                    }
                });
                return { message: "Logout successfully!" }
            } catch (error) {
                console.log(error)
                throw new Error(error)
            }
        },
        forgetPasswordEmail: async (_, { input: { email } }) => {
            try {
                const user = await User.findOne({ email })
                if (!user) {
                    throw new Error("user not found")
                }
                const resetToken = user.getResetPasswordToken();
                console.log(resetToken)
                await user.save()
                const resetUrl = `${process.env.FRONTENDURL}/resetPassword/${resetToken}`;
                const message = `
                             <h1>You have a required a password reset</h1>
                            <p>Please go to this link to reset your password</p>
                            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
                            `
                try{
                  await sendEmail({
                    to:user.email,
                    subject:"Password Reset Request",
                    text:message
                  })
                  return {message:"Email sent"}
                }catch(error){
                  console.log(error)
                  user.resetPasswordToken = undefined
                  user.resetPasswordExpire = undefined
                  await user.save();
                  return {message:"Email was not sent"}
                }
            } catch (error) {
               console.log(error)
               return {message:"Email was not sent"}
            } 
        },
        resetPassword:async(_,{input:{token,newPassword}})=>{
            const resetToken = crypto.createHash("sha256").update(token).digest("hex")
            try{
              const user = await User.findOne({
                 resetPasswordToken:resetToken,
                 resetPasswordExpire:{$gt:Date.now()}
              })
              if(!user){
                throw new Error("Invalid or expired token")
              }
              user.password = newPassword
              user.resetPasswordToken = undefined
              user.resetPasswordExpire = undefined
              await user.save()
              return {message:"Password reset successfully!"}
            }catch(error){
               console.log(error)
               throw new Error(error)
            }
        },
        updateUser:async(_,{input},{req})=>{
           try{
            const userId = req.session.userId || new mongoose.Types.ObjectId(req.session.passport.user)
            const user = await User.findById(userId)
            if(!user){
                throw new Error("user not found")
            }
            user.name = input.name || user.name
            user.gender = input.gender || user.gender
            user.phoneNumber = input.phoneNumber || user.phoneNumber
            user.save()
            return user
           }catch(error){
              console.log(error)
              throw new Error(error)
           }
        }
    },
    Query:{
        authUser:async(_,__,{req})=>{
            try{
              const userId = req.session.userId || new mongoose.Types.ObjectId(req.session.passport.user)
              if (!userId) {
                throw new Error("Not authenticated");
            }
              const user = await User.findById(userId)
              if(!user){
                throw new Error("Not authenticated")
              }
              return user
            }catch(error){
               console.log(error)
               throw new Error(error)
            }
        },
        user:async(_,__,{req})=>{
            try{
                const userId = req.session.userId || new mongoose.Types.ObjectId(req.session.passport.user)
                if (!userId) {
                  throw new Error("Not authenticated");
              }
                const user = await User.findById(userId)
                if(!user){
                  throw new Error("Not authenticated")
                }
                return user
              }catch(error){
                 console.log(error)
                 throw new Error(error)
              }
        }
    },
    User:{
        event:async(parent)=>{
            try{
               const event = await Event.find({organizerId:parent._id})
               return event
            }catch(error){
              console.log(error)
              throw new Error(error)
            }
        },
        BookedEvent:async(parent)=>{
            console.log(parent)
            try{
              const bookedEvent= await Booking.find({user:parent.id})
              return bookedEvent
            }catch(error){
            console.log(error)
              throw new Error(error)
            }
        }
        
    }
}

export default userResolver;
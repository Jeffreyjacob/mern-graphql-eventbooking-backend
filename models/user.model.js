import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from "crypto"

const userSchema = new mongoose.Schema({
    googleId:{
     type:String,
     unique:true,
     sparse:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:function () {
            return !this.googleId;
        },
    },
    gender:{
        type:String,
        enum:["male","female"]
    },
    profilePicture:{
        type:String
    },
    phoneNumber:{
        type:String,
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
},{timestamps:true})

userSchema.pre("save",async function(next){
   if(!this.isModified("password")){
     return next()
   }
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password,salt)
   next()
}) 

userSchema.methods.matchPassword = async function(password){
   return await bcrypt.compare(password,this.password);
}

userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex")
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000
    return resetToken
}

const User = mongoose.model("user",userSchema)

export default User;
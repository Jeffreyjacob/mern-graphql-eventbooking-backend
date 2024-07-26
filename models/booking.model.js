import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    ticketDetail:{
        id:{type:String,required:true},
        title:{type:String,required:true},
        quantity:{type:String,required:true},
        price:{type:Number,required:true}
    },
    totalAmount:Number
},{timestamps:true})


const Booking = mongoose.model("Booking",bookingSchema)

export default Booking;
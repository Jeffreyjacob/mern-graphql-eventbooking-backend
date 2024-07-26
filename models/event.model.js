import mongoose from "mongoose";


const eventSchema = new mongoose.Schema({
    organizerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title:{
        type:String,
        required:true
    },
    location:{
        type:String,
    },
    startDate:{
        type:Date
    },
    endDate:{
        type:Date
    },
    imageUrl:{
        type:String
    },
    description:{
        type:String
    },
    eventType:{
        type:String,
        enum:["concerts","festivals","classes & workshops",
            "conference","online event"],
        required:true
    },
    price:{
        type:Number,
        default:0
    },
    isFree:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const Event = mongoose.model("event",eventSchema)

export default Event
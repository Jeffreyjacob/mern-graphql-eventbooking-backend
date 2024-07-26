import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import * as GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import { v2 as cloudinary } from "cloudinary";
import { GraphQLScalarType,Kind} from "graphql";
import mongoose from "mongoose";


const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Custom Date scalar type',
    parseValue(value) {
      return new Date(value); // value from the client input
    },
    serialize(value) {
      return value.toISOString(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value); // value from the client query
      }
      return null;
    },
  });
const eventResolver = {
    Date:dateScalar,
    Upload: GraphQLUpload,
    Query: {
        events: async () => {
            try {
                const event = await Event.find()
                return event
            } catch (error) {
                console.log("Get all Event Error", error)
                throw new Error(error)
            }
        },
        event: async (_, { eventId }) => {
            try {
                const event = await Event.findById(eventId)
                if (!event) {
                    throw new Error("event not found")
                }
                return event
            } catch (error) {
                console.log("Get an event error", error)
                throw new Error(error)
            }
        },
        suggestedEvent: async (_, { eventId }) => {
            try {
                const event = await Event.findById(eventId)
                if (!event) {
                    throw new Error("event not found")
                }
                const suggestedEvent = await Event.find({ $and: [{ eventType: event.eventType }, { _id: { $ne: eventId } }] })
                return suggestedEvent
            } catch (error) {
                console.log("suggested event", error)
                throw new Error(error)
            }
        }
    },
    Mutation: {
        createEvent: async (_,{ input, imageFile },{ req }) => {
            try {
               console.log(input,imageFile)
               const userId = req.session.userId || new mongoose.Types.ObjectId(req.session.passport.user)
                const { createReadStream } = await imageFile.file
                const result = await new Promise((resolve, reject) => {
                    const stream = createReadStream();
                    const cloudinaryStream = cloudinary.uploader.upload_stream(
                        { folder: "event" },
                        (error, result) => {
                            if (error) reject(error);
                            resolve(result)
                        }
                    );
                    stream.pipe(cloudinaryStream)
                })
                const user = await User.findById(userId)
                if (!user) {
                    throw new Error("User not found")
                }
                const event = new Event({
                    ...input,  
                   organizerId:userId,
                    imageUrl:result.secure_url,
                })
                await event.save()
                return event
            } catch (error) {
                console.log("creating event", error)
                throw new Error(error)
            }
        },
        updateEvent: async (_, { input,imageFile}, { req }) => {
            try { 
                let result;
                if(imageFile){
                    const { createReadStream } = await imageFile.file
                    console.log(imageFile)
                    result = await new Promise((resolve, reject) => {
                        const stream = createReadStream();
                        const cloudinaryStream = cloudinary.uploader.upload_stream(
                            { folder: "event" },
                            (error, result) => {
                                if (error) reject(error);
                                resolve(result)
                            }
                        );
                        stream.pipe(cloudinaryStream)
                    })
                }
                const userId = req.session.userId || new mongoose.Types.ObjectId(req.session.passport.user)
                const user = await User.findById(userId)
                if (!user) {
                    throw new Error("User not found")
                }
                const updatedEvent = await Event.findById(input.eventId)
                updatedEvent.title = input.title || updatedEvent.title;
                updatedEvent.description = input.description || updatedEvent.description;
                updatedEvent.imageUrl = result ? result.secure_url : updatedEvent.imageUrl;
                updatedEvent.location = input.location || updatedEvent.location;
                updatedEvent.startDate = input.startDate || updatedEvent.startDate;
                updatedEvent.endDate = input.endDate || updatedEvent.endDate;
                updatedEvent.eventType = input.eventType || updatedEvent.eventType;
                updatedEvent.price = input.price || updatedEvent.price;
                updatedEvent.isFree = input.isFree || updatedEvent.isFree;
                await updatedEvent.save();

                return updatedEvent
            } catch (error) {
                console.log("update event", error)
                throw new Error(error)
            }
        },
        deleteEvent: async (_, { eventId }, { req }) => {
            try {
                const userId = req.session.userId || new mongoose.Types.ObjectId(req.session.passport.user)
                const user = await User.findById(userId)
                if (!user) {
                    throw new Error("User not found")
                }
                const event = await Event.findByIdAndDelete(eventId)
                return event
            } catch (error) {
                console.log("delete event", error)
                throw new Error(error)
            }
        }
    },
    Event:{
        user:async(parent)=>{
            try{
             const user = await User.findById(parent.organizerId)
             if(!user){
                throw new Error("User not found")
             }
             return user
            }catch(error){
                console.log("suggested event", error)
                throw new Error(error)
            }
        }
    }
}

export default eventResolver
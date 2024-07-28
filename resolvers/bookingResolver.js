import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Event from "../models/event.model.js";
import Stripe from "stripe";

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const STRIPE = new Stripe(process.env.STRIPE_API_KEY)
const FRONTEND_URL = process.env.FRONTENDURL
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET


export const stripeWebhookHandler = async (req, res) => {
    let event;
    try {
        const sig = req.headers["stripe-signature"];
        event = STRIPE.webhooks.constructEvent(
            req.body,
            sig,
            STRIPE_ENDPOINT_SECRET
        );
    } catch (error) {
        console.log(error)
        return res.status(400).send(`Webhook error: ${error.message}`)
    }
    if (event.type === "checkout.session.completed") {
        console.log(event)
        const booking = await Booking.findById(event.data.object.metadata.bookingId);
        if (!booking) {
            return res.status(400).json({ message: "booking not found" })
        }
        booking.totalAmount = event.data.object.amount_total;
        await booking.save()
    }
    res.status(200).send()
}

const bookingResolver = {
    Query: {
        bookings:async(_,__,{req})=>{
            try{
            const userId = req.session.userId || new mongoose.Types.ObjectId(req.session.passport.user)
             const booking = await Booking.find({user:userId})
             return booking
            }catch(error){
              console.log(error)
              throw new Error(error)
            }
        }
    },
    Mutation: {
        createCheckOutSession: async (_, { input }, { req }) => {
            try {
                console.log(input)
                const userId = req.session.userId || new mongoose.Types.ObjectId(req.session.passport.user)
                const { id, title, quantity } = input;
                const event = await Event.findById(id)
                if (!event) {
                    throw new Error("event not found")
                }
                const newBooking = new Booking({
                    user: userId,
                    ticketDetail: {
                        id: event._id,
                        title: title,
                        price: event.price,
                        quantity: quantity
                    }
                })

                const session = await STRIPE.checkout.sessions.create({
                    line_items: [
                        {
                            price_data:{
                                currency:"gbp",
                                unit_amount: Math.round(event.price * 100), 
                                product_data:{
                                    name:title,
                                    images: [event.imageUrl] 
                                }
                            },
                            quantity:parseInt(quantity)
                        }
                    ],
                    mode: "payment",
                    metadata: {
                        bookingId: newBooking._id.toString()
                    },
                    success_url: `${FRONTEND_URL}/profile?success=true`,
                    cancel_url: `${FRONTEND_URL}/?cancelled=true`
                })
                 await newBooking.save()
                if (!session.url) {
                    throw new Error("Error creating stripe session")
                } else {
                    return{
                        url:session.url
                    }
                }


            } catch (error) {
                console.log(error)
                throw new Error(error)
            }
        }
    },
    Booking:{
        event:async(parent)=>{
            console.log(parent.ticketDetail.id)
            try{
              const event = await Event.findById(parent.ticketDetail.id)
              if(!event){
                throw new Error("event not found")
              }
              return event
            }catch(error){
                console.log(error)
                throw new Error(error)
            }
        }
    }
}

export default bookingResolver

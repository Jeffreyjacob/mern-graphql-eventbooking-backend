import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Event from "../models/event.model.js";
import Stripe from "stripe";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY)
const FRONTEND_URL = process.env.FRONTENDURL
const STRIPE_ENDPOINT_SECRET= process.env.STRIPE_WEBHOOK_SECRET

const bookingResolver = {
    Query:{

    },
    Mutation:{
        createCheckOutSession:async(_,{checkOutSessionRequest},{req})=>{
            try{
                const userId = req.session.userId || new mongoose.Types.ObjectId(req.session.passport.user)
                const {id,title,quantity} = checkOutSessionRequest;
                const event = await Event.findById(id)
                if(!product){
                    throw new Error("event not found")
                }
                const newBooking = new Booking({
                    user:userId,
                    ticketDetail:{
                        id:event._id,
                        title:title,
                        price:event.title,
                        quantity:quantity
                    }
                })
                const lineItems = createLineTerm(checkOutSessionRequest,event)
                const session = await createSession(lineItems,newBooking._id.toString(),userId)
                await newBooking.save()
                if(!session.url){
                  throw new Error("Error creating stripe session")
                }else{
                  return {url:session.url}
                }

                const createLineTerm = (checkOutSessionRequest,ProductItem)=>{
                    const line_item = {
                      price_data:{
                         currency:"gbp",
                         unit_amount:Math.round(parseFloat(ProductItem.price) * 100),
                         product_data:{
                            name:ProductItem.title,
                            images:ProductItem.imageUrl
                         }
                      },
                      quantity:parseInt(checkOutSessionRequest.quantity)
                    }
                    return line_item
                }
                const createSession = async(
                  lineItem,
                  bookingId,
                  userId
                )=>{
                 const sessionData = await STRIPE.checkout.sessions.create({
                    line_items:lineItem,
                    mode:"payment",
                    metadata:{
                        bookingId
                    },
                    success_url:`${FRONTEND_URL}/profile?success-true`,
                    cancel_url: `${FRONTEND_URL}/`
                 })
                 return sessionData;
                }
            }catch(error){
               console.log(error)
               throw new Error(error)
            }
        }
    }
}

export default bookingResolver

export const stripeWebhookHandler = async (req,res)=>{
    let event;
    try{
    const sig = req.headers["stripe-signature"];
    event = STRIPE.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_ENDPOINT_SECRET
    );
    }catch(error){
      console.log(error)
      return res.status(400).send(`Webhook error:${error.message}`)
    }
    if(event.type === "checkout.session.completed"){
        const booking = await Booking.findById(event.data.object.metadata?.bookingId);
        if(!order){
            return res.status(400).json({message:"booking not found"})
        }
        booking.totalAmount = event.data.object.amount_total;
        await booking.save()
    }
    res.status(200).send()
}
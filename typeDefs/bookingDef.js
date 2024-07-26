

const bookingTypeDef = `#graphql

type Booking{
    user:ID!,
    ticketDetail:ticketsDetail!,
    totalAmount:Float!
}

type ticketsDetail{
    id:String,
    title:String,
    quantity:String,
    price:Float
}

type Query{
    bookings(userId:ID!):[Booking!]
}

type Mutation{
   createCheckOutSession(input:CheckOutRequestInput!):CheckoutUrl
}

input CheckOutRequestInput{
    id:String
    title:String
    quantity:String,
    price:Float
}

type CheckoutUrl{
    url:String
}
`
export default bookingTypeDef;
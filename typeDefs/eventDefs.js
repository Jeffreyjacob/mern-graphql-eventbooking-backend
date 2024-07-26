

const eventTypeDefs = `#graphql
  scalar Upload
  scalar Date
type Event{
    _id:ID!
    organizerId:ID!
    title:String!
    location:String!
    startDate:Date!
    endDate:Date!
    imageUrl:String!
    description:String!
    eventType:String!
    price:Float
    isFree:Boolean
    user:User!
}
type Query{
    events:[Event!],
    event(eventId:ID!):Event
    suggestedEvent(eventId:ID!):[Event!]
}
type Mutation{
    createEvent(input:CreateEventInput!,imageFile:Upload!):Event!
    updateEvent(input:UpdateEventInput!,imageFile:Upload):Event!
    deleteEvent(eventId:ID!):Event,
}
input CreateEventInput{
    title:String!
    location:String!
    startDate:Date!
    endDate:Date!
    description:String!
    eventType:String!
    price:Float
    isFree:Boolean
}
input UpdateEventInput{
    eventId:ID!
    title:String
    location:String
    startDate:Date
    endDate:Date
    description:String
    eventType:String
    price:Float
    isFree:Boolean
}
`

export default eventTypeDefs
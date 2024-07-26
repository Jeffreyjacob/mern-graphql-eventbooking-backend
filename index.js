import dotenv from "dotenv";
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import express from 'express';
import http from 'http';
import ConnectDB from "./db/connect.js";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import mergedTypeDefs from "./typeDefs/index.js";
import mergedResolver from "./resolvers/index.js";
import passport from "passport";
import Passport from "./utils/passport.js";
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import {v2 as cloudinary} from 'cloudinary';
import bodyParser from "body-parser";
import { stripeWebhookHandler } from "./resolvers/bookingResolver.js";

dotenv.config()

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
  })

const app = express()
const httpServer = http.createServer(app);
const MongoDBStore = ConnectMongoDBSession(session)

const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: "sessions"
});

store.on("error", (err) => console.log(err));


app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            httpOnly: true,
            secure: false // Set to true if using https
        },
        store: store
    })
);

Passport(app)
app.use(passport.session())
app.get("/auth/google/callback",passport.authenticate("google",{
    failureRedirect: `${process.env.FRONTENDURL}/login`,
    successRedirect: `${process.env.FRONTENDURL}`
})
)

app.get("/auth/google",passport.authenticate('google', { scope: ['profile', 'email'] }))
app.post("/api/booking/checkout/webhook",bodyParser.raw({type:"application/json"}),stripeWebhookHandler)

const server = new ApolloServer({
    typeDefs:mergedTypeDefs,
    resolvers:mergedResolver,
    csrfPrevention:false,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
  });

  await server.start();
  app.use(graphqlUploadExpress());
  app.use((req, res, next) => {
  res.setHeader('x-apollo-operation-name', 'upload');
  res.setHeader('Apollo-Require-Preflight', 'true');
  next();
});

  app.use(
    '/graphql',
    cors({
        origin:"http://localhost:5173",
        credentials:true
    }),
    express.json(),
    express.urlencoded({extended:true}),
    expressMiddleware(server, {
      context: async ({ req,res}) => ({req,res}),
    }),
  );
  
  // Modified server startup
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  await ConnectDB()
  
  console.log(`🚀 Server ready at http://localhost:4000/`);
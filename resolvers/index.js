import { mergeResolvers } from "@graphql-tools/merge";
import userResolver from "./userResolve.js";
import eventResolver from "./eventResolver.js";
import bookingResolver from "./bookingResolver.js";


const mergedResolver = mergeResolvers([userResolver,eventResolver,bookingResolver])

export default mergedResolver;
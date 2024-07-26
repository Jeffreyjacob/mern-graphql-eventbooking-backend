import { mergeTypeDefs } from "@graphql-tools/merge";
import userTypeDefs from "./userDefs.js";
import eventTypeDefs from "./eventDefs.js";
import bookingTypeDef from "./bookingDef.js";


const mergedTypeDefs = mergeTypeDefs([userTypeDefs,eventTypeDefs,bookingTypeDef])

export default mergedTypeDefs
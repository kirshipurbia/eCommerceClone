import mongoose, { Schema } from "mongoose";
import { mongo} from "../provider/mongo/mongo"
import { COLLECTION } from "../interface/enum";

interface ISchema {
    userId: mongoose.Schema.Types.ObjectId,
    isActive:boolean,
    deviceId:string,
}
const sessionSchema = new Schema<ISchema>({
    userId:mongoose.Schema.Types.ObjectId,
    isActive:Boolean,
    deviceId:String
},{
    timestamps:true
})
export const sessionModel = mongo.getConnection().model<ISchema>(COLLECTION.SESSION,sessionSchema)

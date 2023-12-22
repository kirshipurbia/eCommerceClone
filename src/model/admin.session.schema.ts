import mongoose, { Schema } from "mongoose";
import { mongo } from "../provider/mongo/mongo"
import { COLLECTION } from "../interface/enum";

interface IAdminSchema {
    adminId: mongoose.Schema.Types.ObjectId,
    isActive:boolean,
    deviceId:string,
}
const AdminSessionSchema = new Schema<IAdminSchema>({
    adminId:mongoose.Schema.Types.ObjectId,
    isActive:Boolean,
    deviceId:String
},{
    timestamps:true
})
export const AdminsessionModel = mongo.getConnection().model<IAdminSchema>(COLLECTION.ADMIN_SESSION,AdminSessionSchema)

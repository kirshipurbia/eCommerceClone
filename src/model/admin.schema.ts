import mongoose, { Schema} from "mongoose"
import { mongo} from "../provider/mongo/mongo"
import { COLLECTION, USER_TYPE } from "../interface/enum"

interface IAdmin {
    name:string,
    password:string,
    email : string
    countryCode: string,
    phoneNumber: string
}

const adminSchema = new Schema<IAdmin>({
    name:String,
    password:String,
    email:String,
    countryCode: { type: String, trim: true, required: true },
    phoneNumber: { type: String, trim: true, required: true, index: true },
})

export const adminModel = mongo.getConnection().model<IAdmin>(COLLECTION.ADMIN,adminSchema)
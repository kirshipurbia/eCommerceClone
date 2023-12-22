import mongoose, { Schema } from "mongoose";
import { mongo } from "../provider/mongo/mongo";
import { COLLECTION, USER_TYPE } from "../interface/enum";
interface IAddress {
  houseNo: string;
  street: string;
  city: string;
  state: string;
  zipCode: number;
  description: string;
}
interface IUser {
  name: string;
  username: string;
  password: string;
  email: string;
  mobile: number;
  address: IAddress[];
}
const AddessSchema = new Schema<IAddress>({
  houseNo: String,
  street: String,
  city: String,
  state: String,
  zipCode : String,
  description: String,
});
const userSchema = new Schema<IUser>({
  name: String,
  username: String,
  password: String,
  email: String,
  mobile: Number,
  address: [AddessSchema],
});
export const userModel = mongo
  .getConnection()
  .model<IUser>(COLLECTION.USER, userSchema);

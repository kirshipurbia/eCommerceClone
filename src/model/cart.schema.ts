import mongoose, { Schema } from "mongoose";
import { mongo } from "../provider/mongo/mongo"
import { COLLECTION } from "../interface/enum";

// Cart schema
interface ICart {
    productId: Schema.Types.ObjectId;
    quantity: number;
    unit_price: number;
    total_cost: number;
  }
  
const cartSchema = new Schema<ICart>({
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    unit_price: {
        type: Number,
        required: true,
    },
    total_cost: {
        type: Number,
        required: true,
    },
},{ timestamps: true })
  
interface IpersonalCart extends Document {
  userId: Schema.Types.ObjectId;
  total_amount: number;
  cart: ICart[];
}
  
const personalCart = new Schema<IpersonalCart>({
    userId: {
        type:   Schema.Types.ObjectId,
        required: true,
    },
    total_amount: {
        type: Number,
        required: true,
    },
    cart: [cartSchema]
},{ timestamps: true });

export const personalCartModel = mongo.getConnection().model<IpersonalCart>(COLLECTION.CART, personalCart);

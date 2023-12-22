import mongoose, { NumberSchemaDefinition, Schema } from "mongoose";
import { mongo } from "../provider/mongo/mongo";
import { COLLECTION, USER_TYPE } from "../interface/enum";

interface IProducts extends Document {
  title: string;
  price: number;
  description: string;
  quantity : number;
  imageUrl: string;
  adminId: Schema.Types.ObjectId;
  review : IReview[]
}
interface IReview {
  userId: Schema.Types.ObjectId;
  rating: number;
  comment: string;
}

const reviewSchema = new Schema<IReview>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
  },
},
{ timestamps: true })


const productSchema = new Schema<IProducts>(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity:{type : Number, required: true},
    description: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    adminId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    review :[reviewSchema]
  },
  {
    timestamps: true,
  }
);

export const productModel = mongo
  .getConnection()
  .model<IProducts>(COLLECTION.PRODUCT, productSchema);

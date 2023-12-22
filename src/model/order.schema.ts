import mongoose, { Schema , Document , model} from "mongoose";
import { mongo } from "../provider/mongo/mongo"
import { COLLECTION } from "../interface/enum";

// Cart schema
export enum status {
    notDeliverd = 'notDeliverdYet',
    delivered ='delivered'
}
interface IOrder extends Document {
  productId: Schema.Types.ObjectId;
  unit_price: number;
  quantity: number;
  delivery_status: string;
  address_id: string;
}
  
const orderSchema = new Schema<IOrder>({
    productId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    unit_price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    delivery_status: {
        type: String,
        enum: Object.values(status),
        default:"pending"
    },
    address_id: {
        type: String,
    },
},{ timestamps: true });

interface IOrderHistory extends Document {
    userId: Schema.Types.ObjectId;
    history: string;
}
const OrderHistorySchema = new Schema<IOrderHistory>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    history: [orderSchema]
},{ timestamps: true });
export const orderModel = mongo.getConnection().model<IOrderHistory>(COLLECTION.ORDER,OrderHistorySchema)
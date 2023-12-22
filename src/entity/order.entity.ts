import { orderModel } from "../model/order.schema";
import BaseEntity from "./base-mongo-entity";
import { personalCartE } from "./cart.entity";
import { ObjectId } from "mongodb";
import { productE } from "./product.entity";

class OrderEntity extends BaseEntity{
    constructor()
    {
        super(orderModel);
    }

    async userHistory (userId: string,address_id: string,field:any) {
        const OrderData:any = await this.findOne({userId: userId},{});
        if (OrderData) {               
            await this.findOneAndUpdate(
                { userId: userId },
                { $push: { history: { $each: field.cart,}}},
                { new: true }
            )
            await this.updateMany(
                { userId: userId },
                { $set: { "history.$[].address_id": address_id }},{});
            await personalCartE.removeCart(userId);
        }
        await this.saveData({userId : userId});
        await this.findOneAndUpdate(
            { userId: userId },
            { $push: { history: { $each: field.cart, } } },
            { new: true }
        );
        await this.updateMany(
            { userId: userId },
            { $set: { "history.$[].address_id": address_id } },{}
        );
        await personalCartE.removeCart(userId);
    }
   
    async findOrderInfo (order_id: string,userId: string) {
        const result = await this.findOne({userId:userId,"history._id": order_id},{})
        return result;
    }
    async findOrderById (userId: string, order_id: string) {
        const pipeline = [
            { $match: { userId: new ObjectId(userId) } },
            { $match: { "history._id": new ObjectId(order_id) } },
            { $unwind: "$history" },
            { $match: { "history._id": new ObjectId(order_id) } },
            { $project: {_id:0,"history.productId":1, "history.delivery_status":1, "history.quantity":1}}
        ];
        const matchResult = await orderModel.aggregate(pipeline);
        return matchResult[0].history;
    }

    async cancelOrderProduct (userId: string,order_id: string,field:any) {
        await this.updateOne({userId:userId},{$pull: { history: { _id: order_id } }},{})
        await personalCartE.updateProductQuantity(field.product_id,-field.quantity);
        
    }
    async myOrder (userId:string) {
        const result = await this.findOne({userId:userId},{})
        return result;
    }

}
export const orderE = new OrderEntity();
import { AcceptAny } from "../interface/type";
import { personalCartModel } from "../model/cart.schema";
import { productModel } from "../model/product.schema";
import BaseEntity from "./base-mongo-entity";
import { productE } from "./product.entity";
import { ObjectId } from "mongodb";

class personalCart extends BaseEntity {
  constructor() {
    super(personalCartModel);
  }
  addProductToCart = async (payload: AcceptAny) => {
    const userCart: any = await this.findOne({ userId: payload.userId }, {});
    if (userCart) {
      const productExist: any = await this.findOne(
        { userId: payload.userId, "cart.productId": payload.productId },
        {}
      );
      console.log(productExist);
      if (productExist) {
        const filter = {
          userId: payload.userId,
          "cart.productId": payload.productId,
        };
        const update = {
          $inc: {
            "cart.$.quantity": 1,
            "cart.$.total_cost": payload.productPrice,
          },
          $set: {
            total_amount: productExist.total_amount + payload.productPrice,
          },
        };
        const result = await this.updateOne(filter, update, {});
        await this.updateProductQuantity(payload.productId, 1);
        return result;
      }
      const result = await this.updateOne(
        { userId: payload.userId },
        {
          $push: {
            cart: {
              productId: payload.productId,
              unit_price: payload.productPrice,
              total_cost: payload.productPrice,
            },
          },
          total_amount: userCart.total_amount + payload.productPrice,
        },
        { upsert: true }
      );
      await this.updateProductQuantity(payload.productId, 1);
      return result;
    }
    console.log("we are here -----------");
    const newCart = await this.saveData({
      userId: payload.userId,
      total_amount: payload.productPrice,
      cart: [
        {
          productId: payload.productId,
          unit_price: payload.productPrice,
          total_cost: payload.productPrice,
        },
      ],
    });
    await this.updateProductQuantity(payload.productId, 1);
    return newCart;
  };

  async updateProductQuantity(product_id: string, quantity: number) {
    await productE.updateOne(
      { _id: product_id },
      { $inc: { quantity: -quantity } },
      {}
    );
  }
  async removeProductFromCart(userId: string, productId: string) {
    const result: any = await this.findCartProductInfo(productId, userId);
    const quantity = result.length > 0 ? result[0].quantity : 0;
    const total_cost = result.length > 0 ? result[0].total_cost : 0;
    await this.updateOne(
      { userId: userId },
      {
        $pull: { cart: { productId: productId } },
        $inc: { total_amount: -total_cost },
      },
      {}
    );
    await productModel.updateOne(
      { _id: productId },
      { $inc: { quantity: quantity } }
    );
  }

  async findCartProductInfo(productId: string, userId: string) {
    const pipeline = [
      { $match: { userId: new ObjectId(userId) } },
      { $match: { "cart.productId": new ObjectId(productId) } },
      { $unwind: "$cart" },
      { $match: { "cart.productId": new ObjectId(productId) } },
      {
        $group: {
          _id: "$cart.productId",
          quantity: { $sum: "$cart.quantity" },
          total_cost: { $sum: "$cart.total_cost" },
        },
      },
    ];
    const matchResult: any = await personalCartModel.aggregate(pipeline);
    return matchResult;
  }
  async removeCart(userId: string) {
    await this.deleteMany({ userId: userId });
  }
  async updateProductCartQuantity(
    userId: string,
    productId: string,
    quantity: number,
    unit_price: number,
    current_quantity: number,
    current_cost: number
  ) {
    const filter = { userId: userId, "cart.productId": productId };
    const newCost = unit_price * quantity - current_cost;
    const update = {
      $set: {
        "cart.$.quantity": quantity,
        "cart.$.total_cost": unit_price * quantity,
      },
      $inc: { total_amount: newCost },
    };
    const result = await this.updateOne(filter, update, {});
    await this.updateProductQuantity(productId, quantity - current_quantity);
    return result;
  }
}

export const personalCartE = new personalCart();

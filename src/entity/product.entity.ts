import { AcceptAny } from "../interface/type";
import { productModel } from "../model/product.schema";
import BaseEntity from "./base-mongo-entity";

class productEntity extends BaseEntity {
  constructor() {
    super(productModel);
  }
  checkProduct = async (productId: AcceptAny) => {
    try {
      return await this.findOne(
        { _id: productId },
        { title: 1, price: 1, quantity: 1 }
      );
    } catch (error) {
      throw error;
    }
  };
  checkProductQuantity = async (quantity: number) => {
    if (quantity >= 1) {
      return true;
    }
    return false;
  };
  async addReview(
    productId: string,
    rating: string,
    comment: string,
    userId: string
  ) {
    await this.updateOne(
      { _id: productId },
      {
        $push: { review: { rating: rating, comment: comment, userId: userId } },
      },{}
    );
  }
  async findReview(reviewId : string, productId : string){
    return await this.findOne({_id : productId , 'review._id' : reviewId},{})
  }
}
export const productE = new productEntity();

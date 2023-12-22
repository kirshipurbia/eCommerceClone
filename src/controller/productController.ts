import { responseUitls } from "../utils/response.util";
import { Request, Response } from "express";
import {
  ExceptionMessage,
  HttpStatusCode,
  HttpStatusMessage,
  SuccessMessage,
} from "../interface/enum";
import { AcceptAny } from "../interface/type";
import { productServiceV1 } from "../service/product.service";
import { productE } from "../entity/product.entity";
import { error } from "console";
import { personalCartE } from "../entity/cart.entity";
import { addProruct } from "../interface/gobal.interface";
import { CustomException } from "../utils/exception.utils";
import { userService } from "../service/user.service";
import { orderE } from "../entity/order.entity";
import { status } from "../model/order.schema";

/**
 * @description This API is used for adding product in db
 * @param req All the data req for product
 * @param res 
 */
class productController {
  AddProduct = async (req: Request, res: Response) => {
    try {
      const adminId = req.body.id
      const payload: addProruct = req.body;
      console.log(payload);
      let response = await productServiceV1.AddProduct(payload , adminId);
      let finalResponce = responseUitls.successResponse(
        { response },
        SuccessMessage.PRODUCT_CREATED,
        HttpStatusMessage.OK
      );
      res.status(HttpStatusCode.ACCEPTED).send(finalResponce);
    } catch (error) {
      let err = responseUitls.errorResponse(
        error,
        ExceptionMessage.SOMETHING_WENT_WRONG
      );
      res.status(HttpStatusCode.BAD_REQUEST).send(err);
    }
  };

  /**
   * @description This API is used for editing product
   * @param req - All the data thats we want to chanage for the product 
   * @param res - Product Edited Successfully 
   */

  EditProduct = async (req: Request, res: Response) => {
    try {
      const adminId = req.body.id
      const payload: AcceptAny = {
        body: req.body,
        query: req.query,
      };
      console.log(payload);
      let response = await productServiceV1.EditProducts(payload , adminId);
      let finalResponce = responseUitls.successResponse(
        { response },
        SuccessMessage.PRODUCT_EDITED,
        HttpStatusMessage.OK
      );
      res.status(HttpStatusCode.ACCEPTED).send(finalResponce);
    } catch (error) {
      let err = responseUitls.errorResponse(
        error,
        ExceptionMessage.SOMETHING_WENT_WRONG
      );
      res.status(HttpStatusCode.BAD_REQUEST).send(err);
    }
  };

  /**
   * @description This API is used for deleting product in db
   * @param req 
   * @param res product deleted successfully 
   */

  DelteProduct = async (req: Request, res: Response) => {
    try {
      const payload: AcceptAny = req.query;
      let response = await productServiceV1.deleteProduct(payload);
      let finalResponce = responseUitls.successResponse(
        { response },
        SuccessMessage.PRODUCT_DELETED,
        HttpStatusMessage.OK
      );
      res.status(HttpStatusCode.OK).send(finalResponce);
    } catch (error) {
      let err = responseUitls.errorResponse(
        error,
        ExceptionMessage.SOMETHING_WENT_WRONG
      );
      res.status(HttpStatusCode.BAD_REQUEST).send(err);
    }
  };

  /**
   * @description This API is used for Geting info about product
   * @param res All the product in the db
   */

  getProduct = async (req: Request, res: Response) => {
    try {
      const payload: AcceptAny = req.query;
      let response = await productServiceV1.GetProducts(payload);
      let finalResponce = responseUitls.successResponse(
        { response },
        SuccessMessage.ALL_PRODUCTS,
        HttpStatusMessage.OK
      );
      res.status(HttpStatusCode.OK).send(finalResponce);
    } catch (error) {
      let err = responseUitls.errorResponse(
        error,
        ExceptionMessage.SOMETHING_WENT_WRONG
      );
      res.status(HttpStatusCode.BAD_REQUEST).send(err);
    }
  };

  /**
   * @description This API is used for adding product to cart
   * @param req productId of the selected product 
   * @param res product added to the cart
   */

  addCart = async (req: Request, res: Response) => {
    try {
      const  userId  = req.body.id;
      const { productId } = req.body;
      console.log(req.body);
      const productDetail: AcceptAny = await productE.checkProduct(productId);
      const allData: AcceptAny = {
        userId: userId,
        productId: productId,
        productPrice: productDetail.price,
      };
      console.log(allData);
      if (!productDetail) {
        let err = responseUitls.errorResponse(
          error,
          ExceptionMessage.PRODUCT_NOT_EXSITS,
          HttpStatusMessage.NOT_FOUND
        );
        res.status(HttpStatusCode.NOT_FOUND).send(err);
      }
      const checkQuantity = await productE.checkProductQuantity(
        productDetail.quantity
      );
      if (checkQuantity) {
        const cart = await personalCartE.addProductToCart(allData);
        let finalResponce = responseUitls.successResponse(
          cart,
          SuccessMessage.PRODUCT_ADDED,
          HttpStatusMessage.ACCEPTED
        );
        return res.status(HttpStatusCode.ACCEPTED).send(finalResponce);
      }
      const err = responseUitls.errorResponse(
        error,
        ExceptionMessage.PRODUCT_NOT_EXSITS,
        HttpStatusMessage.BAD_REQUEST
      );
      return res.status(HttpStatusCode.BAD_REQUEST).send(err);
    } catch (err) {
      err = responseUitls.errorResponse(
        error,
        ExceptionMessage.SOMETHING_WENT_WRONG,
        HttpStatusMessage.INTERNAL_SERVER_ERROR
      );
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err);
    }
  };
  
  /**
   * @description This API is used removing product from cart
   * @param req productiId of the product you wanna remove
   * @param res product Removed 
   */

  async removeFromCart(req: Request, res: Response) {
    try {
      const  userId  = req.body.id;
      const { productId } = req.body;
      const productDetail: any = await personalCartE.findOne(
        { userId: userId, "cart.productId": productId },
        {}
      );
      if (!productDetail) {
        const err = responseUitls.errorResponse(
          productDetail,
          ExceptionMessage.PRODUCT_NOT_EXSITS,
          HttpStatusMessage.NOT_FOUND
        );
        return res.status(HttpStatusCode.NOT_FOUND).send(err);
      }
      const data: any = await personalCartE.removeProductFromCart(
        userId,
        productId
      );
      console.log("Product is removed from cart");
      const finalResponce = responseUitls.successResponse(
        data,
        SuccessMessage.CART_REMOVED,
        HttpStatusMessage.ACCEPTED
      );
      return res.status(HttpStatusCode.ACCEPTED).send(finalResponce);
    } catch (err) {
      console.error(err);
      const errResponce = responseUitls.errorResponse(
        error,
        ExceptionMessage.SOMETHING_WENT_WRONG,
        HttpStatusMessage.INTERNAL_SERVER_ERROR
      );
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errResponce);
    }
  }

  /**
   * @description This API is used for view users cart
   * @param res  all the product data inside the cart 
   */

  async viewMyCart(req: Request, res: Response) {
    try {
      const userId = req.body.id;
      const cartData = await personalCartE.findOne({ userId: userId }, {});
      if (!cartData) {
        throw new CustomException(
          ExceptionMessage.CART_DOES_NOT_EXSIST,
          HttpStatusMessage.NOT_FOUND
        ).getError();
      }
      const finalResponce: AcceptAny = responseUitls.successResponse(
        cartData,
        SuccessMessage.CART_FOUND,
        HttpStatusMessage.OK
      );
      return res.status(HttpStatusCode.OK).send(finalResponce);
    } catch (error) {
      console.error(error);
      const err = responseUitls.errorResponse(
        res,
        ExceptionMessage.SOMETHING_WENT_WRONG,
        HttpStatusMessage.INTERNAL_SERVER_ERROR
      );
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err);
    }
  }

  /**
   * @description This API is used for placing order
   * @param req AddressId of the user who's placing the order 
   * @param res Order placed 
   */

  async placeOrder(req: Request, res: Response) {
    try {
      const  userId  = req.body.id;
      const { address_id } = req.body;
      const cartData = await personalCartE.findOne({ userId: userId }, {});
      if (!cartData) {
        const err = responseUitls.errorResponse(
          res,
          ExceptionMessage.CART_DOES_NOT_EXSIST,
          HttpStatusMessage.NOT_FOUND
        ); 
        return res.status(HttpStatusCode.NOT_FOUND).send(err);
      }
      const addressDetail = await userService.findAddress(userId, address_id);
      if (!addressDetail) {
        const err = responseUitls.errorResponse(
          addressDetail,
          ExceptionMessage.ADDRESSS_NOT_FOUND,
          HttpStatusMessage.NOT_FOUND
        );
        return res.status(HttpStatusCode.NOT_FOUND).send(err);
      }
      const orderData: AcceptAny = await orderE.userHistory(
        userId,
        address_id,
        cartData
      );
      const finalResponce = responseUitls.successResponse(
        orderData,
        SuccessMessage.ORDER_PLACED,
        HttpStatusMessage.CREATED
      );
      return res.status(HttpStatusCode.CREATED).send(finalResponce);
    } catch (err) {
      console.error(err);
      const errorr = responseUitls.errorResponse(
        error,
        ExceptionMessage.INSERT_VALID_DATA,
        HttpStatusMessage.BAD_REQUEST
      );
      return res.status(HttpStatusCode.BAD_REQUEST).json(errorr);
    }
  }

  /**
   * @description This API is used for adding canceling order
   * @param req orderId of the orderplaced 
   * @param res Order Canceled
   */

  async cancelOrder(req: Request, res: Response) {
    try {
      const  userId  = req.body.id;
      const { order_id } = req.body;
      const orderExist: any = await orderE.findOrderInfo(order_id, userId);
      if (!orderExist) {
        const err = responseUitls.errorResponse(
          orderExist,
          ExceptionMessage.ORDER_DATA_NOT_FOUND,
          HttpStatusMessage.NOT_FOUND
        );
        return res.status(HttpStatusCode.NOT_FOUND).send(err);
      }
      const orderDetail: any = await orderE.findOrderById(userId, order_id);
      if (orderDetail.delivery_status === status.delivered) {
        const err = responseUitls.errorResponse(
          orderDetail,
          ExceptionMessage.ORDER_ALREADY_DELIVERED,
          HttpStatusMessage.UNAUTHORIZED
        );
        return res.status(HttpStatusCode.UNAUTHORIZED).send(err);
      }
      await orderE.cancelOrderProduct(userId, order_id, orderDetail);
      const finalResponce = responseUitls.successResponse(
        orderDetail,
        SuccessMessage.ORDER_CANCELED,
        HttpStatusMessage.ACCEPTED
      );
      return res.status(HttpStatusCode.ACCEPTED).send(finalResponce);
    } catch (error) {
      console.error(error);
      const err = responseUitls.errorResponse(
        error,
        ExceptionMessage.SOMETHING_WENT_WRONG,
        HttpStatusMessage.INTERNAL_SERVER_ERROR
      );
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err);
    }
  }

  /**
   * @description This API is used for viewing your order history
   * @param req - 
   * @param res Orders Placed by the user 
   */

  async viewMyOrder(req: Request, res: Response) {
    try {
      const  userId  = req.body.id;
      const orderData = await orderE.myOrder(userId);
      const finalResponce = responseUitls.successResponse(
        orderData,
        SuccessMessage.ORDER_FOUND,
        HttpStatusMessage.ACCEPTED
      );
      return res.status(HttpStatusCode.ACCEPTED).send(finalResponce);
    } catch (err) {
      console.error(err);
      const errorResponse = responseUitls.errorResponse(
        error,
        ExceptionMessage.SOMETHING_WENT_WRONG,
        HttpStatusMessage.INTERNAL_SERVER_ERROR
      );
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .send(errorResponse);
    }
  }
   /**
   * @description This API is used for adding review
   * @param req orderId , rating and comment is passed in the payload 
   * @param res Added reveiw 
   */
  async Addreview(req:any, res:any) {
    try {
        const userId= req.body.id;
        const {order_id, rating, comment } = req.body;
        console.log(req.Body , "Payload Content")
        const orderExist = await orderE.findOrderInfo(order_id,userId)
        if(!orderExist){
          const err = responseUitls.errorResponse(
            orderExist,
            ExceptionMessage.ORDER_DATA_NOT_FOUND,
            HttpStatusMessage.NOT_FOUND
          )
            return res.status(HttpStatusCode.NOT_FOUND).send(err)
        }
        const orderDetail = await orderE.findOrderById(userId,order_id);
        if (orderDetail.delivery_status === status.notDeliverd) {
            const err = responseUitls.errorResponse(
              error,
              ExceptionMessage.ORDER_NOT_DELIVERED_YET,
              HttpStatusMessage.UNAUTHORIZED
            )
            return res.status(HttpStatusCode.UNAUTHORIZED).send(err)
        }
        
        const response : AcceptAny= await productE.addReview(orderDetail.productId,rating,comment,userId)
        const finalResponce = responseUitls.successResponse(
          response,
          SuccessMessage.REVIEW_ADDED,
          HttpStatusMessage.CREATED
        )
        return res.status(HttpStatusCode.CREATED).send(finalResponce)
    } catch(err) {
        console.error(err);
        const errorResponce = responseUitls.errorResponse(
          error,
          ExceptionMessage.SOMETHING_WENT_WRONG,
          HttpStatusMessage.INTERNAL_SERVER_ERROR
        )
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errorResponce)
    }
};
 


}
export const ProductControllerV1 = new productController();

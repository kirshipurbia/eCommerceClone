import { MAIL_SUBJECT } from "../constant/constants";
import { userEntity } from "../entity/user.entity";
import {
  ExceptionMessage,
  HttpStatusCode,
  HttpStatusMessage,
  SuccessMessage,
} from "../interface/enum";
import jwt from "jsonwebtoken";
import { AcceptAny } from "../interface/type";
import { redis } from "../provider/redis/redis";
import { CustomException } from "../utils/exception.utils";
import { utils } from "../utils/utils";
import { productE } from "../entity/product.entity";
import { title } from "process";
import { productModel } from "../model/product.schema";
class ProductService {
  AddProduct = async (payload: AcceptAny , adminId : string) => {
    
    try {
      const { title, price, quantity, description, imageUrl } = payload;

      await productE.saveData({
        title: title,
        price: price,
        quantity : quantity,
        description: description,
        imageUrl: imageUrl,
        adminId: adminId,
      });
      console.log(payload)
    } catch (error) {
      throw error;
    }
  };
  EditProducts = async (payload: AcceptAny , adminId : string) => {
    try {
      const { title, price, description, imageUrl } = payload.body;
      const { productId } = payload.query;
      const ExsistingProduct = productE.findOne(
        { _id: productId , adminId : adminId },
        {
          title: 1,
          price: 1,
          description: 1,
          imageUrl: 1,
        },
        {}
      );
      if (!ExsistingProduct) {
        throw new CustomException(
          ExceptionMessage.PRODUCT_NOT_EXSITS,
          HttpStatusMessage.NOT_FOUND
        );
      } else {
        await productE.updateOne(
          { _id: productId },
          {
            title: title,
            price: price,
            description: description,
            imageUrl: imageUrl,
          },
          {}
        );
      }
    } catch (error) {
      throw error;
    }
  };
   deleteProduct = async (payload:AcceptAny) => {
        try {
            const {productId} = payload;
            if(productId){
                const productExsists = await productE.findOne({_id : productId},{title:1,price:1})
                if(!productExsists){
                    throw new CustomException(
                        ExceptionMessage.PRODUCT_NOT_EXSITS,
                        HttpStatusMessage.NOT_FOUND
                    )
                }
            }else{
                throw new CustomException(
                    ExceptionMessage.NOT_VALID_PRODUCT_ID,
                    HttpStatusMessage.NOT_ACCEPTABLE
                )
            }
            await productE.deleteMany({_id : productId})
        }catch(error){
            throw error
        }
    
  };
  GetProducts = async (payload : AcceptAny) => {
    try {
      const { page = 1, pageSize = 10 } = payload; // Default page and page size if not provided
  
      const skipCount = (page - 1) * pageSize; // Calculate the number of documents to skip
  
      const totalProducts = await productModel.countDocuments({}); // Get the total count of products
  
      const products = await productModel
        .find({})
        .skip(skipCount)
        .limit(pageSize);
  
      return {
        products,
        totalPages: Math.ceil(totalProducts / pageSize),
        currentPage: page,
        pageSize,
        totalProducts,
      };
    } catch (error) {
      throw error;
    }
  };
  
 
  
}

export const productServiceV1 = new ProductService();

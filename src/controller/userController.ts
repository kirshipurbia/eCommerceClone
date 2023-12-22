import {
  ExceptionMessage,
  HttpStatusCode,
  HttpStatusMessage,
  SuccessMessage,
} from "../interface/enum";
import { userService } from "../service/user.service";
import { responseUitls } from "../utils/response.util";
import { Request, Response } from "express";
import { WellcomeMsg } from "../interface/enum";
import { AcceptAny } from "../interface/type";
import { userSessionE } from "../entity/session.entity";
import { RedisScripts } from "redis";
import { userEntity } from "../entity/user.entity";
import { adminSessionE } from "../entity/admin.session.entity";
import bcrypt from 'bcrypt'
import { CustomException } from "../utils/exception.utils";
class UserController {
    /**
   * @param req 
   * @param res TESTING API FOR HOME PAGE 
   */
  home = async (req: Request, res: Response) => {
    const vatsal = await bcrypt.hash('vatsal' , 3)
    console.log(vatsal);
    res.send(WellcomeMsg.WELLCOME_TO_USER_SERVICE);

  };
  /**
   * @description This api is used for singUp user
   * @param req All the data of user
   * @param res send otp to user for verification
   */
  signin = async (req: Request, res: Response) => {
    try {
      const hashPass = await bcrypt.hash(req.body.password , 3)
      const payload = {
        name: req.body.name,
        username: req.body.username,
        password: hashPass,
        email: req.body.email,
        mobile: req.body.mobile,
        type: req.body.type,
      };
      let response = await userService.signinRedis(payload);
      let finalResponse = responseUitls.successResponse(
        { response },
        SuccessMessage.Mail_SEND,
        HttpStatusMessage.OK
      );
      res.status(HttpStatusCode.OK).send(finalResponse);
    } catch (error) {

      let err = responseUitls.errorResponse(
        error,
        ExceptionMessage.USER_ALREADY_EXIST
      );
      res.status(HttpStatusCode.BAD_REQUEST).send(err);
    }
  };
  /**
   * @description This api is used for Login admin
   * @param req EMAIL AND PASSWORD FOR ADMIN LOGIN
   * @param res OTP GENRATION
   */
  signinVerification = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      let response = await userService.signin(payload);
      let finalResponse = responseUitls.successResponse(
        { response },
        SuccessMessage.USER_REGISTRATION,
        HttpStatusMessage.CREATED
      );
      res.send(finalResponse);
    } catch (err) {
      let error = responseUitls.errorResponse(err);
      res.send(error);
    }
  };
  /**
   * @description This api is used for Login User
   * @param req EMAIL AND PASSWORD FOR user LOGIN
   * @param res Session and Token Mangment
   */
  login = async (req: Request, res: Response) => {
    try {
      const reqBody = req.body;
      const reqHeaders = req.headers;
      const payload: AcceptAny = {
        body: reqBody,
        headers: reqHeaders,
      };


      const response: AcceptAny = await userService.login(payload);
      const finalResponce = responseUitls.successResponse(
        response,
        HttpStatusMessage.ACCEPTED
      );
      res.status(HttpStatusCode.ACCEPTED).send(finalResponce);
    } catch (error) {
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .send(
          responseUitls.errorResponse(
            error,
            ExceptionMessage.EMAIL_NOT_EXISTS,
            HttpStatusMessage.INTERNAL_SERVER_ERROR
          )
        );
    }
  };
  /**
   * @description This api is used to logout User
   * @param req - 
   * @param res Killing session 
   */
  async logout (req : Request , res : Response ){
    try{
      const userId = req.body.id;
      const response: any = await userSessionE.userlogout(userId);
      const finalData = responseUitls.successResponse(
        response,
        SuccessMessage.SUCCESSFULLY_LOGEDOUT,
        HttpStatusMessage.ACCEPTED
        );
        res.status(HttpStatusCode.ACCEPTED).send(finalData);
      }
      catch(error){
        console.log(error)
        const errResponce = responseUitls.errorResponse(
          error,
          ExceptionMessage.FAILED_TO_LOGOUT,
          HttpStatusMessage.INTERNAL_SERVER_ERROR
        )
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errResponce)
      }
  }
 /**
   * @description This api is used for reseting password
   * @param req - email
   * @param res Sending otp to email for verification
   */
  async forgotPassword(req : Request , res : Response){
    try {
      const {email} = req.body;
      const UserData : any = await userEntity.findUser(email)
      if(!UserData) {
          const err = responseUitls.errorResponse(
            UserData,
            ExceptionMessage.USER_NOT_FOUND,
            HttpStatusMessage.NOT_FOUND
          )
          return res.status(HttpStatusCode.NOT_FOUND).send(err);
      }
      const response : any = await adminSessionE.forgotPassEmailVerify(email)
      const finalData = responseUitls.successResponse(
        response,
        SuccessMessage.SUCCESSFULLY_LOGEDOUT,
        HttpStatusMessage.ACCEPTED
        );
       return res.status(HttpStatusCode.CREATED).send(finalData);

  } catch(err) {
      console.error(err);
      const errResponce = responseUitls.errorResponse(
        err,
        ExceptionMessage.FAILED_TO_VERIFY,
        HttpStatusMessage.INTERNAL_SERVER_ERROR
      )
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errResponce)
  }
  /**
   * @description This api is used for reseting password
   * @param req - email , otp , NewPassword
   * @param res New password is set
   */
  
  }
  async resetPassword(req : Request , res : Response){
    try{
      const {email,otp,newPassword} = req.body
      const result : any = await  userEntity.setNewPassword(email,otp.toString(),newPassword)
      const finalResponce = responseUitls.successResponse(
        result,
        SuccessMessage.PASSWORD_CHANGED,
        HttpStatusMessage.ACCEPTED
      )
      res.status(HttpStatusCode.ACCEPTED).send(finalResponce)
  
     }
     catch(error){
      console.log(error)
      const errResponce = responseUitls.errorResponse(
        error,
        ExceptionMessage.FAILED_TO_CHANGE_PASSWORD,
        HttpStatusMessage.INTERNAL_SERVER_ERROR
      )
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errResponce)
     }
  }
   /**
   * @description This api is used by the user to add Address
   * @param req  Address data like houseno, city , state , zipcode and additional info
   * @param res  New address created
   */
  
  async addAddress (req: Request , res : Response){
    try {
      const userId = req.body.id
      const {houseno, street, city, state, zipCode, description} = req.body
      const payload : any= {
        houseno : houseno,
        street : street,
        city : city,
        state : state,
        zipCode : zipCode,
        description : description
      }
      const addaddress = await userEntity.addAddress(userId, payload)
      if(!addaddress){
        throw new CustomException(
           ExceptionMessage.PROBLEM_IN_ADDING_ADDRESS,
           HttpStatusMessage.NOT_IMPLEMENTED
        )
      }
      const finalResponce = responseUitls.successResponse(
        addaddress,
        SuccessMessage.ADDRESS_ADDED,
        HttpStatusMessage.CREATED
      )
      res.status(HttpStatusCode.CREATED).send(finalResponce)
    }catch(error){
      const errResponce = responseUitls.errorResponse(
        error,
        ExceptionMessage.FAILED_TO_ADD_ADDRESS,
        HttpStatusMessage.INTERNAL_SERVER_ERROR
      )
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errResponce)
    }
  }
  
}
export const userController = new UserController();

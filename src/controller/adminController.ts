import {
  ExceptionMessage,
  HttpStatusCode,
  HttpStatusMessage,
  OTP,
  RedisExpirydata,
  SuccessMessage,
  WellcomeMsg,
} from "../interface/enum";
import { responseUitls } from "../utils/response.util";
import { Request, Response, response } from "express";
import { utils } from "../utils/utils";
import { AcceptAny } from "../interface/type";
import { adminE } from "../entity/admin.entity";
import { CustomException } from "../utils/exception.utils";
import { adminSessionE } from "../entity/admin.session.entity";
import { nodeMailer } from "../provider/nodemailer/nodenmailer";
import { redis } from "../provider/redis/redis";
import { MAIL_SUBJECT } from "../constant/constants";
import { error } from "console";
import { adminLogin } from "../interface/gobal.interface";


class adminController {
  /**
   *@description This API is used for testing that server is active or not
   * @param req
   * @param res TESTING API FOR HOME PAGE
   */
  home = async (req: Request, res: Response) => {
    res.send(WellcomeMsg.WELLCOME_TO_ADMIN_SERVICE);
  };
  /**
   * @description This api is used for Login admin
   * @param req EMAIL AND PASSWORD FOR ADMIN LOGIN
   * @param res OTP GENRATION
   */
  login = async (req: Request, res: Response) => {
    try {
      const payload: adminLogin = req.body;
      const admin: AcceptAny = await adminE.checkEmailExist(payload.email);
      if (!admin) {
        throw new CustomException(
          ExceptionMessage.EMAIL_NOT_EXISTS,
          HttpStatusMessage.NOT_FOUND
        ).getError();
      }
      if (admin.password !== payload.password) {
        throw new CustomException(
          ExceptionMessage.INVALID_PASSWORD,
          HttpStatusMessage.UNAUTHORIZED
        ).getError();
      }

      const subject = MAIL_SUBJECT.ADMIN_OTP_VERIFICATION;
      const otp = utils.otpGenerator(OTP.ADMIN_OTP);
      redis.setKeyWithExpiry(
        `OTP${payload.email}`,
        `${otp}`,
        RedisExpirydata.ADMIN_LOGIN_OTP
      );
      nodeMailer.sendMail(`${payload.email}`, `${otp}`, subject, admin.name);
      let payloadData = JSON.stringify(payload);
      // TODO use constants for seconds in the redis function
      redis.setKeyWithExpiry(
        `${payload.email}+${otp}`,
        `${payloadData}`,
        RedisExpirydata.ADMIN_LOGIN_OTP
      );
      const finalResponce = responseUitls.successResponse(
        { payloadData },
        SuccessMessage.Mail_SEND,
        HttpStatusMessage.OK
      );
      res.status(HttpStatusCode.OK).send(finalResponce);
    } catch (error) {
      const err = responseUitls.errorResponse(
        error,
        ExceptionMessage.SOMETHING_WENT_WRONG,
        HttpStatusMessage.INTERNAL_SERVER_ERROR
      );
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err);
    }
  };
  /**
   * @description This api is used for session managment for admin and token genration
   * @param req EMAIL AND PASSWORD FOR ADMIN LOGIN
   * @param res OTP GENRATION
   */
  otpVerify = async (req: Request, res: Response) => {
    try {
      const payload: AcceptAny = req.body;
      const admin = await adminE.findOne({ email: req.body.email }, { _id: 1 });
      if (!admin) {
        throw new CustomException(
          ExceptionMessage.ADMIN_NOT_FOUND,
          HttpStatusMessage.NOT_FOUND
        ).getError();
      }
      const otp = await adminE.verifyOtp(payload.email);
      if (otp !== payload.otp) {
        const err = responseUitls.errorResponse(
          error,
          ExceptionMessage.INCORRECT_OTP,
          HttpStatusMessage.UNAUTHORIZED
        );
        res.status(HttpStatusCode.UNAUTHORIZED).send(err);
      }
      const payloadData = JSON.stringify(payload);
      const adminSession = await adminSessionE.createAdminSession(admin);
      const accesToken = await adminSessionE.createAdminToken(adminSession);
      const finalResponce = responseUitls.successResponse(
        { payloadData },
        accesToken
      );
      res.status(HttpStatusCode.OK).send(finalResponce);
    } catch (error) {
      const err = responseUitls.errorResponse(
        error,
        ExceptionMessage.SOMETHING_WENT_WRONG,
        HttpStatusMessage.INTERNAL_SERVER_ERROR
      );
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err);
    }
  };
  /**
   * @description This api is used for fetching all data from UserCollection
   * @param req --
   * @param res All Users
   */
  async getAllUser(req: Request, res: Response) {
    try {
      const UserData = adminE.findAllUsers;
      const finalResponce = responseUitls.successResponse(
        UserData,
        SuccessMessage.ALL_USER_DATA_FOUND,
        HttpStatusMessage.OK
      );
      return res.status(HttpStatusCode.OK).send(finalResponce);
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
   * @description This API is used to remove user
   * @param req UserId to find userinfo
   * @param res All Users
   */
  async removeUser(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const UserData: any = await adminE.findUser(userId);
      if (!UserData) {
        const err = responseUitls.errorResponse(
          UserData,
          ExceptionMessage.USER_DATA_FOUND,
          HttpStatusMessage.NOT_FOUND
        );
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err);
      }
      const DataRemoved: any = await adminE.removeAccount(userId);
      const finalResponce = responseUitls.successResponse(
        DataRemoved,
        SuccessMessage.USER_ACCOUNT_REMOVED,
        HttpStatusMessage.OK
      );
      return res.status(HttpStatusCode.OK).send(finalResponce);
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
   * @description This API is used to logout Admin
   * @param req Token will be passed in authorization
   * @param res Admin Session Logout 
   */
  async logout(req: Request, res: Response) {
    try{

      const adminId = req.body.id;
      const response: any = await adminSessionE.adminLogout(adminId);
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
   * @description This API is used when Admin needs to reset password
   * @param req email is passed 
   * @param res Mail is sent to email for Verification process 
   */
  async forgetPassword(req:Request, res:Response) {
    try {
        const {email} = req.body;
        const adminData : any = await adminSessionE.VerifyAdmin(email)
        if(!adminData) {
            const err = responseUitls.errorResponse(
              adminData,
              ExceptionMessage.ADMIN_NOT_FOUND,
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
          error,
          ExceptionMessage.FAILED_TO_VERIFY,
          HttpStatusMessage.INTERNAL_SERVER_ERROR
        )
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(errResponce)
    }
  }/**
   * @description This API is used when Admin needs to reset password
   * @param req email , otp and newPassword that he wanna set 
   * @param res Password is changed
   */
  async setNewPass(req : Request , res : Response){
   try{
    const {email,otp,newPassword} = req.body
    const result : any = await adminSessionE.setNewPassword(email,otp.toString(),newPassword)
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

}

export const adminControllerV1 = new adminController();

import BaseEntity from "./base-mongo-entity";
import { redis } from "../provider/redis/redis";
import { AcceptAny } from "../interface/type";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { AdminsessionModel } from "../model/admin.session.schema";
import { utils } from "../utils/utils";
import { OTP, RedisExpirydata } from "../interface/enum";
import { nodeMailer } from "../provider/nodemailer/nodenmailer";
import { MAIL_SUBJECT } from "../constant/constants";
import { error } from "console";
import { adminE } from "./admin.entity";
// TODO dotenv should have a proper file for where it is called 
dotenv.config()
class SessionEntity extends BaseEntity {
  constructor() {
    super(AdminsessionModel);
  }
  async logoutPreviousSession(userId: string) {
    try {
      await this.updateMany(
        { adminId: userId },
        { isActive: false, updatedAt: new Date().getTime() },
        { new: true, multi: true }
      );

      return {};
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async createAdminToken(sessionData: any) {
    try {
        const dataForToken: AcceptAny = {
            sessionId: sessionData._id,
            adminId: sessionData.adminId,
        };
        return  jwt.sign(dataForToken, `${process.env.SECRET_KEY}` ,{ expiresIn : '1h'});
    } catch (error) {
        // utils.consolelog('createAdminTokenAndSession Catch block', error);
        throw error;
    }
}
  async createAdminSession(payload: AcceptAny) {
    try {
      const adminData: AcceptAny = payload;
      await this.logoutPreviousSession(adminData._id);
      const sessionInfo: AcceptAny = {
        adminId: adminData._id,
        isActive: true,
      };
      const session = await this.saveData(sessionInfo);
      const dataToSaveInRedis = {
        sessionId: session._id.toString(),
        isActive: true,
        ...adminData,
      };
      const dataToSave: any = {
        adminData: JSON.stringify(dataToSaveInRedis),
        adminId: adminData._id,
        status: adminData.status,
      };
      redis.setHash(
        `$AMDINDATA{adminData._id}`,
        adminData._id.toString(),
        JSON.stringify(dataToSave)
      );
      return session;
    } catch (error) {
      throw error;
    }
  }
  async adminLogout(adminId : string){
    await this.updateOne({adminId : adminId}, {isActive : false},{})
  }
  async VerifyAdmin(email: string){
    await this.findOne({email : email},{})
  }
  async forgotPassEmailVerify(email : string){
    const subject = MAIL_SUBJECT.ADMIN_OTP_FORGOTPASSWORD_KEY
    let otp =  utils.otpGenerator(OTP.ADMIN_OTP)
    nodeMailer.sendMail(`${email}`,`${otp}`,subject,`${email}`)
    await redis.setKeyWithExpiry(`${email}OTP` , `${otp}`, RedisExpirydata.ADMIN_LOGIN_DATA)
  }
  async setNewPassword(email: string, otp: string, newPassword : string){
    const redisOtp = await redis.getKey(`${email}OTP`)
    if(redisOtp !== otp){
      throw error
    }
    await adminE.updateOne({email : email},{password : newPassword},{})
  }
}
export const adminSessionE = new SessionEntity();

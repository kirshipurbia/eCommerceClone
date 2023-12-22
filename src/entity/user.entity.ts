import { error } from "console";
import { MAIL_SUBJECT } from "../constant/constants";
import { OTP, RedisExpirydata } from "../interface/enum";
import { userModel } from "../model/user.schema";
import { nodeMailer } from "../provider/nodemailer/nodenmailer";
import { redis } from "../provider/redis/redis";
import { utils } from "../utils/utils";
import BaseEntity from "./base-mongo-entity";

class UserEntity extends BaseEntity {
  constructor() {
    super(userModel);
  }
  async findUser(userId: string) {
    return await this.findOne({ _id: userId }, { name: 1 });
  }
  async forgotPassEmailVerify(email: string) {
    const subject = MAIL_SUBJECT.USER_OTP_FORGOTPASSWORD_KEY;
    let otp = utils.otpGenerator(OTP.USER_OTP);
    nodeMailer.sendMail(`${email}`, `${otp}`, subject, `${email}`);
    await redis.setKeyWithExpiry(
      `${email}OTP`,
      `${otp}`,
      RedisExpirydata.ADMIN_LOGIN_DATA
    );
  }
  async setNewPassword(email: string, otp: string, newPassword: string) {
    const redisOtp = await redis.getKey(`${email}OTP`);
    if (redisOtp !== otp) {
      throw error;
    }
    await this.updateOne({ email: email }, { password: newPassword }, {});
  }
  async addAddress(userId: string, payload: any) {
    try {
      const data = await this.updateOne(
        { _id: userId },
        { $push: { address: payload } },
        {}
      );
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
export const userEntity = new UserEntity();

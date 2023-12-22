import { MAIL_SUBJECT } from "../constant/constants";
import { userEntity } from "../entity/user.entity";
import {
  ExceptionMessage,
  HttpStatusCode,
  HttpStatusMessage,
  OTP,
  RedisExpirydata,
  SuccessMessage,
} from "../interface/enum";
import jwt from "jsonwebtoken";
import { AcceptAny } from "../interface/type";
import { nodeMailer } from "../provider/nodemailer/nodenmailer";
import { redis } from "../provider/redis/redis";
import { CustomException } from "../utils/exception.utils";
import { utils } from "../utils/utils";
import { userSessionE } from "../entity/session.entity";
import { sign } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { error } from "console";

class UserService {
  constructor() {}
  signinRedis = async (payload: AcceptAny) => {
    try {
      let data = await userEntity.findOne(
        { $or: [{ username: payload.username }, { email: payload.email }] },
        { email: 1, username: 1 },
        {}
      );
      console.log(data, "------------");
      if (data == null) {
        let token = utils.otpGenerator(OTP.USER_OTP);
        console.log(token);
        const subject = MAIL_SUBJECT.VERIFICATION_OTP;
        await nodeMailer.sendMail(payload.email, token, subject, payload.name);
        redis.setKeyWithExpiry(
          `${token}`,
          `${payload.email}`,
          RedisExpirydata.USER_SINGIN_REDIS
        );
        let payloadData = JSON.stringify(payload);
        redis.setKeyWithExpiry(
          `${payload.email}+${token}`,
          `${payloadData}`,
          RedisExpirydata.USER_SINGIN_REDIS
        );
        return SuccessMessage.USER_REGISTRATION_MAIL;
      }

      if (data.email) {
        throw new CustomException(
          ExceptionMessage.EMAIL_ALREADY_EXIST,
          HttpStatusMessage.FORBIDDEN
        );
      } else if (data.username) {
        throw new CustomException(
          ExceptionMessage.USER_ALREADY_EXIST,
          HttpStatusMessage.FORBIDDEN
        );
      }
      // console.log('exitingCode ---- herere')
    } catch (error) {
      throw error;
    }
  };
  signin = async (payload: AcceptAny) => {
    try {
      let email = await redis.getKey(`${payload.otp}`);
      if (email == null) {
        throw new CustomException(
          ExceptionMessage.INCORRECT_OTP,
          HttpStatusMessage.FORBIDDEN
        );
      }
      let data = "" + (await redis.getKey(`${email}+${payload.otp}`));
      console.log(data)
      let finalData = JSON.parse(data);
      await userEntity.insertMany(finalData, {}).catch(() => {
        throw new CustomException(
          ExceptionMessage.SOMETHING_WENT_WRONG,
          HttpStatusMessage.INTERNAL_SERVER_ERROR
        ).getError();
      });
      return SuccessMessage.USER_REGISTRATION;
    } catch (error) {
      throw error;
    }
  };
  login = async (payload: AcceptAny) => {
    try {
      let data = await userEntity.findOne(
        {
          username: payload.body.username,
        },
        { _id: 1, password: 1 },
        {}
      );
      const DecryptPass = await bcrypt.compare(
        payload.body.password,
        data.password
      );
      console.log(DecryptPass, 'Password match ?')
      if (data) {
        if (DecryptPass) {
          console.log('here ----------')
          let redisSession = await redis.getKey(data._id);
          console.log(redisSession)
          if (!redisSession) {
            let dataSession = await userSessionE.findOne(
              {
                userId: data._id,
                isActive: true,
                deviceId: payload.headers.deviceId,
              },
              {}
            );
            if (dataSession) {
              if (dataSession.deviceId !== payload.headers.deviceId) {
                await userSessionE.saveData({
                  userId: data._id,
                  isActive: true,
                  deviceId: payload.headers.deviceId,
                });
              }
              redis.setKeyWithExpiry(
                `${data._id}`,
                `${data.deviceId}`,
                RedisExpirydata.USER_SINGIN_REDIS
              );
            } else {
              await userSessionE.saveData({
                userId: data._id,
                isActive: true,
                deviceId: payload.headers.deviceId,
              });
              redis.setKeyWithExpiry(
                `${data._id}`,
                `${data.deviceId}`,
                RedisExpirydata.USER_SINGIN_REDIS
              );
            }
            await userSessionE.updateMany(
              {
                userId: data?._id,
                deviceId: { $ne: payload.headers.deviceId },
              },
              { isActive: false },
              { userId: 1, isActive: 1, deviceId: 1 }
            );
            console.log('we here at token genration -- -- -  ')
            const token = sign(
              { _id: data?._id },
              `${process.env.SECRET_KEY}`,
              {
                expiresIn: "1h",
              }
            );
            console.log(token)
            return token;
          }
        }
      } else {
        throw new CustomException(
          ExceptionMessage.USER_NOT_FOUND,
          HttpStatusMessage.NOT_FOUND
        );
      }
    } catch (error) {
      throw error;
    }
  };
  async findAddress(userId: string, addressId: string) {
    try {
      return await userEntity.findOne(
        { _id: userId, "address._id": addressId },
        {}
      );
    } catch (error) {
      throw error;
    }
  };
}
export const userService = new UserService();

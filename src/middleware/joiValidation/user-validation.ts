import Joi from 'joi';
import { USER_TYPE } from '../../interface/enum';

const ADDRESS = Joi.object({
    houseno: Joi.string().required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    description: Joi.string().optional()
})

export const JOI_VALIDATION = {
    USER: {
        SIGNUP: {
            name : Joi.string().min(2).max(40).required(),
            username : Joi.string().min(2).max(30).required(),
            email: Joi.string().min(1).required(),
            password : Joi.string().min(8).max(30),
            mobile: Joi.number().min(10).required(),
            type: Joi.number().valid(USER_TYPE.BUYER, USER_TYPE.BUYER),
        },
        LOGIN: {
            username: Joi.string().min(1).required(),
            password: Joi.string().min(3).max(30).required(),
        },
        VERIFY_OTP: {
            otp: Joi.string().min(6).max(6).required(),
        },
        FORGOT_PASSWORD :{
            email: Joi.string().min(1).required()
        },
        SET_NEW_PASS :{
            email: Joi.string().min(1).required(),
            otp: Joi.string().min(6).max(6).required(),
            newPassword : Joi.string().min(8).max(30).required()
        },
        ADD_NEW_ADDRESS : {
            address : ADDRESS
        }
        
    },
    ADMIN : {
        LOGIN :{
            email : Joi.string().min(2).max(30).required(),
            password : Joi.string().min(3).max(30).required()
        },
        OTP_VERIFY : {
            email :  Joi.string().min(2).max(30).required(),
            otp : Joi.string().max(4).required()
        },
        FORGOT_PASSWORD :{
            email :  Joi.string().min(2).max(30).required()
        },
        SET_NEW_PASSWORD :{
            email :  Joi.string().min(2).max(30).required(),
            otp : Joi.string().max(4).required(),
            newPassword : Joi.string().min(8).max(30)
        }

    },
    MQTTCHAT : {
        SENDCHAT : {
            message : Joi.string().min(1).max(200).required()
        }
    }
   
};

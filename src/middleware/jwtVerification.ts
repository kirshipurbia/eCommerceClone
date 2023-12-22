import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { sessionModel } from "../model/session.schema";
import dotenv from "dotenv";
import {
  ExceptionMessage,
  HttpStatusCode,
  HttpStatusMessage,
} from "../interface/enum";
import { AcceptAny } from "../interface/type";
import { userSessionE } from "../entity/session.entity";
import { CustomException } from "../utils/exception.utils";
import { responseUitls } from "../utils/response.util";
import { error } from "console";
dotenv.config();

class sessionCheck {
  tokenVerification = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const token = "" + req.headers.authorization;
    if(!token){
      throw error
    }
    let decoded: AcceptAny;

    try {
      decoded = jwt.verify(token, `${process.env.SECRET_KEY}`)
      if(!decoded){
        const errorResponce = responseUitls.errorResponse(
          error,
          ExceptionMessage.TOKENIZATION_ERROR,
          HttpStatusMessage.AMBIGUOUS
        )
      }
      let data = await userSessionE.findOne(
        {
          userId: decoded._id,
          isActive: true,
        },
        {}
      );
      if (data) {
        req.body.id = decoded._id;
        next();
      } else {
        throw new CustomException(
          ExceptionMessage.AUTH_INVALID_TOKEN,
          HttpStatusMessage.BAD_REQUEST
        );
      }
    } catch (error) {
          const err = responseUitls.errorResponse(
            error,
            ExceptionMessage.TOKEN_NOT_FOUND,
            HttpStatusMessage.INTERNAL_SERVER_ERROR
          )
          res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(err)
    }
  };
}

export const sessionCheckv1 = new sessionCheck();

import { Router } from "express";
import { userController } from "../controller/userController";
import { ProductControllerV1 } from "../controller/productController";
import { sessionCheckv1 } from "../middleware/jwtVerification";
import { validate } from "../middleware/joiValidation/validation";
import { JOI_VALIDATION } from "../middleware/joiValidation/user-validation";
import Joi, { valid } from "joi";
import { validateHeaderName } from "http";
class UserRouter {
  private router!: Router;
  constructor() {
    this.router = Router();
  }
  userRouter() {
    // User Services
    this.router.get("/home", userController.home);
    this.router.post(
      "/signup",
      validate.body(Joi.object(JOI_VALIDATION.USER.SIGNUP)),
      userController.signin
    );
    this.router.post(
        "/verify-new-user",
        validate.body(Joi.object(JOI_VALIDATION.USER.VERIFY_OTP)), 
        userController.signinVerification);
    this.router.post(
        "/login",
        validate.body(Joi.object(JOI_VALIDATION.USER.LOGIN)),
         userController.login);
    this.router.patch(
      "/logout",
      sessionCheckv1.tokenVerification,
      userController.logout
    );
    this.router.post(
      "/forgot-password",
      validate.body(Joi.object(JOI_VALIDATION.USER.FORGOT_PASSWORD)),
      userController.forgotPassword
    );
    this.router.post(
      "/reset-password",
      validate.body(Joi.object(JOI_VALIDATION.USER.SET_NEW_PASS)),
      userController.resetPassword
    );
    this.router.post(
      "/addAddress",
      validate.body(Joi.object(JOI_VALIDATION.USER.ADD_NEW_ADDRESS)),
      sessionCheckv1.tokenVerification,
      userController.addAddress
    );
    return this.router;
  }
}
export const userRouter = new UserRouter();

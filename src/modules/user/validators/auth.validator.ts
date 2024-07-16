import { Joi, validate } from "express-validation";
import { SignUp } from "../interfaces/user.interface";

export const signUp = validate({
  body: Joi.object<SignUp>({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })
});
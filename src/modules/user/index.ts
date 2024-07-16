import { Router } from "express";
import UserController from "./user.controller";
import * as vA from "./validators/auth.validator";

const controller = new UserController();
const router = Router();

router.post("/signup", controller.signUp);
router.post("/signin", controller.signIn);

export default router;
import { Router } from "express";
import RewardController from "./reward.controller";

const controller = new RewardController();
const router = Router();

router.post("/create-reward", controller.createReward);
router.get("/get-reward/:rewardId", controller.getAReward);
router.get("/get-all-reward", controller.getAllReward);
export default router;
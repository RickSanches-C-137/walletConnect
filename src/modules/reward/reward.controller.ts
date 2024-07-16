import { Request, Response } from "express";
import RewardServices from "./reward.services";

export default class RewardController {
  private rewardService: RewardServices;

  constructor() {
    this.rewardService = new RewardServices();
  }

  createReward = async (req: Request, res: Response) => {
    const result = await this.rewardService.createReward(req.body);
    res.status(201).json(result);
  };

  getAllReward = async (req: Request, res: Response) => {
    const result = await this.rewardService.getAllReward();
    res.status(201).json(result);
  };

  getAReward = async (req: Request, res: Response) => {
    const result = await this.rewardService.getOneReward(req.params.rewardId);
    res.status(201).json(result);
  };
}
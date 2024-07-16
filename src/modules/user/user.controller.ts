import { Request, Response } from "express";
import UserService from "./user.services";

export default class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  signUp = async (req: Request, res: Response) => {
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase();
    }
    const result = await this.userService.signUp(req.body);
    res.status(201).json(result);
  };

  signIn = async (req: Request, res: Response) => {
    const result = await this.userService.signIn(req.body);
    res.redirect('/dashboard.html');
  };

  claimReward = async (req: Request, res: Response) => {
    const result = await this.userService.claimReward(req.auth.userId, req.params.rewardId);
    res.status(201).json(result);
  };
}
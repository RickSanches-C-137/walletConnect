import User, { IUser, Privilege } from "../../models/user.model";
import bcrypt from "bcryptjs";
import { BadRequestException, NotFoundException } from "../../utils/service-exceprions";
import { SignIn, SignUp } from "./interfaces/user.interface"
import { loginResponse } from "../../utils/login-response";
import UserReward, { IUserReward } from "../../models/user-reward.model";
import Reward from "../../models/reward.model";

export default class UserService {

  signUp = async (payload: SignUp) => {

    const checkIfUserExist = await User.findOne({
      email: payload.email
    }).select("email").lean();
    if (checkIfUserExist) {
      throw new BadRequestException("An account with this email already exists");
    }
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const data: Partial<IUser> = {
      username: payload.username,
      email: payload.email,
      password: hashedPassword,
      privilege: Privilege.User
    }
    const user = await User.create(data)
    return user;
  }

  signIn = async (payload: SignIn) => {
    const user = await User.findOne({ email: payload.email.toLowerCase() }).select(
      "email password"
    )
      .lean();

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(payload.password, user.password);
    if (!validPassword) {
      throw new BadRequestException("Invalid credentials");
    }
    return loginResponse(user._id.toString());
  }

  claimReward = async (userId: string, rewardId: string) => {
    // const user = await User.findOne({ _id: userId })
    // if (!user) {
    //   throw new NotFoundException("user not found")
    // }
    // const reward = await Reward.findOne({ _id: rewardId })
    // if (!user) {
    //   throw new NotFoundException("user not found")
    // }
    // const claim: Partial<IUserReward> = {
    //   userId,
    //   rewardId,
    // }
    // const data = await UserReward.create(claim);
    // return data;
  }

  getTierReward = async (tier: string) => {
    const tierRewards = await Reward.find({ tier });
    return tierRewards;
  }

  resetPassword = async () => {

  }

}
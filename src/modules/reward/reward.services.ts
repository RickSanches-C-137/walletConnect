import Reward, { IReward } from "../../models/reward.model";
import { Create } from "./interfaces/reward.interface";


export default class RewardServices {
  createReward = async (payload: Create) => {
    const rewardId = generateRandomKey();
    const data: Partial<IReward> = {
      rewardId,
      name: payload.name,
      image: payload.image,
      points: payload.points
    }
    const savedData = await Reward.create(data);
    return { message: "Reward created", savedData }
  }

  getAllReward = async () => {
    const allRewards = await Reward.find();
    return allRewards;
  }

  getOneReward = async (rewardId: string) => {
    const aRewards = await Reward.findOne({ rewardId });
    return aRewards;
  }
}

const generateRandomKey = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}
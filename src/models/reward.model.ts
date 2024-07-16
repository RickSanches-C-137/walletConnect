import { Schema, Types, model } from "mongoose";
export enum Tier {
  Tier1 = "tier1",
  Tier2 = "tier2"
}
export interface IReward {
  rewardId: string;
  name: string;
  image: string;
  points: number;
  tier: Tier;
}

const rewardSchema = new Schema<IReward>({
  rewardId: { type: String },
  name: { type: String },
  image: { type: String },
  points: { type: Number, default: 0 },
  tier: { type: String, enum: Object.values(Tier) }
})

const Reward = model<IReward>("Reward", rewardSchema);
export default Reward;
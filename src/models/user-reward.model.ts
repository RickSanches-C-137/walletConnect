import { Schema, model, Types } from "mongoose";

export interface IUserReward {
  userId: Types.ObjectId;
  rewardId: Types.ObjectId;
  createdAt: Date;
}

const UserRewardSchema = new Schema<IUserReward>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rewardId: { type: Schema.Types.ObjectId, ref: "Reward", required: true },
  createdAt: { type: Date, default: Date.now }
});

const UserReward = model<IUserReward>("UserReward", UserRewardSchema);
export default UserReward;

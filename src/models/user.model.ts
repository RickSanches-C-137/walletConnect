import { Schema, Types, model } from "mongoose";

export enum Tier {
  Tier1 = "tier1",
  Tier2 = "tier2"
}
export enum Privilege {
  Admin = "admin",
  User = "user"
}

export interface IUser {
  username: string;
  email: string;
  emailVerified: boolean;
  password: string;
  privilege: Privilege;
  tier: Tier;
  punkId: string;
  punkBalance: Types.Decimal128;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    password: { type: String },
    privilege: { type: String, enum: Object.values(Privilege), default: Privilege.User },
    tier: { type: String, enum: Object.values(Tier), default: Tier.Tier1 },
    punkId: { type: String },
    punkBalance: { type: Schema.Types.Decimal128, default: 0 }
  })

const User = model<IUser>("User", userSchema);
export default User;
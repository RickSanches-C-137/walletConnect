import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export const loginResponse = async (userId: string, isPartner = false) => {
  const user = await User.findOne({ _id: userId })
    .select('email username emailVerified privilege tier punkbalance')
    .lean();

  const accessToken = generateAccessToken({ userId });

  return {
    user,
    accessToken,
  };
};

export const generateAccessToken = (payload: { userId: string }) => {
  const { userId } = payload;
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '24h', issuer: 'cliveai', },
  );

  return accessToken;
};
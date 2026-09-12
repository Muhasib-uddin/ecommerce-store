import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const getAccessSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET (or JWT_SECRET) environment variable is not set');
  }
  return secret;
};

const getRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  }
  return secret;
};

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, getAccessSecret(), { expiresIn: '15m' });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, getAccessSecret()) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, getRefreshSecret()) as TokenPayload;
};

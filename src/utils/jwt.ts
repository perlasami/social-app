import type { PrivateKey, Secret, SignOptions,JwtPayload } from 'jsonwebtoken';
import { sign,verify } from 'jsonwebtoken';
import { Payload } from '../middleware/auth.middleware';

export const createJwt = (payload: string | object, secret: Secret, options?: SignOptions) => {
  const token = sign(payload, secret, options);
  return token;
};

export const verifyJwt = ({ token, secret }: { token: string; secret: Secret }): Payload  => {
  const payload = verify(token, secret) as Payload;
  return payload;
};
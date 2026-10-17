import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

export const generateToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: string,
) => {
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

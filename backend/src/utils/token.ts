import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { _config } from "../config/config.js";


export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};


export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};


export const generateToken = (payload: string | object | Buffer, expiresIn: string | number = "7d"): string => {
  const secret = _config.JWT_SECRET || "default_secret";
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};


export const verifyToken = (token: string): any => {
  const secret = _config.JWT_SECRET || "default_secret";
  return jwt.verify(token, secret);
};

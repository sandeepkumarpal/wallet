import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../constants";

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

export { hashPassword, comparePassword };

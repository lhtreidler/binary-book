import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
import { userService } from "./userService";
import { formatEmail, formatUsername } from "../utils/format";

const getIsValidPassword = (password: string, passwordHash: string) => {
  return bcrypt.compare(password, passwordHash);
};

const createToken = ({ userId, email }: { userId: string; email: string }) => {
  return generateToken({
    userId,
    email,
  });
};

const createPasswordHash = (password: string) => bcrypt.hash(password, 10);

const createUserAndReturnToken = async ({
  password,
  ...data
}: {
  email: string;
  password: string;
  username: string;
}) => {
  // Hash password
  const passwordHash = await createPasswordHash(password);

  const email = formatEmail(data.email);
  const username = formatUsername(data.username);

  // Create user
  const { id } = await userService.create({ email, passwordHash, username });

  return createToken({
    userId: id,
    email,
  });
};

export const authService = {
  getIsValidPassword,
  createToken,
  createUserAndReturnToken,
  createPasswordHash,
};

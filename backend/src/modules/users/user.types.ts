import { Types } from "mongoose";
import { UserRole, ALL_ROLES } from "./user.constants";

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword?(candidate: string): Promise<boolean>;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export interface UserFilterDto {
  role?: UserRole;
  isBlocked?: boolean;
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

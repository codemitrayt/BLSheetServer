import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Document } from "mongoose";

export enum UserRoleType {
  ADMIN = "admin",
  CUSTOMER = "customer",
}

export interface CustomRequest<T> extends Request {
  body: T;
}

export type CustomModel<T> = T & Document;

export type SendVerificationEmailForRegistrationBody = {
  fullName: string;
  email: string;
};

export interface User {
  fullName: string;
  email: string;
  password?: string;
  role?: UserRoleType;
}

export interface Message {
  to: string;
  text: string;
  html?: string;
  subject?: string;
}

export interface JwtPayloadType extends JwtPayload {
  userId?: string;
  email?: string;
  fullName?: string;
  role?: UserRoleType;
}

export interface CreatePasswordBody {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface LoginUserBody {
  email: string;
  password: string;
}

import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Document, ObjectId } from "mongoose";

export enum UserRoleType {
  ADMIN = "admin",
  CUSTOMER = "customer",
  GUEST = "guest",
}

export enum SheetType {
  INCOME = "income",
  EXPENSE = "expense",
  INVESTMENT = "investment",
}

export interface CustomRequest<T = null> extends Request {
  body: T;
  userId?: string;
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
  projects?: ObjectId[];
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

export interface BLSheet {
  clientName: string;
  description: string;
  money: number;
  isPaid: boolean;
  tax: number;
  date: Date;
  userId: ObjectId;
  type: SheetType;
  totalMoney: number;
}

export interface DeleteBLSheetBody {
  objectId: string;
}

export interface GetBLSheetQueryParams {
  search: string;
  type: SheetType;
  currentPage: number;
  perPage: number;
  startDate: Date;
  endDate: Date;
}

export interface BLSheetFilters {
  type?: SheetType;
}

export interface SelfBody {
  authToken: string;
}

export interface EmailBody {
  email: string;
}

/** TODO TYPES  */

export enum TodoStatus {
  COMPLETED = "completed",
  IN_PROGRESS = "in_progress",
  PENDING = "pending",
}

export enum TodoLevel {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export interface Todo {
  title: string;
  description: string;
  status: TodoStatus;
  userId: ObjectId;
  level: TodoLevel;
}

export interface DeleteTodoBody {
  objectId: string;
}

export interface GetTodoListQueryParams {
  date: Date;
}

/** Project Types */

export interface Project {
  name: string;
  description: string;
  userId: ObjectId;
  tags: string[];
  img: string;
}

/** Project Members */

export enum ProjectMemberStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export interface ProjectMember {
  memberEmailId: string;
  userId?: ObjectId;
  projectId: ObjectId;
  status: ProjectMemberStatus;
}

export interface InviteTeamMemberType {
  email: string;
  projectId: string;
}

export interface ObjectIdBody {
  objectId: string;
}

export interface UpdateTeamMember {
  status: ProjectMemberStatus;
  memberEmailId: string;
  invitationToken: string;
}

// Project Task //

export enum ProjectTaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  UNDER_REVIEW = "under_review",
  COMPLETED = "completed",
}

export enum ProjectTaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface ProjectTask {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  tags: string[];
  status: ProjectTaskStatus;
  priority: ProjectTaskPriority;
  assignedTo?: ObjectId[];
  userId: ObjectId;
  projectId: ObjectId;
  completedDate?: Date;
  attachments?: ObjectId[];
  comments: ObjectId[];
}

export interface GetProjectMemberQuery {
  memberEmail: string;
  currentPage: number;
  perPage: number;
  status: ProjectTaskStatus | "all";
}

export interface AssignUserToProjectTask {
  memberEmailId: string;
  projectId: string;
  projectTaskId: string;
}

export interface Comment {
  content: string;
  userId: ObjectId;
  likes?: number;
  replies?: ObjectId[];
}

export interface ProjectTaskComment {
  projectTaskId: string;
  content: string;
  projectId: string;
}

// ISSUE

export enum IssueStatus {
  OPEN = "open",
  CLOSED = "closed",
}

export enum IssuePriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface Issue {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  userId: ObjectId;
  projectId: ObjectId;
  closedIssueDate: Date;
  labels: string[];
  assignees: ObjectId[];
  comments: ObjectId[];
}

export interface GetProjectTaskQuery {
  search: string;
  priority: ProjectTaskPriority;
  isSort: boolean;
  isAssignedToMe: boolean;
  isCreatedByMe: boolean;
  onlyCompleted: boolean;
  isGroup: boolean;
}

export interface GetIssuesQuery {
  search: string;
  priority: string;
  currentPage: number;
  isSort: boolean;
  isAssignedToMe: boolean;
  isCreatedByMe: boolean;
  status: string;
  labels: string[];
  perPage: number;
}

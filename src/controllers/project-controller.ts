import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ObjectId } from "mongoose";

import {
  AuthService,
  NotificationService,
  ProjectMemberService,
  ProjectService,
  TokenService,
} from "../services";
import Config from "../config";
import htmlTemplates from "../html";

import { URLS } from "../constants";
import logger from "../config/logger";
import {
  CustomRequest,
  InviteTeamMemberType,
  Project,
  ProjectMemberStatus,
} from "../types";

class ProjectController {
  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private tokenService: TokenService,
    private notificationService: NotificationService,
    private projectMemberService: ProjectMemberService
  ) {}

  async getProject(req: CustomRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const projectId = req.query.objectId as string;

    logger.info({ userId, projectId });

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const project = await this.projectService.getProject(projectId, userId);
    return res.json({
      message: {
        project,
      },
    });
  }

  async getProjectList(req: CustomRequest, res: Response, next: NextFunction) {
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    if (!user.projects) {
      return res.json({
        message: {
          projects: [],
        },
      });
    }

    const result = await this.projectService.getProjectListFromUserProjectArray(
      user._id as string
    );

    return res.json({
      message: {
        projects: result,
      },
    });
  }

  async createProject(
    req: CustomRequest<Project>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const project = req.body;
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const newProject = await this.projectService.createProject({
      ...project,
      userId: userId as unknown as ObjectId,
    });

    await this.authService.addProject(userId, newProject._id as string);

    return res.json({
      message: {
        project: newProject,
      },
    });
  }

  async updateProject(
    req: CustomRequest<Project>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const project = req.body;
    const userId = req.userId as string;
    const projectId = req.query.objectId as string;

    const existingProject = await this.projectService.findBySheetIdAndUserId(
      projectId
    );
    if (!existingProject)
      return next(createHttpError(400, "Project not found"));

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const updatedProject = await this.projectService.updateProject(
      project,
      projectId
    );

    return res.json({ message: { project: updatedProject } });
  }

  async deleteProject(
    req: CustomRequest<{ objectId: string }>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { objectId: projectId } = req.body;
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    await this.projectService.deleteProject(projectId, userId);
    return res.json({ message: { deletedProject: projectId } });
  }

  async inviteTeamMember(
    req: CustomRequest<InviteTeamMemberType>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { email, projectId } = req.body;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    if (email === user.email) {
      return next(createHttpError(400, "Can't invite yourself"));
    }

    const project = await this.projectService.getProject(projectId, userId);
    if (!project) return next(createHttpError(400, "Project not found"));

    const hasInvited = await this.projectMemberService.getProjectMember(
      projectId,
      email
    );

    if (hasInvited && hasInvited.status === ProjectMemberStatus.ACCEPTED) {
      return res.json({
        message: `${email} this user accepted the project invitation already`,
      });
    }

    if (!hasInvited) {
      const invitedUser = await this.authService.findUserByEmail(email);

      await this.projectMemberService.addProjectMember({
        memberEmailId: email,
        projectId: projectId as unknown as ObjectId,
        status: ProjectMemberStatus.PENDING,
        ...(invitedUser && { userId: invitedUser._id as unknown as ObjectId }),
      });
    }

    const inviteToken = await this.tokenService.signToken(
      { email, projectId },
      "7 days"
    );

    const invitationLink = `${Config.FRONTEND_URL!}${
      URLS.inviteUrl
    }?invitationToken=${inviteToken}&projectName=${project.name}`;

    await this.notificationService.send({
      to: email,
      text: "Invitation Email",
      subject: `Invitation from ${project.name}`,
      html: htmlTemplates.inviteProjectMember({
        inviteSenderName: user.fullName,
        link: invitationLink,
        projectName: project.name,
        email,
      }),
    });

    return res.json({ message: "Successfully sent invitation to user email." });
  }
}

export default ProjectController;

import { NextFunction, Response } from "express";
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
  ObjectIdBody,
  Project,
  ProjectMemberStatus,
  UpdateTeamMember,
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

    const project = await this.projectService.getProjectById(projectId, userId);
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
      user.projects,
      userId
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
    await this.projectMemberService.addProjectMember({
      status: ProjectMemberStatus.ACCEPTED,
      userId: userId as unknown as ObjectId,
      projectId: newProject._id as unknown as ObjectId,
      memberEmailId: user.email,
    });

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

    let hasInvited = await this.projectMemberService.getProjectMember(
      projectId,
      email
    );

    if (hasInvited && hasInvited.status === ProjectMemberStatus.ACCEPTED) {
      return res.json({
        message: `${email} this user accepted the project invitation already.`,
      });
    }

    if (!hasInvited) {
      const invitedUser = await this.authService.findUserByEmail(email);

      hasInvited = await this.projectMemberService.addProjectMember({
        memberEmailId: email,
        projectId: projectId as unknown as ObjectId,
        status: ProjectMemberStatus.PENDING,
        ...(invitedUser && { userId: invitedUser._id as unknown as ObjectId }),
      });
    }

    const inviteToken = await this.tokenService.signToken(
      { email, projectId, memberId: hasInvited._id },
      "7 days"
    );

    const invitationLink = `${Config.FRONTEND_URL!}${
      URLS.inviteUrl
    }?invitationToken=${inviteToken}&projectName=${
      project.name
    }&email=${email}`;

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

  async getProjectMembers(
    req: CustomRequest<ObjectIdBody>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const projectId = req.body.objectId;
    const userId = req.userId as string;

    logger.info({ projectId });

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const isProjectMember = await this.projectMemberService.getProjectMember(
      projectId,
      user.email
    );
    if (isProjectMember?.status !== ProjectMemberStatus.ACCEPTED) {
      return next(createHttpError(400, "Unauthorized to view project members"));
    }

    const project = await this.projectService.getProjectById(projectId, userId);
    if (!project) return next(createHttpError(400, "Project not found"));

    const projectMembers = await this.projectMemberService.getProjectMembers(
      projectId,
      project.userId
    );

    return res.json({
      message: {
        projectMembers,
      },
    });
  }

  async updateProjectMember(
    req: CustomRequest<UpdateTeamMember>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { status, memberEmailId, invitationToken } = req.body;
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const token = await this.tokenService.verifyToken(invitationToken);
    if (!token) {
      return next(createHttpError(400, "Invalid invitation token"));
    }

    if ((token?.exp || 0) * 1000 <= Date.now()) {
      return next(createHttpError(400, "Invitation token expired"));
    }

    const projectMember = await this.projectMemberService.getProjectMemberById(
      token.memberId
    );

    if (!projectMember)
      return next(createHttpError(400, "Project member not found"));

    if (projectMember.status === ProjectMemberStatus.ACCEPTED) {
      return next(
        createHttpError(
          400,
          "This user has already accepted the project invitation"
        )
      );
    }

    await this.projectMemberService.updateProjectMember(token.memberId, {
      status,
      memberEmailId,
      projectId: projectMember.projectId as unknown as ObjectId,
      userId: userId as unknown as ObjectId,
    });

    if (status === ProjectMemberStatus.ACCEPTED) {
      await this.authService.addProject(
        userId,
        projectMember.projectId as unknown as string
      );
    }

    return res.json({ message: `Project invitation ${status}` });
  }

  async removeProjectMember(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const memberId = req.query.objectId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const projectMember = await this.projectMemberService.getProjectMemberById(
      memberId
    );
    if (!projectMember)
      return next(createHttpError(400, "Project member not found"));

    await this.projectMemberService.deleteProjectMember(memberId);

    await this.authService.removeProject(
      projectMember.userId as unknown as string,
      projectMember.projectId as unknown as string
    );
    return res.json({ message: "Project member removed successfully" });
  }
}

export default ProjectController;

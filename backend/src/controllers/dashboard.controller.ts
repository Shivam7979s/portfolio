import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Run count queries in parallel
    const [
      totalProjects,
      totalSkills,
      totalMessages,
      unreadMessages,
      activeResume,
      recentProjects,
      recentSkills,
      recentMessages
    ] = await Promise.all([
      prisma.project.count(),
      prisma.skill.count(),
      prisma.message.count(),
      prisma.message.count({ where: { isRead: false } }),
      prisma.resume.findFirst({ where: { isActive: true } }),
      prisma.project.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
      prisma.skill.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
      prisma.message.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
    ]);

    // 2. Synthesize a unified "Recent Activity" list
    const recentActivity = [
      ...recentProjects.map(p => ({
        type: 'project',
        title: `Project Created: ${p.title}`,
        time: p.createdAt,
        detail: p.category || 'Web',
      })),
      ...recentSkills.map(s => ({
        type: 'skill',
        title: `Skill Added: ${s.name}`,
        time: s.createdAt,
        detail: s.category,
      })),
      ...recentMessages.map(m => ({
        type: 'message',
        title: `New Message from ${m.name}`,
        time: m.createdAt,
        detail: m.email,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalSkills,
        totalMessages,
        unreadMessages,
        resume: activeResume ? {
          fileUrl: activeResume.fileUrl,
          version: activeResume.version,
          uploadedAt: activeResume.uploadedAt
        } : null,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

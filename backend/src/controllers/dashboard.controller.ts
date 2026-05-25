import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // ─────────────────────────────────────────────────────────────
    // AUTO SEED DATABASE IF EMPTY
    // ─────────────────────────────────────────────────────────────

    // PROJECT
    const projectCount = await prisma.project.count();

    if (projectCount === 0) {
  await prisma.project.create({
  data: {
    title: 'Portfolio Project',
    description: 'My Portfolio Website',
    category: 'Web',
    techStack: 'React, Node.js',
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    featured: true,
  },
});
    }

    // SKILL
    const skillCount = await prisma.skill.count();

    if (skillCount === 0) {
      await prisma.skill.create({
        data: {
          name: 'React',
          category: 'Frontend',
          level: 90,
          icon: '',
        },
      });
    }

    // MESSAGE
    const messageCount = await prisma.message.count();

    if (messageCount === 0) {
      await prisma.message.create({
        data: {
          name: 'Shivam',
          email: 'admin@gmail.com',
          message: 'Welcome to dashboard',
          isRead: false,
        },
      });
    }

    // RESUME
    const resumeCount = await prisma.resume.count();

    if (resumeCount === 0) {
      await prisma.resume.create({
        data: {
          title: 'Main Resume',
          fileUrl: 'https://example.com/resume.pdf',
          version: '1.0',
          isActive: true,
        },
      });
    }

    // ─────────────────────────────────────────────────────────────
    // FETCH DASHBOARD DATA
    // ─────────────────────────────────────────────────────────────

    const [
      totalProjects,
      totalSkills,
      totalMessages,
      unreadMessages,
      activeResume,
      recentProjects,
      recentSkills,
      recentMessages,
    ] = await Promise.all([
      prisma.project.count(),

      prisma.skill.count(),

      prisma.message.count(),

      prisma.message.count({
        where: {
          isRead: false,
        },
      }),

      prisma.resume.findFirst({
        where: {
          isActive: true,
        },
      }),

      prisma.project.findMany({
        take: 3,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      prisma.skill.findMany({
        take: 3,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      prisma.message.findMany({
        take: 3,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    // ─────────────────────────────────────────────────────────────
    // RECENT ACTIVITY
    // ─────────────────────────────────────────────────────────────

    const recentActivity = [
      ...recentProjects.map((p) => ({
        type: 'project',
        title: `Project Created: ${p.title}`,
        time: p.createdAt,
        detail: p.category || 'Web',
      })),

      ...recentSkills.map((s) => ({
        type: 'skill',
        title: `Skill Added: ${s.name}`,
        time: s.createdAt,
        detail: s.category,
      })),

      ...recentMessages.map((m) => ({
        type: 'message',
        title: `New Message from ${m.name}`,
        time: m.createdAt,
        detail: m.email,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.time).getTime() -
          new Date(a.time).getTime()
      )
      .slice(0, 5);

    // ─────────────────────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────────────────────

    res.status(200).json({
      success: true,

      data: {
        totalProjects,
        totalSkills,
        totalMessages,
        unreadMessages,

        resume: activeResume
          ? {
              fileUrl: activeResume.fileUrl,
              version: activeResume.version,
              uploadedAt: activeResume.uploadedAt,
            }
          : null,

        recentActivity,
      },
    });
  } catch (error) {
    console.log('❌ DASHBOARD ERROR:', error);

    next(error);
  }
};
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

// ─────────────────────────────────────────────────────────────
// GET SOCIAL LINKS
// ─────────────────────────────────────────────────────────────
export const getSocialLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // AUTO SEED IF EMPTY
    let social =
      await prisma.socialLinks.findUnique({
        where: {
          id: 1,
        },
      });

    if (!social) {
      social =
        await prisma.socialLinks.create({
          data: {
            id: 1,

            github:
              'https://github.com',

            linkedin:
              'https://linkedin.com',

            twitter:
              'https://twitter.com',

            instagram:
              'https://instagram.com',

            portfolio:
              'https://example.com',

            youtube:
              'https://youtube.com',

            leetcode:
              'https://leetcode.com',

            codeforces:
              'https://codeforces.com',
          },
        });
    }

    res.status(200).json({
      success: true,
      data: social,
    });
  } catch (error) {
    console.log(
      '❌ GET SOCIAL LINKS ERROR:',
      error
    );

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE SOCIAL LINKS
// ─────────────────────────────────────────────────────────────
export const updateSocialLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      github,
      linkedin,
      twitter,
      instagram,
      portfolio,
      youtube,
      leetcode,
      codeforces,
    } = req.body;

    const updatedSocial =
      await prisma.socialLinks.upsert({
        where: {
          id: 1,
        },

        update: {
          github:
            github || '',

          linkedin:
            linkedin || '',

          twitter:
            twitter || '',

          instagram:
            instagram || '',

          portfolio:
            portfolio || '',

          youtube:
            youtube || '',

          leetcode:
            leetcode || '',

          codeforces:
            codeforces || '',
        },

        create: {
          id: 1,

          github:
            github ||
            'https://github.com',

          linkedin:
            linkedin ||
            'https://linkedin.com',

          twitter:
            twitter ||
            'https://twitter.com',

          instagram:
            instagram ||
            'https://instagram.com',

          portfolio:
            portfolio ||
            'https://example.com',

          youtube:
            youtube ||
            'https://youtube.com',

          leetcode:
            leetcode ||
            'https://leetcode.com',

          codeforces:
            codeforces ||
            'https://codeforces.com',
        },
      });

    res.status(200).json({
      success: true,
      data: updatedSocial,
    });
  } catch (error) {
    console.log(
      '❌ UPDATE SOCIAL LINKS ERROR:',
      error
    );

    next(error);
  }
};
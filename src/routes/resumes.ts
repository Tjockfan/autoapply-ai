import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Validation schemas
const createResumeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
  fileUrl: z.string().url().optional().or(z.literal('')),
  isDefault: z.boolean().default(false),
  parsedData: z.record(z.any()).optional()
});

const updateResumeSchema = createResumeSchema.partial();

// Get all resumes for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user!.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        isDefault: true,
        fileUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { applications: true }
        }
      }
    });

    res.json({ resumes });
  } catch (error) {
    next(error);
  }
});

// Get single resume
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId: req.user!.id },
      include: {
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            job: {
              select: {
                id: true,
                title: true,
                company: true
              }
            }
          }
        }
      }
    });

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    res.json({ resume });
  } catch (error) {
    next(error);
  }
});

// Create resume
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const validated = createResumeSchema.parse(req.body);

    // If setting as default, unset other defaults
    if (validated.isDefault) {
      await prisma.resume.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const resume = await prisma.resume.create({
      data: {
        ...validated,
        userId: req.user!.id
      }
    });

    res.status(201).json({ message: 'Resume created successfully', resume });
  } catch (error) {
    next(error);
  }
});

// Update resume
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const validated = updateResumeSchema.parse(req.body);

    // Verify ownership
    const existingResume = await prisma.resume.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingResume) {
      throw new AppError('Resume not found', 404);
    }

    // If setting as default, unset other defaults
    if (validated.isDefault) {
      await prisma.resume.updateMany({
        where: { userId: req.user!.id, isDefault: true, id: { not: id } },
        data: { isDefault: false }
      });
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: validated
    });

    res.json({ message: 'Resume updated successfully', resume });
  } catch (error) {
    next(error);
  }
});

// Delete resume
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existingResume = await prisma.resume.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingResume) {
      throw new AppError('Resume not found', 404);
    }

    await prisma.resume.delete({ where: { id } });

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as resumesRouter };

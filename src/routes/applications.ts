import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Validation schemas
const createApplicationSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  resumeId: z.string().uuid('Invalid resume ID').optional(),
  coverLetter: z.string().optional()
});

const updateApplicationSchema = z.object({
  status: z.enum(['PENDING', 'APPLIED', 'INTERVIEWING', 'REJECTED', 'OFFERED', 'HIRED', 'WITHDRAWN']).optional(),
  coverLetter: z.string().optional(),
  appliedAt: z.string().datetime().optional()
});

// Get all applications for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId: req.user!.id };
    
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
              url: true
            }
          },
          resume: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.application.count({ where })
    ]);

    res.json({
      applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single application
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findFirst({
      where: { id, userId: req.user!.id },
      include: {
        job: true,
        resume: {
          select: {
            id: true,
            name: true,
            content: true
          }
        }
      }
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    res.json({ application });
  } catch (error) {
    next(error);
  }
});

// Create application
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const validated = createApplicationSchema.parse(req.body);

    // Verify job exists and belongs to user
    const job = await prisma.job.findFirst({
      where: { id: validated.jobId, userId: req.user!.id }
    });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    // Verify resume exists and belongs to user (if provided)
    if (validated.resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: validated.resumeId, userId: req.user!.id }
      });

      if (!resume) {
        throw new AppError('Resume not found', 404);
      }
    }

    // Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: req.user!.id,
          jobId: validated.jobId
        }
      }
    });

    if (existingApplication) {
      throw new AppError('Application for this job already exists', 409);
    }

    const application = await prisma.application.create({
      data: {
        ...validated,
        userId: req.user!.id
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true
          }
        }
      }
    });

    res.status(201).json({ message: 'Application created successfully', application });
  } catch (error) {
    next(error);
  }
});

// Update application
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const validated = updateApplicationSchema.parse(req.body);

    // Verify ownership
    const existingApplication = await prisma.application.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingApplication) {
      throw new AppError('Application not found', 404);
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...validated,
        appliedAt: validated.appliedAt 
          ? new Date(validated.appliedAt) 
          : validated.status === 'APPLIED' && !existingApplication.appliedAt
            ? new Date()
            : existingApplication.appliedAt
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true
          }
        }
      }
    });

    res.json({ message: 'Application updated successfully', application });
  } catch (error) {
    next(error);
  }
});

// Delete application
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existingApplication = await prisma.application.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingApplication) {
      throw new AppError('Application not found', 404);
    }

    await prisma.application.delete({ where: { id } });

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as applicationsRouter };

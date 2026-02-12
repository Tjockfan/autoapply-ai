import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Validation schemas
const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  salaryRange: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']).default('FULL_TIME'),
  url: z.string().url().optional().or(z.literal('')),
  source: z.string().optional(),
  postedAt: z.string().datetime().optional()
});

const updateJobSchema = createJobSchema.partial();

// Get all jobs for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status, search, page = '1', limit = '10' } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId: req.user!.id };
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { company: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          _count: {
            select: { applications: true }
          }
        }
      }),
      prisma.job.count({ where })
    ]);

    res.json({
      jobs,
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

// Get single job
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: { id, userId: req.user!.id },
      include: {
        applications: {
          include: {
            resume: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    res.json({ job });
  } catch (error) {
    next(error);
  }
});

// Create job
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const validated = createJobSchema.parse(req.body);

    const job = await prisma.job.create({
      data: {
        ...validated,
        postedAt: validated.postedAt ? new Date(validated.postedAt) : null,
        userId: req.user!.id
      }
    });

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    next(error);
  }
});

// Update job
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const validated = updateJobSchema.parse(req.body);

    // Verify ownership
    const existingJob = await prisma.job.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingJob) {
      throw new AppError('Job not found', 404);
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...validated,
        postedAt: validated.postedAt ? new Date(validated.postedAt) : existingJob.postedAt
      }
    });

    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    next(error);
  }
});

// Delete job
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existingJob = await prisma.job.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingJob) {
      throw new AppError('Job not found', 404);
    }

    await prisma.job.delete({ where: { id } });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as jobsRouter };

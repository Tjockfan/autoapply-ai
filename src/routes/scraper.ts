import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Validation schema for scraped jobs
const scrapedJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  description: z.string().min(1),
  salaryRange: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']).default('FULL_TIME'),
  url: z.string().url().optional(),
  source: z.string().optional(),
  postedAt: z.string().datetime().optional(),
  externalId: z.string().optional(), // ID from the source platform
});

// Get scraped jobs (for import)
router.get('/scrape', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { source, limit = '20' } = req.query;
    
    // This endpoint would typically call the scraper service
    // For now, return mock data or fetch from a scraper queue
    
    res.json({
      message: 'Scraper jobs endpoint - integrate with scraper service',
      source,
      jobs: [],
    });
  } catch (error) {
    next(error);
  }
});

// Import scraped jobs
router.post('/import', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { jobs } = req.body;
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      throw new AppError('Jobs array is required', 400);
    }

    const validatedJobs = jobs.map(job => scrapedJobSchema.parse(job));
    
    // Create jobs in batch
    const createdJobs = await prisma.$transaction(
      validatedJobs.map(jobData => 
        prisma.job.create({
          data: {
            ...jobData,
            postedAt: jobData.postedAt ? new Date(jobData.postedAt) : null,
            userId: req.user!.id,
          },
        })
      )
    );

    res.status(201).json({
      message: `Successfully imported ${createdJobs.length} jobs`,
      jobs: createdJobs,
    });
  } catch (error) {
    next(error);
  }
});

// Import single scraped job
router.post('/import/single', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const validated = scrapedJobSchema.parse(req.body);

    // Check for duplicate by externalId or URL
    if (validated.externalId || validated.url) {
      const existing = await prisma.job.findFirst({
        where: {
          userId: req.user!.id,
          OR: [
            ...(validated.externalId ? [{ source: validated.source, description: { contains: validated.externalId } }] : []),
            ...(validated.url ? [{ url: validated.url }] : []),
          ],
        },
      });

      if (existing) {
        throw new AppError('Job already exists in your list', 409);
      }
    }

    const job = await prisma.job.create({
      data: {
        ...validated,
        postedAt: validated.postedAt ? new Date(validated.postedAt) : null,
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      message: 'Job imported successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
});

// Get job sources (for filtering)
router.get('/sources', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const sources = await prisma.job.findMany({
      where: { userId: req.user!.id },
      select: { source: true },
      distinct: ['source'],
    });

    res.json({
      sources: sources.map(s => s.source).filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
});

// Trigger scraper (admin only or with limits)
router.post('/trigger', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { sources } = req.body;
    
    // This would trigger the scraper service
    // Could use a message queue, Redis, or direct process spawn
    
    res.json({
      message: 'Scraper triggered',
      sources: sources || ['yotspot', 'yacrew'],
      status: 'pending',
    });
  } catch (error) {
    next(error);
  }
});

// Get scraper status
router.get('/status', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Return scraper service status
    res.json({
      status: 'idle',
      lastRun: null,
      nextRun: null,
      jobsInQueue: 0,
    });
  } catch (error) {
    next(error);
  }
});

export { router as scraperRouter };

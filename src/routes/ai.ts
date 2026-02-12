import { Router } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Validation schemas
const generateCoverLetterSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  resumeId: z.string().uuid('Invalid resume ID').optional(),
  tone: z.enum(['professional', 'casual', 'enthusiastic', 'formal']).default('professional'),
  maxLength: z.number().int().min(100).max(1000).default(400)
});

const improveCoverLetterSchema = z.object({
  coverLetter: z.string().min(1, 'Cover letter content is required'),
  improvementType: z.enum(['more_personal', 'more_professional', 'shorter', 'longer', 'fix_grammar']).default('more_professional')
});

// Generate cover letter
router.post('/generate-cover-letter', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const validated = generateCoverLetterSchema.parse(req.body);

    // Get job details
    const job = await prisma.job.findFirst({
      where: { id: validated.jobId, userId: req.user!.id }
    });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    // Get resume content
    let resumeContent = '';
    if (validated.resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: validated.resumeId, userId: req.user!.id }
      });
      if (resume) {
        resumeContent = resume.content;
      }
    } else {
      // Get default resume
      const defaultResume = await prisma.resume.findFirst({
        where: { userId: req.user!.id, isDefault: true }
      });
      if (defaultResume) {
        resumeContent = defaultResume.content;
      }
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { firstName: true, lastName: true }
    });

    const fullName = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || 'Applicant';

    // Build tone instruction
    const toneInstructions: Record<string, string> = {
      professional: 'professional and confident',
      casual: 'friendly yet professional, approachable',
      enthusiastic: 'enthusiastic and passionate about the role',
      formal: 'formal and traditional business style'
    };

    // Generate cover letter with OpenAI
    const prompt = `Write a ${toneInstructions[validated.tone]} cover letter for the following job:

Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location || 'Not specified'}
Job Description: ${job.description}

${resumeContent ? `Candidate's Resume/Experience:\n${resumeContent}\n\n` : ''}
Requirements:
- Maximum ${validated.maxLength} words
- Address the letter to the hiring manager at ${job.company}
- Highlight relevant skills and experience from the resume
- Show enthusiasm for the role and company
- Include a strong closing with a call to action
- Sign off as ${fullName}

Write only the cover letter content, no additional explanation.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career coach and professional writer specializing in compelling cover letters that help candidates land interviews.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: Math.min(validated.maxLength * 2, 1500),
      temperature: 0.7
    });

    const coverLetter = completion.choices[0]?.message?.content?.trim();

    if (!coverLetter) {
      throw new AppError('Failed to generate cover letter', 500);
    }

    res.json({
      message: 'Cover letter generated successfully',
      coverLetter,
      job: {
        id: job.id,
        title: job.title,
        company: job.company
      }
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      return next(new AppError(`OpenAI API error: ${error.message}`, 500));
    }
    next(error);
  }
});

// Improve existing cover letter
router.post('/improve-cover-letter', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const validated = improveCoverLetterSchema.parse(req.body);

    const improvementInstructions: Record<string, string> = {
      more_personal: 'Make it more personal by adding specific anecdotes and personal connection to the company.',
      more_professional: 'Make it more professional with stronger action verbs and industry terminology.',
      shorter: 'Make it more concise while keeping all key points. Remove redundant phrases.',
      longer: 'Expand on key achievements and add more detail about relevant experience.',
      fix_grammar: 'Fix any grammar, spelling, and punctuation errors while maintaining the tone.'
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert editor specializing in improving cover letters for job applications.'
        },
        {
          role: 'user',
          content: `Please improve the following cover letter. ${improvementInstructions[validated.improvementType]}

Cover Letter:
${validated.coverLetter}

Provide only the improved cover letter, no additional explanation.`
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const improvedCoverLetter = completion.choices[0]?.message?.content?.trim();

    if (!improvedCoverLetter) {
      throw new AppError('Failed to improve cover letter', 500);
    }

    res.json({
      message: 'Cover letter improved successfully',
      coverLetter: improvedCoverLetter,
      originalCoverLetter: validated.coverLetter
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      return next(new AppError(`OpenAI API error: ${error.message}`, 500));
    }
    next(error);
  }
});

// Analyze job fit
router.post('/analyze-job-fit', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      jobId: z.string().uuid('Invalid job ID'),
      resumeId: z.string().uuid('Invalid resume ID').optional()
    });

    const validated = schema.parse(req.body);

    // Get job details
    const job = await prisma.job.findFirst({
      where: { id: validated.jobId, userId: req.user!.id }
    });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    // Get resume content
    let resumeContent = '';
    if (validated.resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: validated.resumeId, userId: req.user!.id }
      });
      if (resume) {
        resumeContent = resume.content;
      }
    } else {
      const defaultResume = await prisma.resume.findFirst({
        where: { userId: req.user!.id, isDefault: true }
      });
      if (defaultResume) {
        resumeContent = defaultResume.content;
      }
    }

    if (!resumeContent) {
      throw new AppError('No resume found. Please upload a resume first.', 400);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career advisor specializing in job fit analysis.'
        },
        {
          role: 'user',
          content: `Analyze the fit between the candidate and this job. Provide:
1. A match percentage (0-100%)
2. Key strengths that align with the role
3. Potential gaps or areas to address
4. Suggestions for improving the application

Job Title: ${job.title}
Company: ${job.company}
Job Description: ${job.description}

Candidate Resume:
${resumeContent}

Format your response as JSON with keys: matchPercentage, strengths (array), gaps (array), suggestions (array)`
        }
      ],
      max_tokens: 1000,
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const analysisText = completion.choices[0]?.message?.content;

    if (!analysisText) {
      throw new AppError('Failed to analyze job fit', 500);
    }

    const analysis = JSON.parse(analysisText);

    res.json({
      message: 'Job fit analysis completed',
      analysis,
      job: {
        id: job.id,
        title: job.title,
        company: job.company
      }
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      return next(new AppError(`OpenAI API error: ${error.message}`, 500));
    }
    next(error);
  }
});

export { router as aiRouter };

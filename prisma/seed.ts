import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User'
    }
  });

  console.log('Demo user created:', user.email);

  // Create demo job
  const job = await prisma.job.upsert({
    where: { 
      id: '00000000-0000-0000-0000-000000000001' 
    },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA (Remote)',
      description: `We are looking for a Senior Full Stack Developer to join our growing team. 

Requirements:
- 5+ years of experience with Node.js and React
- Experience with TypeScript
- Knowledge of PostgreSQL and Prisma
- Experience with cloud platforms (AWS/GCP)
- Strong problem-solving skills

Responsibilities:
- Develop and maintain web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews`,
      salaryRange: '$120,000 - $160,000',
      jobType: 'FULL_TIME',
      userId: user.id,
      source: 'manual'
    }
  });

  console.log('Demo job created:', job.title);

  // Create demo resume
  const resume = await prisma.resume.upsert({
    where: { 
      id: '00000000-0000-0000-0000-000000000002' 
    },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'My Resume',
      content: `DEMO USER
Full Stack Developer
San Francisco, CA

SUMMARY
Experienced Full Stack Developer with 6+ years of expertise in building scalable web applications using Node.js, React, and TypeScript. Passionate about clean code and user-centric design.

TECHNICAL SKILLS
- Frontend: React, TypeScript, Next.js, Tailwind CSS
- Backend: Node.js, Express, PostgreSQL, MongoDB
- Cloud: AWS, Docker, Kubernetes
- Tools: Git, CI/CD, Jest

EXPERIENCE
Senior Developer | TechStart Inc. | 2021-Present
- Led development of microservices architecture
- Reduced API response time by 40%
- Mentored 3 junior developers

Full Stack Developer | WebSolutions Co. | 2018-2021
- Built e-commerce platform serving 100k+ users
- Implemented payment processing system`,
      isDefault: true,
      userId: user.id
    }
  });

  console.log('Demo resume created:', resume.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

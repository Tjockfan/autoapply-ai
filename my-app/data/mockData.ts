export interface Job {
  id: string;
  title: string;
  yachtName: string;
  yachtType: string;
  location: string;
  salary: string;
  position: string;
  department: string;
  description: string;
  requirements: string[];
  postedAt: string;
  matchScore: number;
  isNew: boolean;
}

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Deckhand Position',
    yachtName: 'M/Y Aurora',
    yachtType: 'Motor Yacht',
    location: 'Mediterranean',
    salary: '€3,500 - €4,200/month',
    position: 'Deckhand',
    department: 'Deck',
    description: 'Looking for an experienced deckhand for a busy 80m charter yacht. Must have STCW and ENG1.',
    requirements: ['STCW', 'ENG1', 'Minimum 1 year experience', 'Tender driving license'],
    postedAt: '2 hours ago',
    matchScore: 95,
    isNew: true,
  },
  {
    id: '2',
    title: '2nd Stewardess',
    yachtName: 'S/Y Serenity',
    yachtType: 'Sailing Yacht',
    location: 'Caribbean',
    salary: '€3,200 - €3,800/month',
    position: '2nd Stewardess',
    department: 'Interior',
    description: 'Private sailing yacht seeking an experienced stewardess with silver service experience.',
    requirements: ['STCW', 'ENG1', 'Silver service', 'Wine knowledge'],
    postedAt: '5 hours ago',
    matchScore: 88,
    isNew: true,
  },
  {
    id: '3',
    title: 'Chef de Cuisine',
    yachtName: 'M/Y Eclipse',
    yachtType: 'Motor Yacht',
    location: 'Mediterranean',
    salary: '€7,000 - €9,000/month',
    position: 'Chef',
    department: 'Interior',
    description: 'Ultra-high net worth private yacht seeking experienced chef with Michelin star background.',
    requirements: ['Culinary degree', 'Michelin experience', 'Dietary specialties', 'Provisioning skills'],
    postedAt: '1 day ago',
    matchScore: 72,
    isNew: false,
  },
  {
    id: '4',
    title: 'Chief Engineer',
    yachtName: 'M/Y Quantum',
    yachtType: 'Motor Yacht',
    location: 'Pacific',
    salary: '€9,000 - €12,000/month',
    position: 'Chief Engineer',
    department: 'Engineering',
    description: '100m+ yacht looking for Y1 Chief Engineer. World cruising itinerary.',
    requirements: ['Y1 Chief Engineer', 'STCW', '10+ years experience', 'AEC'],
    postedAt: '2 days ago',
    matchScore: 65,
    isNew: false,
  },
  {
    id: '5',
    title: 'Bosun',
    yachtName: 'M/V Atlantis',
    yachtType: 'Motor Yacht',
    location: 'Caribbean',
    salary: '€4,500 - €5,500/month',
    position: 'Bosun',
    department: 'Deck',
    description: 'Experienced Bosun needed for 90m charter yacht. Water sports focus.',
    requirements: ['STCW', 'ENG1', 'Yacht Master', 'PWC instructor'],
    postedAt: '3 days ago',
    matchScore: 92,
    isNew: false,
  },
  {
    id: '6',
    title: 'Chief Stewardess',
    yachtName: 'M/Y Solstice',
    yachtType: 'Motor Yacht',
    location: 'Mediterranean',
    salary: '€5,500 - €7,000/month',
    position: 'Chief Stewardess',
    department: 'Interior',
    description: 'Busy charter yacht seeking experienced Chief Stew with strong leadership skills.',
    requirements: ['STCW', 'ENG1', '5+ years experience', 'Management skills'],
    postedAt: '3 days ago',
    matchScore: 78,
    isNew: false,
  },
];

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  yachtName: string;
  status: 'applied' | 'pending' | 'interview' | 'offer' | 'rejected';
  appliedAt: string;
  lastUpdated: string;
  notes?: string;
}

export const applications: Application[] = [
  {
    id: 'app1',
    jobId: '1',
    jobTitle: 'Deckhand Position',
    yachtName: 'M/Y Aurora',
    status: 'applied',
    appliedAt: '2026-02-10',
    lastUpdated: '2 minutes ago',
  },
  {
    id: 'app2',
    jobId: '2',
    jobTitle: '2nd Stewardess',
    yachtName: 'S/Y Serenity',
    status: 'interview',
    appliedAt: '2026-02-08',
    lastUpdated: '1 hour ago',
    notes: 'Interview scheduled for Friday',
  },
  {
    id: 'app3',
    jobId: '5',
    jobTitle: 'Bosun',
    yachtName: 'M/V Atlantis',
    status: 'offer',
    appliedAt: '2026-02-05',
    lastUpdated: '3 hours ago',
    notes: 'Offer received - considering',
  },
  {
    id: 'app4',
    jobId: '3',
    jobTitle: 'Chef de Cuisine',
    yachtName: 'M/Y Eclipse',
    status: 'pending',
    appliedAt: '2026-02-11',
    lastUpdated: '1 day ago',
  },
  {
    id: 'app5',
    jobId: '4',
    jobTitle: 'Chief Engineer',
    yachtName: 'M/Y Quantum',
    status: 'rejected',
    appliedAt: '2026-02-01',
    lastUpdated: '2 days ago',
    notes: 'Position filled internally',
  },
];

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  location: string;
  experience: string;
  applicationsThisMonth: number;
  totalApplications: number;
  interviews: number;
  offers: number;
}

export const currentUser: User = {
  id: 'user1',
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  avatar: 'SJ',
  role: 'Deckhand / Stewardess',
  location: 'Monaco',
  experience: '3 years',
  applicationsThisMonth: 12,
  totalApplications: 45,
  interviews: 8,
  offers: 2,
};

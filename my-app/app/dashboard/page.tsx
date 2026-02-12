'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { StatsCard } from '@/components/StatsCard';
import { JobCard } from '@/components/JobCard';
import { ApplicationTracker } from '@/components/ApplicationTracker';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
  FileText,
  Users,
  MessageSquare,
  Briefcase,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface Stats {
  totalApplications: number;
  interviews: number;
  offers: number;
  activeJobs: number;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  salaryRange?: string;
  jobType: string;
  source?: string;
  status: string;
  createdAt: string;
  _count?: { applications: number };
}

interface Application {
  id: string;
  status: string;
  createdAt: string;
  appliedAt?: string;
  job: {
    id: string;
    title: string;
    company: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalApplications: 0,
    interviews: 0,
    offers: 0,
    activeJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch jobs and applications in parallel
      const [jobsRes, appsRes] = await Promise.all([
        api.getJobs({ limit: 5 }),
        api.getApplications({ limit: 10 }),
      ]);

      if (jobsRes.error) {
        setError(jobsRes.error);
        return;
      }

      if (appsRes.error) {
        setError(appsRes.error);
        return;
      }

      const jobsData = jobsRes.data?.jobs || [];
      const appsData = appsRes.data?.applications || [];

      setJobs(jobsData);
      setApplications(appsData);

      // Calculate stats
      const totalApps = appsData.length;
      const interviews = appsData.filter((a: Application) => 
        a.status === 'INTERVIEWING' || a.status === 'OFFERED' || a.status === 'HIRED'
      ).length;
      const offers = appsData.filter((a: Application) => 
        a.status === 'OFFERED' || a.status === 'HIRED'
      ).length;
      const activeJobs = jobsData.filter((j: Job) => j.status === 'ACTIVE').length;

      setStats({
        totalApplications: totalApps,
        interviews,
        offers,
        activeJobs,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Transform API jobs to JobCard format
  const transformJob = (job: Job) => ({
    id: job.id,
    title: job.title,
    yachtName: job.company,
    location: job.location || 'Location not specified',
    salary: job.salaryRange || 'Salary not specified',
    type: job.jobType,
    postedAt: job.createdAt,
    department: 'General', // Default since API doesn't have department yet
  });

  // Transform API applications to ApplicationTracker format
  const transformApplication = (app: Application) => ({
    id: app.id,
    jobTitle: app.job.title,
    company: app.job.company,
    status: app.status.toLowerCase(),
    date: app.appliedAt || app.createdAt,
  });

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'User';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-ocean-500" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-navy-900">
              Welcome back, {firstName}
            </h1>
            <p className="text-gray-500">
              Here&apos;s what&apos;s happening with your job search
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Applications"
              value={stats.totalApplications}
              change={stats.totalApplications > 0 ? "Keep applying!" : "Get started"}
              changeType="positive"
              icon={FileText}
              iconClassName="bg-ocean-100 text-ocean-500"
            />
            <StatsCard
              title="Interviews"
              value={stats.interviews}
              change={stats.interviews > 0 ? "Great progress!" : "Awaiting responses"}
              changeType="positive"
              icon={MessageSquare}
              iconClassName="bg-purple-100 text-purple-500"
            />
            <StatsCard
              title="Job Offers"
              value={stats.offers}
              change={stats.offers > 0 ? "Congratulations!" : "Keep going"}
              changeType="positive"
              icon={Briefcase}
              iconClassName="bg-success-500/10 text-success-500"
            />
            <StatsCard
              title="Active Jobs"
              value={stats.activeJobs}
              change={stats.activeJobs > 0 ? "Opportunities" : "Add jobs"}
              changeType="positive"
              icon={Users}
              iconClassName="bg-gold-100 text-gold-500"
            />
          </div>

          {/* AI Status Banner */}
          <div className="mb-8 bg-gradient-to-r from-navy-800 to-navy-700 rounded-xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-ocean-500/20 rounded-xl">
                <Sparkles className="w-6 h-6 text-ocean-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Auto-Apply is Active</h3>
                <p className="text-gray-300 text-sm">
                  AutoApply AI is monitoring job boards and will help you apply to matching positions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-success-500/20 text-success-400 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                Active
              </span>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                Configure
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Job Listings */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-navy-900">Recent Jobs</h2>
                <a 
                  href="/dashboard/jobs" 
                  className="text-sm text-ocean-500 hover:text-ocean-600 font-medium"
                >
                  View all jobs
                </a>
              </div>
              
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.slice(0, 3).map((job) => (
                    <JobCard key={job.id} job={transformJob(job)} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
                  <p className="text-gray-500 mb-4">No jobs added yet</p>
                  <a
                    href="/dashboard/jobs"
                    className="inline-flex items-center px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-colors"
                  >
                    Browse Jobs
                  </a>
                </div>
              )}
            </div>

            {/* Application Tracker */}
            <div>
              {applications.length > 0 ? (
                <ApplicationTracker applications={applications.map(transformApplication)} />
              ) : (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-navy-900 mb-4">Recent Applications</h3>
                  <p className="text-gray-500 text-sm">No applications submitted yet. Start by adding jobs and applying!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

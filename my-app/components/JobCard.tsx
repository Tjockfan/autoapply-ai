'use client';

import { MapPin, Ship, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Job } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-ocean-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-600 to-ocean-500 flex items-center justify-center text-white font-bold">
            {job.yachtName.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-navy-900">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.yachtName} • {job.yachtType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {job.isNew && (
            <span className="px-2 py-1 bg-success-500/10 text-success-500 text-xs font-semibold rounded-full">
              New
            </span>
          )}
          <div className="flex items-center gap-1 px-2 py-1 bg-ocean-100 text-ocean-600 text-xs font-semibold rounded-full">
            <span>{job.matchScore}%</span>
            <span className="hidden sm:inline">match</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.requirements.slice(0, 3).map((req) => (
          <span
            key={req}
            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
          >
            {req}
          </span>
        ))}
        {job.requirements.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
            +{job.requirements.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">{job.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          <span className="hidden sm:inline">{job.salary}</span>
        </div>
        <div className="flex items-center gap-1">
          <Ship className="w-4 h-4" />
          <span>{job.position}</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Clock className="w-4 h-4" />
          <span>{job.postedAt}</span>
        </div>
      </div>

      <button
        onClick={() => onApply?.(job.id)}
        className={cn(
          'w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all',
          'bg-gradient-to-r from-navy-600 to-ocean-500 text-white',
          'hover:shadow-lg hover:shadow-ocean-500/25 hover:-translate-y-0.5',
          'flex items-center justify-center gap-2'
        )}
      >
        <CheckCircle className="w-4 h-4" />
        Auto-Apply Now
      </button>
    </div>
  );
}

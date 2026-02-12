'use client';

import { MapPin, Ship, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    yachtName: string;
    location: string;
    salary: string;
    type: string;
    postedAt: string;
    department: string;
    status: string;
  };
  onApply?: (jobId: string) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">
            {job.yachtName.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.yachtName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
            {job.department}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          <span>{job.salary}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{job.postedAt}</span>
        </div>
      </div>

      <button
        onClick={() => onApply?.(job.id)}
        className={cn(
          'w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all',
          'bg-gradient-to-r from-blue-600 to-cyan-500 text-white',
          'hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5',
          'flex items-center justify-center gap-2'
        )}
      >
        <CheckCircle className="w-4 h-4" />
        Auto-Apply Now
      </button>
    </div>
  );
}

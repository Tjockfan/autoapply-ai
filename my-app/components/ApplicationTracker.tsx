'use client';

import { Application } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

interface ApplicationTrackerProps {
  applications: Application[];
}

const statusConfig = {
  applied: {
    label: 'Applied',
    icon: CheckCircle,
    className: 'bg-ocean-100 text-ocean-600 border-ocean-200',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-warning-500/10 text-warning-600 border-warning-500/20',
  },
  interview: {
    label: 'Interview',
    icon: MessageSquare,
    className: 'bg-purple-100 text-purple-600 border-purple-200',
  },
  offer: {
    label: 'Offer',
    icon: CheckCircle,
    className: 'bg-success-500/10 text-success-600 border-success-500/20',
  },
  rejected: {
    label: 'Not Selected',
    icon: XCircle,
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

export function ApplicationTracker({ applications }: ApplicationTrackerProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-navy-900">Application Tracker</h2>
        <button className="text-sm text-ocean-500 hover:text-ocean-600 font-medium">
          View all
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {applications.map((application) => {
          const status = statusConfig[application.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={application.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-600 to-ocean-500 flex items-center justify-center text-white font-bold text-sm">
                    {application.yachtName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">{application.jobTitle}</p>
                    <p className="text-sm text-gray-500">{application.yachtName}</p>
                    {application.notes && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {application.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
                      status.className
                    )}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">{application.lastUpdated}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

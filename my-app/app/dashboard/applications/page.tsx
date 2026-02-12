'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import api from '@/lib/api';
import { Loader2, FileText, X, Plus, ArrowRight } from 'lucide-react';

interface Application {
  id: string;
  status: string;
  coverLetter?: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    location?: string;
    url?: string;
  };
  resume?: {
    id: string;
    name: string;
  };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPLIED: 'bg-blue-100 text-blue-800',
  INTERVIEWING: 'bg-purple-100 text-purple-800',
  REJECTED: 'bg-red-100 text-red-800',
  OFFERED: 'bg-green-100 text-green-800',
  HIRED: 'bg-green-100 text-green-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  APPLIED: 'Applied',
  INTERVIEWING: 'Interviewing',
  REJECTED: 'Rejected',
  OFFERED: 'Offered',
  HIRED: 'Hired',
  WITHDRAWN: 'Withdrawn',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.getApplications({ limit: 50 });

      if (response.error) {
        setError(response.error);
        return;
      }

      setApplications(response.data?.applications || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    const response = await api.updateApplication(appId, { status: newStatus });
    
    if (response.error) {
      setError(response.error);
    } else {
      fetchApplications();
      if (selectedApp?.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    }
  };

  const filteredApplications = filter === 'ALL' 
    ? applications 
    : applications.filter(a => a.status === filter);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    applied: applications.filter(a => a.status === 'APPLIED').length,
    interviewing: applications.filter(a => a.status === 'INTERVIEWING').length,
    offers: applications.filter(a => a.status === 'OFFERED' || a.status === 'HIRED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-navy-900">Applications</h1>
            <p className="text-gray-500">Track and manage your job applications</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, color: 'bg-gray-100' },
              { label: 'Pending', value: stats.pending, color: 'bg-yellow-50' },
              { label: 'Applied', value: stats.applied, color: 'bg-blue-50' },
              { label: 'Interviewing', value: stats.interviewing, color: 'bg-purple-50' },
              { label: 'Offers', value: stats.offers, color: 'bg-green-50' },
            ].map((stat) => (
              <button
                key={stat.label}
                onClick={() => setFilter(filter === stat.label.toUpperCase() ? 'ALL' : stat.label.toUpperCase())}
                className={`p-4 rounded-xl border transition-all ${
                  filter === stat.label.toUpperCase() 
                    ? 'border-ocean-500 ring-2 ring-ocean-500/20' 
                    : 'border-gray-100 hover:border-gray-200'
                } ${stat.color}`}
              >
                <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4 flex items-center justify-between">
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-ocean-500" />
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Job</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Company</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Applied</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-navy-900">{app.job.title}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-600">{app.job.company}</div>
                        {app.job.location && (
                          <div className="text-sm text-gray-400">{app.job.location}</div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className={`text-sm font-medium px-3 py-1 rounded-full border-0 cursor-pointer ${statusColors[app.status] || 'bg-gray-100'}`}
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600">
                          {app.appliedAt 
                            ? new Date(app.appliedAt).toLocaleDateString() 
                            : new Date(app.createdAt).toLocaleDateString()
                          }
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-ocean-500 hover:text-ocean-600 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-navy-900 mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-4">Start by adding jobs and creating applications</p>
              <a
                href="/dashboard/jobs"
                className="inline-flex items-center px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Browse Jobs
              </a>
            </div>
          )}
        </div>
      </main>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-navy-900">{selectedApp.job.title}</h2>
                <p className="text-gray-500">{selectedApp.job.company}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <select
                    value={selectedApp.status}
                    onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                    className={`text-sm font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer ${statusColors[selectedApp.status] || 'bg-gray-100'}`}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Applied</p>
                  <p className="font-medium text-navy-900">
                    {selectedApp.appliedAt 
                      ? new Date(selectedApp.appliedAt).toLocaleDateString() 
                      : new Date(selectedApp.createdAt).toLocaleDateString()
                    }
                  </p>
                </div>
                
                {selectedApp.resume && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Resume</p>
                    <p className="font-medium text-navy-900">{selectedApp.resume.name}</p>
                  </div>
                )}
              </div>
              
              {selectedApp.coverLetter && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Cover Letter</p>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedApp.coverLetter}
                  </div>
                </div>
              )}
              
              {selectedApp.job.url && (
                <a
                  href={selectedApp.job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-ocean-500 hover:text-ocean-600 font-medium"
                >
                  View Job Posting
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

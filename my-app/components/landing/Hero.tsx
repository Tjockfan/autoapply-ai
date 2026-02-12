'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 pt-20 lg:pt-0 flex items-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-ocean-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-500/20 border border-ocean-500/30 rounded-full mb-6">
              <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-ocean-300 text-sm font-medium">Now accepting applications</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Land Your Dream{' '}
              <span className="bg-gradient-to-r from-ocean-400 to-gold-400 bg-clip-text text-transparent">
                Yacht Crew
              </span>{' '}
              Job on Autopilot
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
              AI-powered job matching and automatic applications for deckhands, stewards, engineers, and chefs. Let AutoApply AI handle the paperwork while you focus on your career.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-bold rounded-xl hover:shadow-xl hover:shadow-gold-500/25 hover:-translate-y-0.5 transition-all"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center lg:text-left">
                <p className="text-3xl lg:text-4xl font-bold text-white">2,500+</p>
                <p className="text-sm text-gray-500">Jobs Applied</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-3xl lg:text-4xl font-bold text-white">89%</p>
                <p className="text-sm text-gray-500">Success Rate</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-3xl lg:text-4xl font-bold text-white">48hrs</p>
                <p className="text-sm text-gray-500">Avg. Response</p>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
              {/* Window controls */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>

              {/* Preview cards */}
              <div className="space-y-3">
                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 animate-slide-in">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-500 to-navy-600 flex items-center justify-center text-white font-semibold text-sm">
                    JS
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Deckhand Position - M/Y Aurora</p>
                    <p className="text-gray-500 text-xs">Applied 2 minutes ago</p>
                  </div>
                  <span className="px-3 py-1 bg-success-500/20 text-success-500 text-xs font-semibold rounded-full">
                    Applied
                  </span>
                </div>

                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-500 to-navy-600 flex items-center justify-center text-white font-semibold text-sm">
                    AS
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">2nd Stewardess - S/Y Serenity</p>
                    <p className="text-gray-500 text-xs">Auto-applying...</p>
                  </div>
                  <span className="px-3 py-1 bg-warning-500/20 text-warning-500 text-xs font-semibold rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                </div>

                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-500 to-navy-600 flex items-center justify-center text-white font-semibold text-sm">
                    MK
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Chef de Cuisine - M/Y Eclipse</p>
                    <p className="text-gray-500 text-xs">Matched 98%</p>
                  </div>
                  <span className="px-3 py-1 bg-success-500/20 text-success-500 text-xs font-semibold rounded-full">
                    Applied
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

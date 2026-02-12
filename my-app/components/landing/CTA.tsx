import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative py-20 lg:py-24 bg-gradient-to-br from-navy-900 to-navy-800 overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-ocean-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Ready to Land Your Dream Job?
        </h2>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of yacht crew professionals who&apos;ve accelerated their careers with AutoApply AI.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-bold rounded-xl hover:shadow-xl hover:shadow-gold-500/25 hover:-translate-y-0.5 transition-all"
        >
          Start Your Free 14-Day Trial
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}

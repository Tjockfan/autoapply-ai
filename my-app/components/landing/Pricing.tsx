'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    price: 29,
    description: 'Perfect for getting started with yacht crew applications',
    features: [
      '10 auto-applications/month',
      'Basic job matching',
      'Application tracking',
      'Email support',
      'CV templates',
    ],
    cta: 'Get Started',
    ctaClass: 'bg-white border-2 border-gray-200 text-navy-900 hover:border-navy-600',
    featured: false,
  },
  {
    name: 'Professional',
    price: 79,
    description: 'Best value for serious job seekers',
    features: [
      'Unlimited auto-applications',
      'Advanced AI matching',
      'Priority application queue',
      'Interview prep AI',
      '24/7 chat support',
      'CV optimization',
      'Salary insights',
    ],
    cta: 'Start Free Trial',
    ctaClass: 'bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-bold hover:shadow-xl hover:shadow-gold-500/25',
    featured: true,
    badge: 'MOST POPULAR',
  },
  {
    name: 'Agency',
    price: 199,
    description: 'For crew agencies managing multiple candidates',
    features: [
      'Everything in Professional',
      'Up to 10 crew profiles',
      'Agency dashboard',
      'Bulk applications',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    ctaClass: 'bg-white border-2 border-gray-200 text-navy-900 hover:border-navy-600',
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-ocean-100 text-navy-600 text-sm font-semibold rounded-full mb-4">
            Pricing
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-500">
            Choose the plan that fits your career goals. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative p-8 rounded-3xl border-2 transition-all',
                plan.featured
                  ? 'bg-navy-900 border-gold-500 scale-105 shadow-xl'
                  : 'bg-gray-50 border-transparent hover:border-gray-200'
              )}
            >
              {plan.badge && (
                <span className="absolute -top-4 right-8 px-4 py-1 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 text-xs font-bold rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <h3
                  className={cn(
                    'font-bold text-xl mb-2',
                    plan.featured ? 'text-white' : 'text-navy-900'
                  )}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      'text-4xl font-extrabold',
                      plan.featured ? 'text-white' : 'text-navy-900'
                    )}
                  >
                    ${plan.price}
                  </span>
                  <span
                    className={cn(
                      plan.featured ? 'text-gray-400' : 'text-gray-500'
                    )}
                  >
                    /month
                  </span>
                </div>
                <p
                  className={cn(
                    'mt-2 text-sm',
                    plan.featured ? 'text-gray-400' : 'text-gray-500'
                  )}
                >
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      'flex items-center gap-3 text-sm',
                      plan.featured ? 'text-gray-300' : 'text-gray-600'
                    )}
                  >
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center',
                        plan.featured
                          ? 'bg-success-500/20 text-success-500'
                          : 'bg-success-500/10 text-success-500'
                      )}
                    >
                      <Check className="w-3 h-3" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard"
                className={cn(
                  'block w-full py-3 px-6 text-center rounded-xl font-semibold transition-all',
                  plan.ctaClass
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

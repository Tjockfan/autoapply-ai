import {
  Target,
  Bot,
  BarChart3,
  Sparkles,
  Bell,
  MessageSquare,
  Globe,
  Lock,
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Smart Job Matching',
    description:
      'AI analyzes your profile, experience, and preferences to find the perfect yacht crew positions that match your skills.',
    iconClass: 'bg-ocean-100 text-ocean-500',
  },
  {
    icon: Bot,
    title: 'Auto-Apply 24/7',
    description:
      'Our AI automatically submits tailored applications to matching jobs even while you sleep. Never miss an opportunity.',
    iconClass: 'bg-gold-100 text-gold-500',
  },
  {
    icon: BarChart3,
    title: 'Application Tracker',
    description:
      'Track all your applications in one dashboard. See status updates, interview requests, and offers in real-time.',
    iconClass: 'bg-navy-100 text-navy-600',
  },
  {
    icon: Sparkles,
    title: 'CV Optimization',
    description:
      'AI-enhanced CV builder with yacht industry templates. Stand out from the competition with professionally formatted documents.',
    iconClass: 'bg-success-500/10 text-success-500',
  },
  {
    icon: Bell,
    title: 'Instant Alerts',
    description:
      'Get notified immediately when new jobs matching your criteria are posted. Be the first to apply.',
    iconClass: 'bg-ocean-100 text-ocean-500',
  },
  {
    icon: MessageSquare,
    title: 'Interview Prep',
    description:
      'AI-powered interview coaching specific to yacht crew hiring. Practice with common questions and get feedback.',
    iconClass: 'bg-gold-100 text-gold-500',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description:
      'Access yacht job listings from Mediterranean, Caribbean, Pacific and beyond. Work anywhere in the world.',
    iconClass: 'bg-navy-100 text-navy-600',
  },
  {
    icon: Lock,
    title: 'Privacy Protected',
    description:
      'Your data is encrypted and never shared. Control exactly what information employers can see.',
    iconClass: 'bg-success-500/10 text-success-500',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-ocean-100 text-navy-600 text-sm font-semibold rounded-full mb-4">
            Features
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
            Everything You Need to Get Hired
          </h2>
          <p className="text-lg text-gray-500">
            From job discovery to application submission, our AI handles every step of your yacht crew job search.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-ocean-200 hover:shadow-lg transition-all"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${feature.iconClass}`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

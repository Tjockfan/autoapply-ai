export function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Create Your Profile',
      description:
        'Upload your CV, certificates, and preferences. Our AI analyzes your experience and qualifications.',
    },
    {
      number: '2',
      title: 'Set Your Preferences',
      description:
        'Choose yacht types, locations, positions, and salary expectations. Fine-tune your job matching criteria.',
    },
    {
      number: '3',
      title: 'Let AI Work for You',
      description:
        'AutoApply AI finds and applies to matching jobs 24/7. You focus on preparing for interviews.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-ocean-100 text-navy-600 text-sm font-semibold rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-lg text-gray-500">
            Three simple steps to automate your yacht crew job search
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-ocean-500 to-ocean-300" />
              )}

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-navy-600 to-ocean-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-ocean-500/25">
                  {step.number}
                </div>
                <h3 className="font-bold text-navy-900 text-xl mb-3">{step.title}</h3>
                <p className="text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

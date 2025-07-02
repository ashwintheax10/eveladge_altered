const plans = [
  {
    name: 'Basic',
    price: '$499',
    period: '/month',
    description: 'Perfect for smaller departments or pilot programs.',
    features: [
      'Up to 500 exams per month',
      'Basic AI proctoring',
      'Standard analytics',
      'Email support',
    ],
    cta: 'Get Started',
    ctaStyle: 'bg-white text-blue-700 border border-blue-700 hover:bg-blue-50',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '$999',
    period: '/month',
    description: 'Ideal for medium-sized departments or colleges.',
    features: [
      'Up to 2,000 exams per month',
      'Advanced AI proctoring',
      'Enhanced analytics dashboard',
      'Priority email & phone support',
      'LMS integration',
    ],
    cta: 'Get Started',
    ctaStyle: 'bg-gradient-to-r from-blue-700 to-purple-600 text-white shadow-lg hover:from-blue-800 hover:to-purple-700',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large institutions with specific requirements.',
    features: [
      'Unlimited exams',
      'Premium AI proctoring',
      'Custom analytics & reporting',
      '24/7 dedicated support',
      'Advanced LMS integration',
      'Custom branding',
    ],
    cta: 'Contact Sales',
    ctaStyle: 'bg-white text-blue-700 border border-blue-700 hover:bg-blue-50',
    highlight: false,
  },
];

const Pricing = () => (
  <section id="pricing" className="py-16 bg-white">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12 mt-0">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
        <p className="text-xl text-gray-600">Choose the plan that works best for your institution</p>
      </div>
      <div className="flex flex-col md:flex-row gap-8 md:gap-4 justify-center items-stretch relative">
        {plans.map((plan, i) => (
          <div
            key={plan.name}
            className={`relative flex-1 flex flex-col rounded-2xl bg-white/70 shadow-2xl p-8 border transition-all duration-300 backdrop-blur-md ${plan.highlight ? 'border-2 border-blue-600 scale-105 z-10' : 'border border-gray-200'} ${plan.highlight ? 'md:-mt-6' : ''}`}
            style={{ minWidth: 0 }}
          >
            {plan.badge && (
              <div className="flex justify-center mb-4 -mt-10">
                <span className="inline-block px-5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-500 text-white text-xs font-bold shadow-lg border-2 border-white">
                  {plan.badge}
                </span>
              </div>
            )}
            <h3 className="text-xl font-bold mb-2 text-gray-900 text-center">{plan.name}</h3>
            <div className="flex items-end justify-center mb-2">
              <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
              <span className="text-lg text-gray-500 ml-1">{plan.period}</span>
            </div>
            <p className="text-gray-600 mb-6 text-center">{plan.description}</p>
            <ul className="mb-8 space-y-2 w-full">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">&#10003;</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-md font-semibold shadow-sm transition ${plan.ctaStyle}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Pricing; 
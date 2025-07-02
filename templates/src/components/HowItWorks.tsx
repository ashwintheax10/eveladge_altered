const steps = [
  { icon: "fa-cog", title: "Setup", desc: "Configure your assessment settings and security requirements." },
  { icon: "fa-user-plus", title: "Invite", desc: "Send secure access links to students via email or your LMS." },
  { icon: "fa-desktop", title: "Monitor", desc: "View real-time proctoring data and assessment progress." },
  { icon: "fa-chart-line", title: "Analyze", desc: "Review comprehensive reports and performance analytics." }
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-16 bg-gray-50 md:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
        <p className="max-w-3xl mx-auto text-xl text-gray-600">Get started with EvalEdge in four simple steps</p>
      </div>

      <div className="relative">
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="md:absolute md:top-0 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center h-12 w-12 rounded-full bg-blue-700 text-white text-xl font-bold z-10 mb-4 md:mb-0 mx-auto">
                {index + 1}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md h-full">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mb-4">
                    <i className={`fas ${step.icon} text-2xl`}></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;

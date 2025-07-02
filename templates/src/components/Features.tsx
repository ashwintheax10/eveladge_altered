const features = [
  {
    icon: "fa-video",
    title: "Live AI Proctoring",
    description: "Advanced AI monitors for suspicious behavior while respecting student privacy.",
    gradient: "from-blue-500 to-purple-500"
  },
  {
    icon: "fa-chart-bar",
    title: "Auto-Grading & Reports",
    description: "Instant grading with detailed analytics and customizable reporting options.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: "fa-shield-alt",
    title: "Plagiarism Detection",
    description: "Sophisticated algorithms identify potential academic integrity violations.",
    gradient: "from-green-400 to-blue-500"
  },
  {
    icon: "fa-plug",
    title: "Seamless LMS Integration",
    description: "Works with Canvas, Blackboard, Moodle, and other popular systems.",
    gradient: "from-yellow-400 to-pink-500"
  }
];

const Features = () => (
  <section id="features" className="py-16 md:py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Key Features
        </h2>
        <p className="max-w-3xl mx-auto text-xl text-gray-600">
          Our comprehensive platform provides everything you need to conduct secure and effective online assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description, gradient }, i) => (
          <div
            key={i}
            className="relative group rounded-2xl p-8 bg-white/60 border border-white/30 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/80"
            style={{ minHeight: 300 }}
          >
            <div className="flex justify-center mb-6">
              <div
                className={`w-16 h-16 flex items-center justify-center rounded-xl shadow-lg bg-gradient-to-tr ${gradient} group-hover:scale-110 transition-transform duration-300`}
              >
                <i className={`fas ${icon} text-white text-2xl`}></i>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-purple-600 transition-all duration-300">
              {title}
            </h3>
            <p className="text-gray-700 text-center text-base font-medium opacity-90">
              {description}
            </p>
            <div className="absolute -z-10 inset-0 rounded-2xl pointer-events-none group-hover:blur-xl group-hover:opacity-40 transition-all duration-300" style={{background: `linear-gradient(135deg, var(--tw-gradient-stops))`}}></div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;

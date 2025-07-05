import { useEffect, useState } from "react";

const testimonials = [
  {
    quote:
      "EvalEdge has transformed how we conduct assessments. The AI proctoring gives us confidence in academic integrity while providing a seamless experience for students.",
    name: "Dr. Sarah Johnson",
    title: "Dean of Academic Affairs",
    university: "Westfield University",
  },
  {
    quote:
      "The analytics dashboard has given us unprecedented insights into student performance patterns. We've been able to identify and address learning gaps much more effectively.",
    name: "Prof. Michael Chen",
    title: "Department Chair",
    university: "Lakeside College",
  },
  {
    quote:
      "Implementation was surprisingly easy. The platform integrated perfectly with our existing LMS, and the support team was exceptional throughout the process.",
    name: "Dr. Emily Rodriguez",
    title: "Director of Digital Learning",
    university: "Northern State University",
  },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="py-16 bg-blue-900 text-white md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Universities Are Saying
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-blue-100">
            Hear from academic professionals who have transformed their assessment process
          </p>
        </div>

        <div className="relative">
          <div className="flex overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {testimonials.map((t, i) => (
                <div key={i} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-xl p-8 text-gray-800 shadow-xl">
                    <div className="mb-6">
                      <i className="fas fa-quote-left text-3xl text-blue-300"></i>
                    </div>
                    <p className="text-lg mb-6 italic">"{t.quote}"</p>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <i className="fas fa-user text-blue-700"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{t.name}</h4>
                        <p className="text-sm text-gray-600">{t.title}</p>
                        <p className="text-sm text-blue-700">{t.university}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-3 w-3 rounded-full transition-colors duration-300 ${
                  active === i ? "bg-white" : "bg-blue-300"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

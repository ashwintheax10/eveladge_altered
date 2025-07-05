const names = ["Westfield", "Northern", "Lakeside", "Eastwood", "Central", "Riverside"];

const TrustedBy = () => (
  <section className="py-12 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-center text-xl font-medium text-gray-600 mb-8">
        Trusted by institutions across the country
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {names.map((name, i) => (
          <div key={i} className="flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-500 hover:text-blue-700 transition">
              <i className="fas fa-university text-2xl"></i>
              <span className="font-medium">
                {name} {i < 3 ? "University" : "College"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustedBy;

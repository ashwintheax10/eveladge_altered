const DashboardPreview = () => (
  <section className="py-16 md:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Admin Dashboard Preview
        </h2>
        <p className="max-w-3xl mx-auto text-xl text-gray-600">
          Powerful analytics and monitoring tools at your fingertips
        </p>
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="relative rounded-xl overflow-hidden shadow-2xl transform perspective-1000 rotate-x-2">
          <img
            src="https://readdy.ai/api/search-image?query=A%20modern%2C%20clean%20university%20admin%20dashboard%20interface&width=1000&height=600&seq=dashboard1"
            alt="EvalEdge Admin Dashboard"
            className="w-full h-auto"
          />
          <div className="absolute top-10 right-10 bg-white p-4 rounded-lg shadow-lg">
            <div className="text-sm font-medium text-gray-800">Integrity Alerts</div>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <div className="text-xs text-gray-500">Compliance Rate</div>
          </div>
          <div className="absolute bottom-10 left-10 bg-white p-4 rounded-lg shadow-lg">
            <div className="text-sm font-medium text-gray-800">Completion Rate</div>
            <div className="text-2xl font-bold text-blue-600">96.2%</div>
            <div className="text-xs text-gray-500">+2.4% from last semester</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-md text-lg font-medium shadow-lg transition duration-300">
            See Full Demo
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default DashboardPreview;

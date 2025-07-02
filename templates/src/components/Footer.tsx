const Footer = () => (
  <footer className="bg-gray-900 text-white pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="text-2xl font-bold mb-4">
            <span className="text-purple-400">Eval</span>Edge
          </div>
          <p className="text-gray-400 mb-4">
            AI-powered assessment platform designed for modern institutions.
          </p>
          <div className="flex space-x-4">
            {["linkedin", "github", "twitter"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-gray-400 hover:text-white transition duration-300"
              >
                <i className={`fab fa-${social} text-xl`}></i>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            {["About Us", "Careers", "Blog", "Press"].map((item) => (
              <li key={item}>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <ul className="space-y-2">
            {["Documentation", "Help Center", "Webinars", "Case Studies"].map((item) => (
              <li key={item}>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            {["Privacy Policy", "Terms of Service", "Security", "GDPR Compliance"].map((item) => (
              <li key={item}>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8">
        <p className="text-center text-gray-500 text-sm">
          &copy; 2025 EvalEdge, Inc. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;

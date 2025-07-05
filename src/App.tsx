import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
// import TrustedBy from './components/TrustedBy';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
// import DashboardPreview from './components/DashboardPreview';
import Pricing from './components/Pricing';
// import Testimonials from './components/Testimonials';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import Instructions from './components/Instructions';
import Exam from './components/Exam';
import MonitoringStart from './components/MonitoringStart';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Navbar />
            <Hero />
            {/* <TrustedBy /> */}
            <Features />
            <HowItWorks />
            {/* <DashboardPreview /> */}
            <Pricing />
            {/* <Testimonials /> */}
            <FinalCTA />
            <Footer />
          </>
        } />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/monitoring-start" element={<MonitoringStart />} />
        <Route path="/exam" element={<Exam />} />
      </Routes>
    </Router>
  );
}

export default App;

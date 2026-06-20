import { useEffect, useState } from 'react';
import AnimatedBackground from '../components/landing/AnimatedBackground';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import TrustedSection from '../components/landing/TrustedSection';
import ProductShowcase from '../components/landing/ProductShowcase';
import RoleBasedExperienceSection from '../components/landing/RoleBasedExperienceSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import AnalyticsSection from '../components/landing/AnalyticsSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import PricingSection from '../components/landing/PricingSection';
import ROICalculatorSection from '../components/landing/ROICalculatorSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import FooterSection from '../components/landing/FooterSection';
import LandingScrollProgress from '../components/landing/LandingScrollProgress';

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      setScrollProgress(Number((totalScroll / windowHeight) * 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#020617' }}>
      
      {/* ── Scroll Progress Bar ── */}
      <div 
        className="fixed top-0 left-0 z-[9999] h-[2px] transition-all duration-75 ease-out"
        style={{ 
          width: `${scrollProgress}%`,
          background: 'linear-gradient(to right, #2563EB, #7C3AED, #22C55E)',
          boxShadow: '0 0 10px rgba(37,99,235,0.8)'
        }}
      />

      {/* ── Floating Background Orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Blue orb top-right */}
        <div className="absolute -right-64 -top-64 h-[800px] w-[800px] rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #2563eb, transparent 60%)' }} />
        {/* Purple orb center-left */}
        <div className="absolute -left-64 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #7c3aed, transparent 60%)' }} />
        {/* Green orb bottom-left */}
        <div className="absolute -bottom-64 left-1/4 h-[700px] w-[700px] rounded-full opacity-5 blur-3xl" style={{ background: 'radial-gradient(circle, #22c55e, transparent 60%)' }} />
      </div>

      {/* ── Page Content ── */}
      <div className="relative z-10">
        <LandingScrollProgress />
        
        <div data-section="Hero">
          <AnimatedBackground>
            <LandingNavbar />
            <HeroSection />
          </AnimatedBackground>
        </div>

        <div data-section="Trusted By">
          <TrustedSection />
        </div>
        
        <div data-section="Product">
          <ProductShowcase />
        </div>
        
        <div data-section="Experience">
          <RoleBasedExperienceSection />
        </div>
        
        <div data-section="Features">
          <FeaturesSection />
        </div>
        
        <div data-section="Analytics">
          <AnalyticsSection />
        </div>
        
        <div data-section="Customer Stories">
          <TestimonialsSection />
        </div>
        
        <div data-section="Pricing">
          <PricingSection />
        </div>
        
        <div data-section="ROI Calculator">
          <ROICalculatorSection />
        </div>
        
        <div data-section="FAQ">
          <FAQSection />
        </div>
        
        <div data-section="Get Started">
          <CTASection />
        </div>
        
        <FooterSection />
      </div>
      
    </div>
  );
}

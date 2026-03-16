import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Scene } from '@/components/three';
import { VideoBackground, Navbar } from '@/components/layout';
import { Hero } from '@/components/Hero';
import { AuthModal } from '@/components/auth';
import { useParallax } from '@/components/motion';
import { useAuth } from '@/context/AuthContext';

export function Landing(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isDemo, startDemoMode } = useAuth();
  const { scrollY, mousePosition } = useParallax({ speed: 0.3 });
  
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (location.state?.showAuth) {
      setShowAuth(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (isDemo || user) {
      console.log('[Landing] User detected, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isDemo, user, navigate]);

  const handleTryDemo = () => {
    console.log('[Landing] Starting demo');
    startDemoMode();
  };

  const handleAuthSuccess = () => {
    console.log('[Landing] Auth success');
    setShowAuth(false);
  };

  return (
    <div className="relative min-h-screen bg-obsidian">
      <VideoBackground blurAmount={35} />
      <Scene scrollY={scrollY} mousePosition={mousePosition} />
      
      <div className="content-layer">
        <Navbar />
        <Hero />
        
        <section id="features" className="min-h-screen flex items-center justify-center py-32">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Features that <span className="text-vibe-mint">Wow</span>
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Cutting-edge tools for modern testimonial collection
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: '🎬', title: 'Video Testimonials', desc: 'Collect powerful video feedback' },
                { icon: '🔗', title: 'Smart Sharing', desc: 'Share via link, QR code, email' },
                { icon: '📊', title: 'Analytics', desc: 'Track views and conversions' },
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-vibe-mint/50 transition-all"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start <span className="text-vibe-mint">Free</span> Today
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleTryDemo}
                className="px-8 py-4 bg-vibe-mint hover:bg-vibe-mintLight text-obsidian font-bold rounded-xl text-lg"
              >
                Try Free Demo Now!
              </button>
              <button
                onClick={() => setShowAuth(true)}
                className="px-8 py-4 bg-white/5 border border-white/20 text-white rounded-xl text-lg"
              >
                Create Account
              </button>
            </div>
          </div>
        </section>

        <footer className="py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
            <p>© 2026 VouchVibe. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

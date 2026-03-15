import { motion } from 'framer-motion';
import { Container } from './layout';
import { MotionWrapper, staggerContainer } from './motion';

export function Hero(): JSX.Element {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <MotionWrapper className="text-center lg:text-left" variants={staggerContainer}>
            <motion.div
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.span
                variants={staggerContainer}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vibe-mint/10 border border-vibe-mint/30 text-vibe-mint text-sm font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-vibe-mint animate-pulse" />
                Now in Beta - Get Early Access
              </motion.span>

              <motion.h1
                variants={staggerContainer}
                className="text-5xl lg:text-7xl font-bold leading-tight"
              >
                Collect <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibe-mint to-vibe-mintLight">Powerful</span> Testimonials
              </motion.h1>

              <motion.p
                variants={staggerContainer}
                className="text-xl text-gray-400 max-w-xl"
              >
                Transform how you gather customer feedback. Beautiful, 
                immersive forms that your customers love to complete.
              </motion.p>

              <motion.div
                variants={staggerContainer}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-vibe-mint hover:bg-vibe-mintLight text-obsidian font-bold rounded-xl text-lg transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                >
                  Start Free Trial
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-xl text-lg backdrop-blur-sm transition-all"
                >
                  Watch Demo
                </motion.button>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                className="flex items-center gap-6 justify-center lg:justify-start pt-4"
              >
                <div className="flex -space-x-3">
                  {['👤', '👤', '👤', '👤'].map((avatar, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-obsidian-light border-2 border-obsidian flex items-center justify-center text-sm">
                      {avatar}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-white font-semibold">2,500+</span> companies trust us
                </div>
              </motion.div>
            </motion.div>
          </MotionWrapper>

          <MotionWrapper className="relative" delay={0.3}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, type: 'spring', stiffness: 100 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-obsidian-light to-obsidian rounded-3xl p-1 border border-white/10">
                <div className="bg-obsidian-dark/80 backdrop-blur-xl rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vibe-mint to-vibe-mintLight flex items-center justify-center">
                      <span className="text-obsidian text-xl">💬</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Customer Testimonial</div>
                      <div className="text-gray-500 text-sm">★★★★★</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    "VouchVibe completely transformed how we collect feedback. 
                    Our response rate increased by <span className="text-vibe-mint font-semibold">340%</span> in just two months!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    <div>
                      <div className="text-white font-medium">Sarah Johnson</div>
                      <div className="text-gray-500 text-sm">CMO at TechCorp</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-8 -right-8 w-20 h-20 bg-vibe-mint/20 rounded-2xl backdrop-blur-sm border border-vibe-mint/30 flex items-center justify-center text-3xl"
              >
                ✨
              </motion.div>
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-6 -left-6 w-16 h-16 bg-purple-500/20 rounded-xl backdrop-blur-sm border border-purple-500/30 flex items-center justify-center text-2xl"
              >
                🚀
              </motion.div>
            </motion.div>
          </MotionWrapper>
        </div>
      </Container>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 bg-vibe-mint rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

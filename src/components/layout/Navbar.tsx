import { motion } from 'framer-motion';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'How it Works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Testimonials', href: '#testimonials' },
];

export function Navbar(): JSX.Element {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vibe-mint to-vibe-mintLight flex items-center justify-center">
            <span className="text-obsidian font-bold text-xl">V</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Vouch<span className="text-vibe-mint">Vibe</span>
          </span>
        </motion.div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.3 }}
              className="text-gray-300 hover:text-vibe-mint transition-colors text-sm font-medium"
            >
              {link.name}
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3"
        >
          <button className="text-gray-300 hover:text-white transition-colors text-sm font-medium px-4 py-2">
            Sign In
          </button>
          <button className="bg-vibe-mint hover:bg-vibe-mintLight text-obsidian font-semibold px-5 py-2 rounded-lg text-sm transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            Get Started
          </button>
        </motion.div>
      </div>
    </motion.nav>
  );
}

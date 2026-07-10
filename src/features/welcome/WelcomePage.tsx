import { motion } from 'framer-motion';
import { HiPlay, HiFolderOpen, HiCog6Tooth } from 'react-icons/hi2';
import { usePhaseNavigation } from '../../utils/phaseNavigation';
import Button from '../../components/ui/Button';
import mainMenuBg from '../../assets/bd.png';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function WelcomePage() {
  const { goTo, navigate } = usePhaseNavigation();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundColor: '#0b1020',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${mainMenuBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >

      <motion.div variants={itemVariants} className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
          Football Star Pro
        </h1>
        <p className="mt-2 text-gray-500 tracking-widest text-sm uppercase">
          Career Mode
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="w-full max-w-sm space-y-4">
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
          <div className="relative">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<HiPlay className="w-5 h-5" />}
              onClick={() => goTo('createPlayer')}
            >
              New Career
            </Button>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-500 rounded-xl opacity-0 group-hover:opacity-50 blur transition duration-300" />
          <div className="relative">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              icon={<HiFolderOpen className="w-5 h-5" />}
              onClick={() => { navigate('/career/home'); }}
            >
              Load Career
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="lg"
          className="w-full"
          icon={<HiCog6Tooth className="w-5 h-5" />}
          onClick={() => goTo('settings')}
        >
          Settings
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="absolute bottom-6 text-center">
        <p className="text-xs text-gray-700 tracking-wider">v1.0.0</p>
        <p className="text-xs text-gray-700 mt-1">Made with passion for the beautiful game</p>
      </motion.div>
    </motion.div>
  );
}
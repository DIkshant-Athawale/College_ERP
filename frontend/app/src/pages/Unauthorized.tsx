import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Home, ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: theme.background }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: theme.gradient }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: theme.gradient }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
          style={{ background: `${theme.danger}20` }}
        >
          <ShieldAlert className="w-16 h-16" style={{ color: theme.danger }} />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-bold mb-4"
          style={{
            color: 'transparent',
            background: theme.gradient,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
        >
          403
        </motion.h1>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold mb-3"
          style={{ color: theme.text }}
        >
          Access Denied
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
          style={{ color: theme.textMuted }}
        >
          You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/">
            <Button
              className="h-12 px-6 rounded-xl text-white font-medium"
              style={{ background: theme.gradient }}
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button
            variant="outline"
            className="h-12 px-6 rounded-xl"
            onClick={() => window.history.back()}
            style={{ borderColor: theme.border }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;

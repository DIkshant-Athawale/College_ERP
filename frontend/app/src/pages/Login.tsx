import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeSwitcher } from '@/components/ThemeSwitcher.tsx';
import {
  GraduationCap,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Shield,
  Users,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Generate random CAPTCHA
const generateCaptcha = (): { text: string; display: string } => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let text = '';
  for (let i = 0; i < 6; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const display = text.split('').join(' ');
  return { text, display };
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, role } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else if (role === 'faculty' || role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate, location]);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCaptchaError(null);

    if (captchaInput.toLowerCase() !== captcha.text.toLowerCase()) {
      setCaptchaError('Invalid CAPTCHA. Please try again.');
      refreshCaptcha();
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Shield, title: 'Secure Access', desc: 'Enterprise-grade security' },
    { icon: Users, title: 'Multi-Role', desc: 'Student, Faculty & Admin' },
    { icon: BookOpen, title: 'Academic Hub', desc: 'All-in-one platform' },
  ];

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden"
      style={{ background: theme.background }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full opacity-20"
          style={{ background: theme.gradient }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: theme.gradient }}
        />
      </div>

      {/* Theme Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* Left Section - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="lg:w-[55%] relative flex flex-col items-center justify-center p-8 lg:p-16"
      >
        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div
              className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl"
              style={{ background: theme.gradient }}
            >
              <GraduationCap className="w-14 h-14 lg:w-20 lg:h-20 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl lg:text-6xl font-bold mb-4 text-center"
            style={{ color: theme.text }}
          >
            College ERP
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl lg:text-2xl text-center mb-8"
            style={{ color: theme.textMuted }}
          >
            Academic Management System
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center mb-12 max-w-md mx-auto"
            style={{ color: theme.textMuted }}
          >
            Streamline your academic journey with our comprehensive enterprise resource planning solution
          </motion.p>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                className="p-4 rounded-2xl backdrop-blur-md border"
                style={{
                  background: `${theme.surface}90`,
                  borderColor: theme.border
                }}
              >
                <feature.icon
                  className="w-8 h-8 mb-3 mx-auto"
                  style={{ color: theme.primary }}
                />
                <p className="text-sm font-semibold text-center" style={{ color: theme.text }}>
                  {feature.title}
                </p>
                <p className="text-xs text-center mt-1" style={{ color: theme.textMuted }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Section - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="lg:w-[45%] flex items-center justify-center p-4 lg:p-12 relative z-10"
      >
        <Card
          className="w-full max-w-md border-0 shadow-2xl overflow-hidden"
          style={{ background: theme.surface }}
        >
          {/* Card Header Gradient */}
          <div
            className="h-2"
            style={{ background: theme.gradient }}
          />

          <CardContent className="p-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mb-8"
            >
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: theme.text }}
              >
                Welcome Back
              </h2>
              <p style={{ color: theme.textMuted }}>
                Sign in to access your account
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6"
                >
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label
                  htmlFor="email"
                  className="font-medium"
                  style={{ color: theme.text }}
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 transition-all duration-300 focus:ring-2"
                  style={{
                    borderColor: theme.border,
                    '--tw-ring-color': theme.primary
                  } as React.CSSProperties}
                />
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label
                  htmlFor="password"
                  className="font-medium"
                  style={{ color: theme.text }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10 transition-all duration-300 focus:ring-2"
                    style={{
                      borderColor: theme.border,
                      '--tw-ring-color': theme.primary
                    } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                    style={{ color: theme.textMuted }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Remember Me */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm cursor-pointer"
                    style={{ color: theme.textMuted }}
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: theme.primary }}
                >
                  Forgot password?
                </button>
              </motion.div>

              {/* CAPTCHA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-2"
              >
                <Label
                  className="font-medium"
                  style={{ color: theme.text }}
                >
                  Security Check
                </Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div
                      className="rounded-xl p-4 text-center select-none font-mono text-2xl font-bold tracking-[0.3em]"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15)`,
                        color: theme.primary,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {captcha.display}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={refreshCaptcha}
                    className="h-14 w-14 rounded-xl transition-all hover:scale-105"
                    style={{ borderColor: theme.border }}
                  >
                    <RefreshCw className="w-5 h-5" style={{ color: theme.primary }} />
                  </Button>
                </div>
                <Input
                  type="text"
                  placeholder="Enter CAPTCHA code"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                  className={`h-12 transition-all duration-300 focus:ring-2 ${captchaError ? 'border-red-500' : ''
                    }`}
                  style={{
                    borderColor: captchaError ? '#ef4444' : theme.border,
                    '--tw-ring-color': theme.primary
                  } as React.CSSProperties}
                />
                <AnimatePresence>
                  {captchaError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {captchaError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Login Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-70"
                  style={{ background: theme.gradient }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Demo Credentials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 p-4 rounded-xl"
              style={{ background: `${theme.primary}10` }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: theme.primary }}
              >
                Demo Credentials:
              </p>
              <div className="space-y-1 text-xs" style={{ color: theme.textMuted }}>
                <p><strong>Student:</strong> student@college.edu / password123</p>
                <p><strong>Teacher:</strong> teacher@college.edu / password123</p>
                <p><strong>Admin:</strong> admin@college.edu / password123</p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Mail, Lock, User, Chrome, Sparkles, ShieldCheck, ChevronRight } from "lucide-react";
import { signInWithGoogle, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, auth } from "@/src/lib/firebase";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google sign in failed:", error);
      setError("Google authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error: any) {
      console.error("Auth failed:", error);
      setError(error.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-between py-20 px-8 overflow-hidden bg-black text-white font-sans">
      {/* Background Layer */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/90 to-black"></div>
        <img 
          src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=2059" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20 scale-105 blur-[1px]"
          referrerPolicy="no-referrer"
        />
        {/* Subtle Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Logo and Form Container */}
      <div className="w-full flex flex-col items-center space-y-10">
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl"></div>
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary p-[1.5px] shadow-2xl">
            <div className="w-full h-full bg-black rounded-[1.4rem] flex items-center justify-center">
              <Play className="w-8 h-8 text-primary fill-current ml-1" />
            </div>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-6 h-6 text-secondary/60" />
          </motion.div>
        </motion.div>

        {/* Text and Form Stack */}
        <div className="w-full max-w-sm flex flex-col items-center space-y-4">
          <div className="text-center space-y-1 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Viral<span className="text-primary">Scene</span>
            </h1>
            <p className="text-white/50 text-sm font-medium tracking-wide">
              {isLogin ? "Welcome back to the community" : "Start your creative journey today"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <p className="text-xs font-medium text-red-500">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/10 outline-none transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-primary text-black font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="w-full flex flex-col items-center space-y-4">
            <div className="flex items-center gap-4 w-full">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-xs font-medium text-white/20">Or continue with</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              <Chrome className="w-5 h-5" />
              Google
            </button>

            <p className="text-sm text-white/40">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold hover:underline underline-offset-4"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="w-full max-w-md flex flex-col items-center space-y-4">
        <div className="flex items-center gap-2 text-white/30">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-semibold uppercase tracking-widest">Secure Authentication</span>
        </div>
        <p className="text-[10px] text-white/30 text-center px-10 leading-relaxed">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>. 
          AI content is subject to community guidelines.
        </p>
      </div>
    </main>
  );
}

import React, { useState } from 'react';
import { PhoneOutgoing, ArrowRight, UserPlus, LogIn, Briefcase, TrendingUp, ShieldCheck } from 'lucide-react';
import { db } from '../services/mockDb';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regPass, setRegPass] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      const user = db.login(email);
      if (user) {
          onLogin(user);
      } else {
          setError('User not found. Check the credentials below.');
          setIsLoading(false);
      }
    }, 800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      setTimeout(() => {
          try {
              const newUser = db.register(regName, regEmail, regOrg);
              onLogin(newUser);
          } catch (err: any) {
              setError(err.message || 'Registration failed');
              setIsLoading(false);
          }
      }, 800);
  };

  return (
    <div className="min-h-screen bg-bgMain flex flex-col md:flex-row font-sans text-textPrimary">
      
      {/* Left Column - Minimal Branding (No Image) */}
      <div className="md:w-1/2 bg-gradient-to-br from-primaryDark to-primary flex flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm">
                <PhoneOutgoing className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">LeadTrack Pro</span>
          </div>
        </div>

        <div className="relative z-10 my-10 max-w-md">
            <h1 className="text-4xl font-extrabold mb-6 leading-tight">
                Turn Conversations <br />
                <span className="text-accent">Into Conversions</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
                Streamline your follow-ups, organize your leads, and grow your business with our minimal, distraction-free tools.
            </p>
            
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-full">
                        <Briefcase className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Organized Workflows</p>
                        <p className="text-xs text-primary-foreground/60">Keep every lead tracked.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-full">
                        <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Better Close Rates</p>
                        <p className="text-xs text-primary-foreground/60">Never miss a follow-up.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="relative z-10 text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} Nepindo Technologies.
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-bgCard">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-textPrimary">
                    {isRegistering ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="mt-2 text-textSecondary">
                    {isRegistering ? 'Start your 30-day free trial.' : 'Please enter your details to sign in.'}
                </p>
            </div>

            {/* Toggle */}
            <div className="bg-bgMuted p-1 rounded-lg flex">
                <button 
                  onClick={() => { setIsRegistering(false); setError(''); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${!isRegistering ? 'bg-white text-primary shadow-sm' : 'text-textMuted hover:text-textPrimary'}`}
                >
                    Login
                </button>
                <button 
                  onClick={() => { setIsRegistering(true); setError(''); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${isRegistering ? 'bg-white text-primary shadow-sm' : 'text-textMuted hover:text-textPrimary'}`}
                >
                    Register
                </button>
            </div>

            {error && (
                <div className="p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg flex items-center">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            {!isRegistering ? (
                <form className="space-y-5" onSubmit={handleLoginSubmit}>
                    <div>
                        <label className="block text-sm font-semibold text-textSecondary mb-1.5">Email address</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 border border-borderSoft rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-bgMain"
                        placeholder="admin@verdant.com" />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-semibold text-textSecondary">Password</label>
                            <a href="#" className="text-xs font-medium text-accent hover:text-accent/80">Forgot?</a>
                        </div>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 border border-borderSoft rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-bgMain"
                        placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={isLoading}
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-soft text-sm font-bold text-white bg-primary hover:bg-primaryDark focus:outline-none transition-all transform hover:-translate-y-0.5">
                    {isLoading ? 'Authenticating...' : 'Sign In'}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </button>
                </form>
            ) : (
                <form className="space-y-5" onSubmit={handleRegisterSubmit}>
                    <div>
                        <label className="block text-sm font-semibold text-textSecondary mb-1.5">Company Name</label>
                        <input type="text" required value={regOrg} onChange={(e) => setRegOrg(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 border border-borderSoft rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-bgMain"
                        placeholder="GreenGrowth Inc." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-textSecondary mb-1.5">Full Name</label>
                        <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 border border-borderSoft rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-bgMain"
                        placeholder="Alex Green" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-textSecondary mb-1.5">Work Email</label>
                        <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 border border-borderSoft rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-bgMain"
                        placeholder="alex@greengrowth.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-textSecondary mb-1.5">Password</label>
                        <input type="password" required value={regPass} onChange={(e) => setRegPass(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 border border-borderSoft rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-bgMain"
                        placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={isLoading}
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-soft text-sm font-bold text-white bg-accent hover:bg-orange-600 focus:outline-none transition-all transform hover:-translate-y-0.5">
                    {isLoading ? 'Creating Account...' : 'Get Started'}
                    {!isLoading && <UserPlus className="ml-2 h-4 w-4" />}
                    </button>
                </form>
            )}

            <div className="mt-8 pt-6 border-t border-borderSoft">
                <p className="text-xs font-semibold text-textSecondary mb-3 uppercase tracking-wide">Demo Accounts (Pre-loaded):</p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="bg-primary/5 p-2 rounded border border-primary/10 flex justify-between">
                        <span className="text-primaryDark font-medium">Verdant Solutions</span>
                        <span className="text-textSecondary">admin@verdant.com</span>
                    </div>
                    <div className="bg-warning/10 p-2 rounded border border-warning/20 flex justify-between">
                        <span className="text-orange-800 font-medium">Amber Logistics</span>
                        <span className="text-textSecondary">admin@amberlog.com</span>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded border border-yellow-200 flex justify-between">
                        <span className="text-yellow-800 font-medium">Citrus Financial</span>
                        <span className="text-textSecondary">admin@citrusfin.com</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
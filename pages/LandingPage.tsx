import React, { useState } from 'react';
import { CheckCircle, ArrowRight, Bell, Calendar, Zap, ChevronDown, ChevronUp, Star, Menu, X, Check, ShieldCheck, User, Users, Building } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgMain font-sans text-textPrimary selection:bg-primary/20">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-bgCard/80 backdrop-blur-lg z-50 border-b border-borderSoft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-md shadow-glow">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-textPrimary">LeadTrack Pro</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-textSecondary hover:text-primary transition-colors">Pricing</button>
              <div className="h-4 w-px bg-borderSoft"></div>
              <button onClick={onLogin} className="text-sm font-medium text-textPrimary hover:text-primary transition-colors">Sign In</button>
              <button 
                onClick={onGetStarted}
                className="bg-primary hover:bg-primaryDark text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-soft hover:shadow-glow hover:-translate-y-0.5"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-bgMain to-bgMain overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-textPrimary tracking-tight mb-8 leading-[1.15]">
            Simple Follow-Up <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">for Everyone</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-textSecondary mb-10 leading-relaxed">
            From freelancers to enterprises. Manage your leads and schedule follow-ups effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primaryDark text-white rounded-full font-semibold text-lg shadow-glow transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Free for 30 Days <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 bg-bgMuted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">Plans for every stage</h2>
            <p className="text-lg text-textSecondary">Pay per user. Scale anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Single User Plan */}
            <div className="bg-bgCard rounded-lg p-8 border border-borderSoft shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col">
               <div className="mb-4 bg-bgMuted w-12 h-12 rounded-lg flex items-center justify-center text-primary">
                   <User className="h-6 w-6" />
               </div>
               <h3 className="text-xl font-bold text-textPrimary">Single User</h3>
               <p className="text-textSecondary text-sm mt-2">For freelancers & consultants</p>
               <div className="my-6 flex items-baseline gap-1">
                 <span className="text-4xl font-extrabold text-textPrimary tracking-tight">₹30</span>
                 <span className="text-textSecondary font-medium">/month</span>
               </div>
               <ul className="mb-8 space-y-4 flex-1">
                 <PricingCheck text="1 User Account" />
                 <PricingCheck text="Unlimited Leads" />
                 <PricingCheck text="Personal Dashboard" />
                 <PricingCheck text="Email Reminders" />
               </ul>
               <button onClick={onGetStarted} className="w-full py-3 border-2 border-primary text-primary font-bold rounded-md hover:bg-primary/5 transition-colors">Choose Single</button>
            </div>

            {/* Team Plan */}
            <div className="bg-bgCard rounded-lg p-8 border-2 border-primary shadow-glow relative scale-105 z-10 flex flex-col">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide uppercase">
                 Growing
               </div>
               <div className="mb-4 bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary">
                   <Users className="h-6 w-6" />
               </div>
               <h3 className="text-xl font-bold text-textPrimary">Team</h3>
               <p className="text-textSecondary text-sm mt-2">For small sales squads</p>
               <div className="my-6 flex items-baseline gap-1">
                 <span className="text-4xl font-extrabold text-textPrimary tracking-tight">₹50</span>
                 <span className="text-textSecondary font-medium">/user/mo</span>
               </div>
               <ul className="mb-8 space-y-4 flex-1">
                 <PricingCheck text="Team Admin Role" />
                 <PricingCheck text="Team Dashboard" />
                 <PricingCheck text="Shared Lead Lists" />
                 <PricingCheck text="Member Management" />
               </ul>
               <button onClick={onGetStarted} className="w-full py-3 bg-primary text-white font-bold rounded-md hover:bg-primaryDark transition-colors">Choose Team</button>
            </div>

             {/* Company Plan */}
             <div className="bg-bgCard rounded-lg p-8 border border-borderSoft shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col">
               <div className="mb-4 bg-bgMuted w-12 h-12 rounded-lg flex items-center justify-center text-primary">
                   <Building className="h-6 w-6" />
               </div>
               <h3 className="text-xl font-bold text-textPrimary">Company</h3>
               <p className="text-textSecondary text-sm mt-2">For organizations</p>
               <div className="my-6 flex items-baseline gap-1">
                 <span className="text-4xl font-extrabold text-textPrimary tracking-tight">₹100</span>
                 <span className="text-textSecondary font-medium">/user/mo</span>
               </div>
               <ul className="mb-8 space-y-4 flex-1">
                 <PricingCheck text="Company Admin Role" />
                 <PricingCheck text="Multi-Team Management" />
                 <PricingCheck text="Organization Overview" />
                 <PricingCheck text="Priority Support" />
               </ul>
               <button onClick={onGetStarted} className="w-full py-3 border-2 border-primary text-primary font-bold rounded-md hover:bg-primary/5 transition-colors">Choose Company</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-bgMain border-t border-borderSoft">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <span className="font-bold text-lg text-textPrimary">LeadTrack Pro</span>
          </div>
          <div className="text-textMuted text-sm">
             © {new Date().getFullYear()} Nepindo Technologies.
          </div>
        </div>
      </footer>
    </div>
  );
}

const PricingCheck = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3 text-sm text-textSecondary font-medium">
    <div className="bg-success/10 rounded-full p-1">
      <CheckCircle className="h-4 w-4 text-success" />
    </div>
    {text}
  </li>
);

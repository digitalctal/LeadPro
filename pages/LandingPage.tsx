import React, { useState } from 'react';
import { CheckCircle, ArrowRight, Bell, Calendar, Zap, ChevronDown, ChevronUp, Star, Menu, X, Check, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'quarterly' | 'yearly'>('yearly');

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
              <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-textSecondary hover:text-primary transition-colors">How it Works</button>
              <button onClick={() => scrollToSection('benefits')} className="text-sm font-medium text-textSecondary hover:text-primary transition-colors">Benefits</button>
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

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-textSecondary">
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-bgCard border-b border-borderSoft p-4 space-y-4 shadow-xl">
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left text-sm font-medium text-textSecondary py-2">How it Works</button>
            <button onClick={() => scrollToSection('benefits')} className="block w-full text-left text-sm font-medium text-textSecondary py-2">Benefits</button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-sm font-medium text-textSecondary py-2">Pricing</button>
            <hr className="border-borderSoft" />
            <button onClick={onLogin} className="block w-full text-left text-sm font-medium text-textPrimary py-2">Sign In</button>
            <button onClick={onGetStarted} className="block w-full bg-primary text-white px-5 py-3 rounded-md text-sm font-medium text-center">Start Free Trial</button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-bgMain to-bgMain overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-bgCard border border-borderSoft text-primary px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New: AI Email Drafting
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-textPrimary tracking-tight mb-8 leading-[1.15]">
            Never Miss a <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Follow-Up Again</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-textSecondary mb-10 leading-relaxed">
            Simple reminders that help you close more deals without complex CRMs. 
            Built for consultants, institutes, and freelancers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primaryDark text-white rounded-full font-semibold text-lg shadow-glow transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Free for 30 Days <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              onClick={() => scrollToSection('product-preview')}
              className="w-full sm:w-auto px-8 py-4 bg-bgCard hover:bg-bgMuted text-textPrimary border border-borderSoft rounded-full font-semibold text-lg transition-all shadow-sm flex items-center justify-center gap-2"
            >
              See How It Works
            </button>
          </div>
          <p className="mt-6 text-sm text-textMuted flex items-center justify-center gap-2">
             <ShieldCheck className="h-4 w-4" /> No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* --- TRUST / SOCIAL PROOF --- */}
      <section className="py-12 border-y border-borderSoft bg-bgMuted/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-8">Trusted by 500+ Consultants & Small Teams</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale transition-opacity hover:opacity-100 hover:grayscale-0 duration-500">
             <span className="text-xl font-bold text-textPrimary">AcmeCorp</span>
             <span className="text-xl font-bold text-textPrimary font-serif">GlobalConsult</span>
             <span className="text-xl font-bold text-textPrimary italic">NextLevel</span>
             <span className="text-xl font-bold text-textPrimary tracking-widest">STRATOS</span>
             <span className="text-xl font-bold text-textPrimary font-mono">dev_agency</span>
          </div>
        </div>
      </section>

      {/* --- PRODUCT PREVIEW (Mockup) --- */}
      <section id="product-preview" className="py-24 px-4 bg-bgMain">
        <div className="max-w-6xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">A dashboard focused on action</h2>
              <p className="text-lg text-textSecondary max-w-2xl mx-auto">
                  No clutter. No 500 features you don't use. Just your leads and your schedule.
              </p>
           </div>
           
           {/* Abstract Dashboard UI Mockup */}
           <div className="relative rounded-lg bg-textPrimary p-2 md:p-3 shadow-2xl ring-1 ring-textPrimary/10">
              <div className="absolute top-0 left-0 w-full h-full bg-primary/20 blur-[100px] -z-10"></div>
              <div className="bg-bgCard rounded-md overflow-hidden border border-borderSoft flex flex-col md:flex-row min-h-[500px]">
                  {/* Fake Sidebar */}
                  <div className="hidden md:flex w-64 bg-bgMuted border-r border-borderSoft flex-col p-6 gap-3">
                      <div className="h-8 w-8 bg-primary rounded-sm mb-8 opacity-20"></div>
                      <div className="h-10 w-full bg-primary/10 text-primary rounded-md flex items-center px-4 text-sm font-medium">Dashboard</div>
                      <div className="h-10 w-full text-textSecondary hover:bg-bgMain rounded-md flex items-center px-4 text-sm font-medium transition-colors">Leads</div>
                      <div className="h-10 w-full text-textSecondary hover:bg-bgMain rounded-md flex items-center px-4 text-sm font-medium transition-colors">Settings</div>
                  </div>
                  {/* Fake Content */}
                  <div className="flex-1 p-8 bg-bgCard">
                      <div className="flex justify-between items-center mb-10">
                          <div>
                              <div className="h-7 w-40 bg-bgMuted rounded-sm mb-2"></div>
                              <div className="h-4 w-60 bg-bgMuted/50 rounded-sm"></div>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-bgMuted"></div>
                      </div>
                      {/* Fake Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                          {[1,2,3].map(i => (
                              <div key={i} className="p-6 rounded-lg border border-borderSoft bg-bgMain shadow-sm">
                                  <div className="h-10 w-10 rounded-md bg-primary/10 mb-4"></div>
                                  <div className="h-5 w-24 bg-bgMuted rounded mb-2"></div>
                                  <div className="h-8 w-12 bg-textPrimary rounded"></div>
                              </div>
                          ))}
                      </div>
                      {/* Fake List */}
                      <div className="border border-borderSoft rounded-lg overflow-hidden">
                          <div className="bg-bgMuted/30 p-4 border-b border-borderSoft flex justify-between">
                              <div className="h-5 w-32 bg-bgMuted rounded"></div>
                          </div>
                          {[1,2,3].map(i => (
                              <div key={i} className="p-5 border-b border-borderSoft last:border-0 flex justify-between items-center hover:bg-bgMuted/20">
                                  <div className="flex items-center gap-4">
                                      <div className="h-10 w-10 rounded-full bg-bgMuted"></div>
                                      <div>
                                          <div className="h-4 w-40 bg-bgMuted rounded mb-1.5"></div>
                                          <div className="h-3 w-28 bg-bgMuted/50 rounded"></div>
                                      </div>
                                  </div>
                                  <div className="h-9 w-24 bg-bgMuted rounded-md"></div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 bg-bgMuted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">Three steps to organized sales</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
             {/* Connecting Line (Desktop) */}
             <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-borderSoft via-primary/20 to-borderSoft z-0"></div>

             {/* Step 1 */}
             <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="h-24 w-24 bg-bgCard rounded-lg shadow-soft border border-borderSoft flex items-center justify-center mb-8 group-hover:-translate-y-2 transition-transform duration-300">
                    <span className="text-4xl font-extrabold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold text-textPrimary mb-3">Add a Lead</h3>
                <p className="text-textSecondary leading-relaxed px-4">Input the basic details. Name, phone, email, and a quick note. That's it.</p>
             </div>

             {/* Step 2 */}
             <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="h-24 w-24 bg-bgCard rounded-lg shadow-soft border border-borderSoft flex items-center justify-center mb-8 group-hover:-translate-y-2 transition-transform duration-300">
                    <Calendar className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-textPrimary mb-3">Schedule Follow-Up</h3>
                <p className="text-textSecondary leading-relaxed px-4">Pick a date. We'll categorize it as 'Upcoming' or 'Overdue' automatically.</p>
             </div>

             {/* Step 3 */}
             <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="h-24 w-24 bg-bgCard rounded-lg shadow-soft border border-borderSoft flex items-center justify-center mb-8 group-hover:-translate-y-2 transition-transform duration-300">
                    <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-textPrimary mb-3">Get Reminded</h3>
                <p className="text-textSecondary leading-relaxed px-4">Receive an email notification. Click once to generate an AI email draft.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- BENEFITS --- */}
      <section id="benefits" className="py-24 bg-bgMain">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-textPrimary mb-8">Why small businesses switch to LeadTrack</h2>
              <div className="space-y-10">
                 <BenefitItem 
                   title="Never forget a conversation" 
                   desc="Memory fails. Systems don't. Keep every promise you made to a prospect." 
                 />
                 <BenefitItem 
                   title="Increase conversion rates" 
                   desc="Consistency wins deals. Most sales happen after the 5th follow-up." 
                 />
                 <BenefitItem 
                   title="No complex CRM headaches" 
                   desc="You don't need pipelines, stages, or kanban boards. Just a simple list." 
                 />
                 <BenefitItem 
                   title="Built for daily use" 
                   desc="Fast loading, mobile friendly, and designed for speed." 
                 />
              </div>
            </div>
            <div className="relative h-full min-h-[500px] bg-gradient-to-br from-primary to-primaryDark rounded-lg p-10 flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/30">
               <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
               <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-lg max-w-sm text-white shadow-xl">
                  <Star className="h-8 w-8 text-yellow-300 fill-yellow-300 mb-6" />
                  <p className="text-xl font-medium mb-6 leading-relaxed">"It used to take me hours to organize my sales week. Now it takes 5 minutes. Simple is better."</p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center font-bold">SJ</div>
                    <div>
                        <p className="font-bold">Sarah Jenkins</p>
                        <p className="text-white/70 text-sm">Freelance Consultant</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 bg-bgMuted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-textSecondary">Start with a 30-day free trial. No credit card required.</p>
          </div>

          {/* Toggle */}
          <div className="flex justify-center mb-16">
            <div className="bg-bgCard p-1.5 rounded-full border border-borderSoft inline-flex relative shadow-sm">
               <button 
                 onClick={() => setBillingCycle('quarterly')}
                 className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all ${billingCycle === 'quarterly' ? 'bg-textPrimary text-white shadow-md' : 'text-textSecondary hover:text-textPrimary'}`}
               >
                 Quarterly
               </button>
               <button 
                 onClick={() => setBillingCycle('yearly')}
                 className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all ${billingCycle === 'yearly' ? 'bg-textPrimary text-white shadow-md' : 'text-textSecondary hover:text-textPrimary'}`}
               >
                 Yearly
               </button>
               {billingCycle === 'yearly' && (
                  <span className="absolute -top-4 -right-8 bg-success text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    SAVE 20%
                  </span>
               )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Quarterly Plan */}
            <div className="bg-bgCard rounded-lg p-10 border border-borderSoft shadow-soft hover:shadow-lg transition-all duration-300">
               <h3 className="text-2xl font-bold text-textPrimary">Quarterly Starter</h3>
               <p className="text-textSecondary text-sm mt-2">Perfect for short-term projects</p>
               <div className="my-8 flex items-baseline gap-1">
                 <span className="text-5xl font-extrabold text-textPrimary tracking-tight">₹2,499</span>
                 <span className="text-textSecondary font-medium">/quarter</span>
               </div>
               <button onClick={onGetStarted} className="w-full py-4 border-2 border-primary text-primary font-bold rounded-md hover:bg-primary/5 transition-colors">Start Free Trial</button>
               <ul className="mt-10 space-y-5">
                 <PricingCheck text="Unlimited Leads" />
                 <PricingCheck text="Unlimited Follow-ups" />
                 <PricingCheck text="Email Reminders" />
                 <PricingCheck text="Basic AI Drafting" />
               </ul>
            </div>

            {/* Yearly Plan */}
            <div className="relative bg-bgCard rounded-lg p-10 border-2 border-primary shadow-glow scale-105 z-10">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide uppercase">
                 Most Popular
               </div>
               <h3 className="text-2xl font-bold text-textPrimary">Yearly Pro</h3>
               <p className="text-textSecondary text-sm mt-2">For serious growth</p>
               <div className="my-8 flex items-baseline gap-1">
                 <span className="text-5xl font-extrabold text-textPrimary tracking-tight">₹7,999</span>
                 <span className="text-textSecondary font-medium">/year</span>
               </div>
               <button onClick={onGetStarted} className="w-full py-4 bg-primary text-white font-bold rounded-md hover:bg-primaryDark transition-colors shadow-lg shadow-primary/20">Start Free Trial</button>
               <ul className="mt-10 space-y-5">
                 <PricingCheck text="Everything in Quarterly" />
                 <PricingCheck text="Advanced AI Templates" />
                 <PricingCheck text="Priority Email Support" />
                 <PricingCheck text="Team Management (Up to 3)" />
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 bg-bgMain">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-textPrimary text-center mb-16">Frequently Asked Questions</h2>
          <div className="space-y-4">
             <FaqItem 
                question="Is this a CRM?" 
                answer="Technically yes, but it's stripped down. It's a 'Light CRM' focused purely on follow-up reminders, not complex pipelines or reporting." 
             />
             <FaqItem 
                question="What happens after 30 days?" 
                answer="Your account will be paused. Your data is safe. You can choose to upgrade to a paid plan to continue adding new leads and receiving reminders." 
             />
             <FaqItem 
                question="Can I cancel anytime?" 
                answer="Yes. There are no contracts. You can cancel your subscription from the settings dashboard instantly." 
             />
             <FaqItem 
                question="Do you offer WhatsApp reminders?" 
                answer="Currently we support Email reminders. WhatsApp integration is on our roadmap for Q4." 
             />
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 bg-textPrimary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">Ready to close more deals?</h2>
          <p className="text-textMuted text-xl mb-12 max-w-2xl mx-auto">Join hundreds of consultants who have stopped letting leads slip through the cracks.</p>
          <button 
             onClick={onGetStarted}
             className="px-12 py-5 bg-primary hover:bg-primaryDark text-white rounded-full font-bold text-xl shadow-2xl shadow-primary/40 transition-transform hover:-translate-y-1"
          >
             Start Your Free 30-Day Trial
          </button>
          <p className="mt-8 text-sm text-textMuted opacity-60">Setup takes less than 2 minutes.</p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-bgMain border-t border-borderSoft">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div className="bg-primary p-2 rounded-sm">
                <Bell className="h-4 w-4 text-white" />
             </div>
             <span className="font-bold text-lg text-textPrimary">LeadTrack Pro</span>
          </div>
          <div className="text-textMuted text-sm">
             © {new Date().getFullYear()} Nepindo Technologies. All rights reserved.
          </div>
          <div className="flex space-x-8 mt-4 md:mt-0">
             <a href="#" className="text-textSecondary hover:text-primary transition-colors text-sm">Privacy</a>
             <a href="#" className="text-textSecondary hover:text-primary transition-colors text-sm">Terms</a>
             <a href="mailto:support@leadtrack.pro" className="text-textSecondary hover:text-primary transition-colors text-sm">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components
const BenefitItem = ({ title, desc }: { title: string, desc: string }) => (
  <div className="flex gap-5">
    <div className="flex-shrink-0 mt-1">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Check className="h-5 w-5 text-primary" />
      </div>
    </div>
    <div>
      <h3 className="font-bold text-xl text-textPrimary mb-2">{title}</h3>
      <p className="text-textSecondary leading-relaxed">{desc}</p>
    </div>
  </div>
);

const PricingCheck = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3 text-sm text-textSecondary font-medium">
    <div className="bg-success/10 rounded-full p-1">
      <CheckCircle className="h-4 w-4 text-success" />
    </div>
    {text}
  </li>
);

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-borderSoft rounded-md overflow-hidden bg-bgCard transition-all duration-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left hover:bg-bgMuted/50 transition-colors"
      >
        <span className="font-bold text-textPrimary text-lg">{question}</span>
        {isOpen ? <ChevronUp className="h-5 w-5 text-textMuted" /> : <ChevronDown className="h-5 w-5 text-textMuted" />}
      </button>
      {isOpen && (
        <div className="p-6 pt-0 text-textSecondary leading-relaxed">
           {answer}
        </div>
      )}
    </div>
  );
};
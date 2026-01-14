import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Login from './pages/Login';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { User } from './types';
import { db } from './services/mockDb';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  
  // New state to control Landing Page vs Login
  const [showLanding, setShowLanding] = useState(true);

  // State to handle deep linking to a specific lead
  const [targetLeadId, setTargetLeadId] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage for session
    const storedUser = localStorage.getItem('lt_user_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      setShowLanding(false); // If logged in, skip landing
    }

    // Apply saved theme
    const savedTheme = localStorage.getItem('lt_theme');
    if (savedTheme === 'morph') {
      document.body.classList.add('theme-morph');
    } else {
      document.body.classList.remove('theme-morph');
    }
  }, []);

  const handleLogin = (userData: User) => {
    localStorage.setItem('lt_user_session', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    setShowLanding(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('lt_user_session');
    setIsAuthenticated(false);
    setUser(null);
    setShowLanding(true); // Go back to landing on logout
  };

  const handleViewLead = (leadId: string) => {
    setTargetLeadId(leadId);
    setCurrentPage('leads');
  };

  // Callback to force refresh user data from DB/Local storage when Profile changes
  const refreshUser = useCallback(() => {
    const updated = db.getCurrentUser();
    if (updated) {
        setUser(updated);
    }
  }, []);

  // Force refresh of app to apply theme changes if triggered from settings
  const handleThemeChange = () => {
      // In a real app with context, we'd update context. 
      // Here, since we modify body class directly in Settings, 
      // we might just trigger a re-render or let CSS handle it.
      // The Settings component handles the body class toggle directly.
  };

  if (!isAuthenticated) {
    if (showLanding) {
      return (
        <LandingPage 
          onGetStarted={() => setShowLanding(false)} 
          onLogin={() => setShowLanding(false)} 
        />
      );
    }
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-bgMain overflow-hidden transition-colors duration-300">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} title={currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} />
        <main className="flex-1 overflow-auto p-6">
          {currentPage === 'dashboard' && (
            <Dashboard 
              onNavigate={setCurrentPage} 
              onViewLead={handleViewLead} 
            />
          )}
          {currentPage === 'leads' && (
            <Leads 
              initialLeadId={targetLeadId} 
              onClearInitialLead={() => setTargetLeadId(null)} 
            />
          )}
          {currentPage === 'settings' && user && (
            <Settings 
                currentUser={user} 
                onProfileUpdate={refreshUser} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
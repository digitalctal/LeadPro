import React, { useEffect, useState } from 'react';
import { Bell, Search, LogOut, User as UserIcon, Menu, Clock } from 'lucide-react';

interface HeaderProps {
  user: { name: string } | null;
  onLogout: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, title }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000); 
    return () => clearInterval(timer);
  }, []);

  // Format: "Mon, Oct 25 - 10:30 AM"
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const dateString = time.toLocaleDateString([], dateOptions);
  const timeString = time.toLocaleTimeString([], timeOptions);

  return (
    <header className="h-20 bg-bgCard border-b border-borderSoft flex items-center justify-between px-8 shadow-sm z-10">
      <div className="flex items-center">
        <button className="mr-4 md:hidden text-textSecondary hover:text-textPrimary">
            <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-5">
        
        {/* Current Time Display */}
        <div className="hidden lg:flex items-center text-textSecondary bg-bgMuted px-3 py-1.5 rounded-sm border border-borderSoft shadow-sm">
             <Clock className="h-4 w-4 mr-2 text-textMuted" />
             <span className="text-sm font-medium font-mono text-textPrimary">
                 {dateString} <span className="mx-1 text-textMuted">|</span> {timeString}
             </span>
        </div>

        <div className="hidden md:flex relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-textMuted" />
            </div>
            <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border border-borderSoft rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64 bg-bgMuted transition-all hover:bg-bgCard"
            />
        </div>

        <button className="p-2.5 text-textSecondary hover:text-primary rounded-full hover:bg-bgMuted relative transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2.5 h-2 w-2 bg-danger rounded-full ring-2 ring-bgCard"></span>
        </button>
        
        <div className="h-8 w-px bg-borderSoft mx-1"></div>
        
        <div className="flex items-center space-x-3 pl-2">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-sm font-semibold text-textPrimary">{user?.name}</span>
            <span className="text-xs text-textMuted font-medium">Administrator</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-bgMuted flex items-center justify-center text-primary ring-2 ring-bgCard shadow-sm">
            <UserIcon className="h-5 w-5" />
          </div>
          <button 
            onClick={onLogout}
            className="ml-2 p-2 text-textMuted hover:text-danger transition-colors rounded-full hover:bg-danger/10"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
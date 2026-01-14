import React from 'react';
import { LayoutDashboard, Users, Settings, PhoneOutgoing } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-72 bg-bgCard border-r border-borderSoft flex flex-col hidden md:flex shadow-soft z-10">
      <div className="h-20 flex items-center px-8 border-b border-borderSoft">
        <div className="flex items-center text-primary">
          <PhoneOutgoing className="h-8 w-8 mr-3" />
          <span className="font-bold text-2xl tracking-tight text-textPrimary">LeadTrack</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-md transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-white shadow-glow'
                  : 'text-textSecondary hover:bg-bgMuted hover:text-primary'
              }`}
            >
              <Icon className={`h-5 w-5 mr-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-textMuted group-hover:text-primary'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-6 border-t border-borderSoft">
        <div className="p-4 bg-bgMuted/50 rounded-md border border-borderSoft">
          <p className="text-sm font-bold text-textPrimary">Nepindo Technologies</p>
          <a href="https://www.skjha.com.np" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 block">
             www.skjha.com.np
          </a>
          <p className="text-[10px] text-textMuted mt-2">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
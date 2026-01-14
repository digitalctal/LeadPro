import React, { useState, useEffect } from 'react';
import { User, Key, Save, Bell, Shield, Users, Mail, MessageCircle, CheckCircle, AlertTriangle, Palette, Layout } from 'lucide-react';
import { User as UserType } from '../types';
import { db } from '../services/mockDb';

interface SettingsProps {
    currentUser: UserType;
    onProfileUpdate: () => void;
}

export default function Settings({ currentUser, onProfileUpdate }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'team' | 'integrations' | 'notifications'>('profile');
  
  // Profile State
  const [profile, setProfile] = useState({ name: currentUser.name, email: currentUser.email });
  
  // API State
  const [apiKey, setApiKey] = useState('');
  
  // Team State (Admin only)
  const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
  const [newMember, setNewMember] = useState({ name: '', email: '' });

  // Integrations State
  const [integrations, setIntegrations] = useState({
      email: false,
      whatsapp: false
  });

  // Notification State
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  // Theme State
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    // Load API Key
    const storedKey = localStorage.getItem('lt_api_key');
    if (storedKey) setApiKey(storedKey);

    // Load Integrations
    const storedInt = localStorage.getItem('lt_integrations');
    if (storedInt) setIntegrations(JSON.parse(storedInt));

    // Load Notifications
    if (Notification.permission === 'granted') {
        setNotifyEnabled(true);
    }

    // Load Theme
    const savedTheme = localStorage.getItem('lt_theme') || 'default';
    setCurrentTheme(savedTheme);

    // Load Team
    if (currentUser.role === 'admin') {
        refreshTeam();
    }
  }, [currentUser]);

  const refreshTeam = () => {
      setTeamMembers(db.getTeamMembers(currentUser.organization));
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateUser({ ...currentUser, name: profile.name, email: profile.email });
    onProfileUpdate(); // Trigger parent refresh
    alert('Profile updated successfully.');
  };

  const handleApiKeySave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lt_api_key', apiKey);
    alert('API Configuration saved.');
  };

  const handleAddMember = (e: React.FormEvent) => {
      e.preventDefault();
      try {
          db.addTeamMember(currentUser, newMember.name, newMember.email);
          setNewMember({ name: '', email: '' });
          refreshTeam();
          alert('Team member added!');
      } catch (err: any) {
          alert(err.message);
      }
  };

  const toggleIntegration = (key: 'email' | 'whatsapp') => {
      const newState = { ...integrations, [key]: !integrations[key] };
      setIntegrations(newState);
      localStorage.setItem('lt_integrations', JSON.stringify(newState));
  };

  const handleNotificationToggle = async () => {
      if (!notifyEnabled) {
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotifyEnabled(true);
                try {
                    new Notification("Notifications Enabled", { body: "LeadTrack Pro will now alert you." });
                } catch(e) {
                    alert("Notifications enabled! (Browser system alerts)");
                }
            } else {
                alert("Permission denied. Please enable notifications in your browser settings.");
            }
          } catch (e) {
              console.error(e);
              alert("Could not request permission.");
          }
      } else {
          setNotifyEnabled(false);
          alert("Notifications disabled in app settings.");
      }
  };

  const sendTestNotification = () => {
      if (Notification.permission === 'granted' && notifyEnabled) {
          try {
            new Notification("LeadTrack Pro Test", { body: "This is a test notification." });
          } catch (e) {
            alert("Test Notification Sent!");
          }
      } else {
          alert("Please enable notifications above first.");
      }
  };

  const changeTheme = (theme: string) => {
      setCurrentTheme(theme);
      localStorage.setItem('lt_theme', theme);
      if (theme === 'morph') {
          document.body.classList.add('theme-morph');
      } else {
          document.body.classList.remove('theme-morph');
      }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
            <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors flex items-center ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-bgMuted'}`}>
                <User className="h-5 w-5 mr-3" /> Profile
            </button>
            <button onClick={() => setActiveTab('appearance')} className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors flex items-center ${activeTab === 'appearance' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-bgMuted'}`}>
                <Palette className="h-5 w-5 mr-3" /> Appearance
            </button>
            {currentUser.role === 'admin' && (
                <button onClick={() => setActiveTab('team')} className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors flex items-center ${activeTab === 'team' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-bgMuted'}`}>
                    <Users className="h-5 w-5 mr-3" /> Team Management
                </button>
            )}
            <button onClick={() => setActiveTab('integrations')} className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors flex items-center ${activeTab === 'integrations' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-bgMuted'}`}>
                <Shield className="h-5 w-5 mr-3" /> Integrations
            </button>
            <button onClick={() => setActiveTab('notifications')} className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors flex items-center ${activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-bgMuted'}`}>
                <Bell className="h-5 w-5 mr-3" /> Notifications
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
                <div className="bg-bgCard rounded-md shadow-sm border border-borderSoft overflow-hidden">
                    <div className="p-6 border-b border-borderSoft">
                        <h2 className="text-lg font-bold text-textPrimary">Personal Information</h2>
                        <p className="text-sm text-textSecondary">Update your personal details and organization info.</p>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-textSecondary mb-1">Organization</label>
                                <input disabled type="text" value={currentUser.organization} className="block w-full border border-borderSoft bg-bgMuted rounded-md py-2 px-3 text-textMuted sm:text-sm cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textSecondary mb-1">Display Name</label>
                                <input required type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})}
                                    className="block w-full border border-borderSoft rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-primary outline-none sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textSecondary mb-1">Email Address</label>
                                <input required type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})}
                                    className="block w-full border border-borderSoft rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-primary outline-none sm:text-sm" />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primaryDark transition-colors">
                                    <Save className="h-4 w-4 mr-2" /> Save Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
                <div className="bg-bgCard rounded-md shadow-sm border border-borderSoft overflow-hidden">
                    <div className="p-6 border-b border-borderSoft">
                        <h2 className="text-lg font-bold text-textPrimary">Theme & Appearance</h2>
                        <p className="text-sm text-textSecondary">Customize the look and feel of your dashboard.</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Default Theme Option */}
                        <div 
                            onClick={() => changeTheme('default')}
                            className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${currentTheme === 'default' ? 'border-primary ring-2 ring-primary/20' : 'border-borderSoft hover:border-primary/50'}`}
                        >
                            <div className="h-32 bg-[#F9FAFB] relative p-4 flex flex-col gap-2">
                                <div className="h-2 w-full bg-[#10B981] rounded-full opacity-80"></div>
                                <div className="flex gap-2">
                                    <div className="w-1/4 h-20 bg-white border border-gray-200 rounded"></div>
                                    <div className="w-3/4 h-20 bg-white border border-gray-200 rounded p-2">
                                        <div className="h-2 w-1/2 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-bgCard border-t border-borderSoft flex justify-between items-center">
                                <span className="font-bold text-sm text-textPrimary">Emerald & Orange</span>
                                {currentTheme === 'default' && <CheckCircle className="h-5 w-5 text-primary" />}
                            </div>
                        </div>

                        {/* Morph Theme Option */}
                        <div 
                            onClick={() => changeTheme('morph')}
                            className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${currentTheme === 'morph' ? 'border-primary ring-2 ring-primary/20' : 'border-borderSoft hover:border-primary/50'}`}
                        >
                            <div className="h-32 bg-[#f0f5fa] relative p-4 flex flex-col gap-2 font-sans">
                                <div className="h-2 w-full bg-[#3788e6] rounded-full opacity-80"></div>
                                <div className="flex gap-2">
                                    <div className="w-1/4 h-20 bg-white shadow-sm rounded-lg"></div>
                                    <div className="w-3/4 h-20 bg-white shadow-sm rounded-lg p-2">
                                        <div className="h-2 w-1/2 bg-gray-300 rounded-full mb-2"></div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-bgCard border-t border-borderSoft flex justify-between items-center">
                                <span className="font-bold text-sm text-textPrimary">Morph Blue</span>
                                {currentTheme === 'morph' && <CheckCircle className="h-5 w-5 text-primary" />}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TEAM TAB */}
            {activeTab === 'team' && currentUser.role === 'admin' && (
                <div className="space-y-6">
                    <div className="bg-bgCard rounded-md shadow-sm border border-borderSoft overflow-hidden">
                        <div className="p-6 border-b border-borderSoft flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-textPrimary">Team Members</h2>
                                <p className="text-sm text-textSecondary">Manage who has access to your organization's data.</p>
                            </div>
                            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-bold">
                                {teamMembers.length} Active
                            </span>
                        </div>
                        <div className="divide-y divide-borderSoft">
                            {teamMembers.map(member => (
                                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-bgMuted/50">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-bgMuted flex items-center justify-center text-textSecondary font-bold mr-4">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-textPrimary">{member.name}</p>
                                            <p className="text-sm text-textSecondary">{member.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${member.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-bgMuted text-textSecondary'}`}>
                                        {member.role.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {/* Add Member Form */}
                        <div className="p-6 bg-bgMuted border-t border-borderSoft">
                            <h3 className="text-sm font-bold text-textPrimary mb-3">Add New Team Member</h3>
                            <form onSubmit={handleAddMember} className="flex gap-3">
                                <input required type="text" placeholder="Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})}
                                    className="flex-1 border border-borderSoft rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                <input required type="email" placeholder="Email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})}
                                    className="flex-1 border border-borderSoft rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                <button type="submit" className="px-4 py-2 bg-textPrimary text-white rounded-md text-sm font-medium hover:bg-black transition-colors">
                                    Add Member
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* INTEGRATIONS TAB */}
            {activeTab === 'integrations' && (
                <div className="space-y-6">
                    {/* Gemini API Key */}
                    <div className="bg-bgCard rounded-md shadow-sm border border-borderSoft overflow-hidden">
                        <div className="p-6 border-b border-borderSoft">
                            <h2 className="text-lg font-bold text-textPrimary">AI Configuration</h2>
                            <p className="text-sm text-textSecondary">Configure Gemini API for smart drafting.</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleApiKeySave} className="flex gap-4 items-end max-w-lg">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-textSecondary mb-1">Gemini API Key</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Key className="h-4 w-4 text-textMuted" />
                                        </div>
                                        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                                            className="block w-full pl-10 border border-borderSoft rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-primary outline-none sm:text-sm" placeholder="AIza..." />
                                    </div>
                                </div>
                                <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primaryDark transition-colors">
                                    Save
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Channel Integrations */}
                    <div className="bg-bgCard rounded-md shadow-sm border border-borderSoft overflow-hidden">
                        <div className="p-6 border-b border-borderSoft">
                            <h2 className="text-lg font-bold text-textPrimary">Channel Integrations</h2>
                            <p className="text-sm text-textSecondary">Connect external communication channels.</p>
                        </div>
                        <div className="divide-y divide-borderSoft">
                            {/* Email */}
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-md text-primary">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-textPrimary">Email Service (SMTP/Gmail)</h3>
                                        <p className="text-sm text-textSecondary">Send follow-ups directly from your email.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toggleIntegration('email')}
                                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${integrations.email ? 'bg-success' : 'bg-borderSoft'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${integrations.email ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* WhatsApp */}
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-success/10 rounded-md text-success">
                                        <MessageCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-textPrimary">WhatsApp Business</h3>
                                        <p className="text-sm text-textSecondary">Send templates and reminders via WhatsApp.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toggleIntegration('whatsapp')}
                                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${integrations.whatsapp ? 'bg-success' : 'bg-borderSoft'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${integrations.whatsapp ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
                <div className="bg-bgCard rounded-md shadow-sm border border-borderSoft overflow-hidden">
                    <div className="p-6 border-b border-borderSoft">
                        <h2 className="text-lg font-bold text-textPrimary">Notification Preferences</h2>
                        <p className="text-sm text-textSecondary">Manage how you get alerted for overdue tasks.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-bgMuted rounded-md">
                            <div className="flex items-center gap-3">
                                {notifyEnabled ? <CheckCircle className="text-success h-6 w-6" /> : <AlertTriangle className="text-warning h-6 w-6" />}
                                <div>
                                    <h3 className="font-bold text-textPrimary">Browser Notifications</h3>
                                    <p className="text-sm text-textSecondary">{notifyEnabled ? "Active. You will be alerted for tasks." : "Disabled. Click to enable system alerts."}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleNotificationToggle}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${notifyEnabled ? 'bg-danger/10 text-danger hover:bg-danger/20' : 'bg-primary text-white hover:bg-primaryDark'}`}
                            >
                                {notifyEnabled ? 'Disable' : 'Enable Permission'}
                            </button>
                        </div>
                        
                        {notifyEnabled && (
                            <div className="flex justify-end">
                                <button onClick={sendTestNotification} className="text-sm text-primary hover:underline">
                                    Send Test Notification
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
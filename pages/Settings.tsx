import React, { useState, useEffect } from 'react';
import { User, Key, Save, Bell, Shield, Users, Mail, MessageCircle, CheckCircle, AlertTriangle, Palette, CreditCard, Trash2, Edit2, BarChart3, X } from 'lucide-react';
import { User as UserType, UserRole, PlanTier } from '../types';
import { db } from '../services/mockDb';

interface SettingsProps {
    currentUser: UserType;
    onProfileUpdate: () => void;
    onViewReport: (userId: string) => void;
}

export default function Settings({ currentUser, onProfileUpdate, onViewReport }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'team' | 'integrations' | 'notifications' | 'billing'>('profile');
  
  // Profile State
  const [profile, setProfile] = useState({ name: currentUser.name, email: currentUser.email });
  
  // API State
  const [apiKey, setApiKey] = useState('');
  
  // Team State (Admin only)
  const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'member' as UserRole, teamId: '' });
  
  // Edit Member State
  const [editingMember, setEditingMember] = useState<UserType | null>(null);

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

    // Load Team if permitted
    if (currentUser.role === 'company_admin' || currentUser.role === 'team_admin') {
        refreshTeam();
    }
  }, [currentUser]);

  const refreshTeam = () => {
      setTeamMembers(db.getManagedUsers(currentUser));
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
          // If Company Admin adding a member, might need to specify team if not defaulting
          const teamId = newMember.teamId || (currentUser.role === 'team_admin' ? currentUser.teamId : undefined);
          
          db.addTeamMember(currentUser, newMember.name, newMember.email, newMember.role, teamId);
          setNewMember({ name: '', email: '', role: 'member', teamId: '' });
          refreshTeam();
          alert('User added successfully!');
      } catch (err: any) {
          alert(err.message);
      }
  };

  const handleEditMemberSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingMember) return;
      try {
          db.updateUser(editingMember);
          setEditingMember(null);
          refreshTeam();
          alert('User updated successfully!');
      } catch (err: any) {
          alert(err.message);
      }
  };

  const handleDeleteMember = (id: string) => {
      if(confirm('Are you sure you want to remove this user?')) {
          try {
              db.deleteUser(currentUser, id);
              refreshTeam();
          } catch (e: any) {
              alert(e.message);
          }
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
            } else {
                alert("Permission denied. Please enable notifications in your browser settings.");
            }
          } catch (e) {
              console.error(e);
          }
      } else {
          setNotifyEnabled(false);
          alert("Notifications disabled.");
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

  const handleUpgradePlan = (plan: PlanTier) => {
      // Mock upgrade
      if (confirm(`Switch plan to ${plan}? This will update billing.`)) {
          let role: UserRole = 'single_user';
          if (plan === 'company') role = 'company_admin';
          if (plan === 'team') role = 'team_admin';
          
          db.updatePlan(currentUser.id, plan, role);
          onProfileUpdate();
          alert(`Upgraded to ${plan} plan!`);
      }
  }

  // Calculate Billing
  const getBillingAmount = () => {
      if (currentUser.plan === 'single') return 30; // ₹30/mo
      // Team/Company: Base + user count
      const count = teamMembers.length + 1; // +1 for self
      const rate = currentUser.plan === 'company' ? 100 : 50; 
      return count * rate;
  }

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
            {currentUser.role !== 'single_user' && currentUser.role !== 'member' && (
                <button onClick={() => setActiveTab('team')} className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors flex items-center ${activeTab === 'team' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-bgMuted'}`}>
                    <Users className="h-5 w-5 mr-3" /> User Management
                </button>
            )}
            <button onClick={() => setActiveTab('billing')} className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors flex items-center ${activeTab === 'billing' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-bgMuted'}`}>
                <CreditCard className="h-5 w-5 mr-3" /> Billing & Plan
            </button>
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
                                <label className="block text-sm font-medium text-textSecondary mb-1">Organization / Account</label>
                                <input disabled type="text" value={currentUser.organization} className="block w-full border border-borderSoft bg-bgMuted rounded-md py-2 px-3 text-textMuted sm:text-sm cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textSecondary mb-1">Role</label>
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wide">
                                    {currentUser.role.replace('_', ' ')}
                                </div>
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
                        <div onClick={() => changeTheme('default')} className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${currentTheme === 'default' ? 'border-primary ring-2 ring-primary/20' : 'border-borderSoft hover:border-primary/50'}`}>
                            <div className="h-24 bg-[#F9FAFB] relative p-4"><div className="h-2 w-full bg-[#10B981] rounded-full opacity-80"></div></div>
                            <div className="p-3 bg-bgCard border-t border-borderSoft flex justify-between items-center">
                                <span className="font-bold text-sm text-textPrimary">Emerald & Orange</span>
                                {currentTheme === 'default' && <CheckCircle className="h-5 w-5 text-primary" />}
                            </div>
                        </div>
                        <div onClick={() => changeTheme('morph')} className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${currentTheme === 'morph' ? 'border-primary ring-2 ring-primary/20' : 'border-borderSoft hover:border-primary/50'}`}>
                            <div className="h-24 bg-[#f0f5fa] relative p-4"><div className="h-2 w-full bg-[#3788e6] rounded-full opacity-80"></div></div>
                            <div className="p-3 bg-bgCard border-t border-borderSoft flex justify-between items-center">
                                <span className="font-bold text-sm text-textPrimary">Morph Blue</span>
                                {currentTheme === 'morph' && <CheckCircle className="h-5 w-5 text-primary" />}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BILLING TAB */}
            {activeTab === 'billing' && (
                <div className="space-y-6">
                    <div className="bg-bgCard rounded-md shadow-sm border border-borderSoft overflow-hidden">
                        <div className="p-6 border-b border-borderSoft flex justify-between">
                             <div>
                                <h2 className="text-lg font-bold text-textPrimary">Subscription Plan</h2>
                                <p className="text-sm text-textSecondary">Current plan: <span className="capitalize font-bold text-primary">{currentUser.plan}</span></p>
                             </div>
                             <div className="text-right">
                                 <p className="text-2xl font-bold text-textPrimary">₹{getBillingAmount()}</p>
                                 <p className="text-xs text-textSecondary">per month</p>
                             </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-sm font-bold text-textPrimary mb-4">Available Plans</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className={`border p-4 rounded-lg flex flex-col justify-between ${currentUser.plan === 'single' ? 'border-primary bg-primary/5' : 'border-borderSoft'}`}>
                                    <div>
                                        <h4 className="font-bold">Single User</h4>
                                        <p className="text-sm text-textSecondary mt-1">₹30 / month</p>
                                        <p className="text-xs text-textMuted mt-2">Perfect for freelancers.</p>
                                    </div>
                                    <button 
                                        onClick={() => handleUpgradePlan('single')}
                                        disabled={currentUser.plan === 'single'} 
                                        className="mt-4 w-full py-2 text-xs font-bold border border-primary text-primary rounded hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primary"
                                    >
                                        {currentUser.plan === 'single' ? 'Current Plan' : 'Switch'}
                                    </button>
                                </div>
                                <div className={`border p-4 rounded-lg flex flex-col justify-between ${currentUser.plan === 'team' ? 'border-primary bg-primary/5' : 'border-borderSoft'}`}>
                                    <div>
                                        <h4 className="font-bold">Team</h4>
                                        <p className="text-sm text-textSecondary mt-1">₹50 / user / mo</p>
                                        <p className="text-xs text-textMuted mt-2">For small sales teams.</p>
                                    </div>
                                    <button 
                                        onClick={() => handleUpgradePlan('team')}
                                        disabled={currentUser.plan === 'team'} 
                                        className="mt-4 w-full py-2 text-xs font-bold border border-primary text-primary rounded hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primary"
                                    >
                                        {currentUser.plan === 'team' ? 'Current Plan' : 'Upgrade'}
                                    </button>
                                </div>
                                <div className={`border p-4 rounded-lg flex flex-col justify-between ${currentUser.plan === 'company' ? 'border-primary bg-primary/5' : 'border-borderSoft'}`}>
                                    <div>
                                        <h4 className="font-bold">Company</h4>
                                        <p className="text-sm text-textSecondary mt-1">₹100 / user / mo</p>
                                        <p className="text-xs text-textMuted mt-2">Enterprise administration.</p>
                                    </div>
                                    <button 
                                        onClick={() => handleUpgradePlan('company')}
                                        disabled={currentUser.plan === 'company'} 
                                        className="mt-4 w-full py-2 text-xs font-bold border border-primary text-primary rounded hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primary"
                                    >
                                        {currentUser.plan === 'company' ? 'Current Plan' : 'Upgrade'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TEAM TAB (Restricted) */}
            {activeTab === 'team' && (currentUser.role === 'company_admin' || currentUser.role === 'team_admin') && (
                <div className="space-y-6">
                    <div className="bg-bgCard rounded-md shadow-sm border border-borderSoft overflow-hidden">
                        <div className="p-6 border-b border-borderSoft flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-textPrimary">
                                    {currentUser.role === 'company_admin' ? 'Organization Members' : 'Team Members'}
                                </h2>
                                <p className="text-sm text-textSecondary">
                                    {currentUser.role === 'company_admin' ? 'Manage everyone in the company.' : 'Manage members of your team.'}
                                </p>
                            </div>
                            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-bold">
                                {teamMembers.length} Managed Users
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
                                            <p className="text-xs text-textMuted">{member.teamId ? `Team: ${member.teamId}` : 'No Team'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium bg-bgMuted text-textSecondary mr-2`}>
                                            {member.role}
                                        </span>
                                        <button 
                                            onClick={() => onViewReport(member.id)} 
                                            className="text-textSecondary hover:text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors"
                                            title="View Work Report"
                                        >
                                            <BarChart3 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => setEditingMember(member)} 
                                            className="text-textSecondary hover:text-accent hover:bg-accent/10 p-1.5 rounded-full transition-colors"
                                            title="Edit User"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDeleteMember(member.id)} className="text-danger hover:bg-danger/10 p-1.5 rounded-full transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Add Member Form */}
                        <div className="p-6 bg-bgMuted border-t border-borderSoft">
                            <h3 className="text-sm font-bold text-textPrimary mb-3">Add New Member</h3>
                            <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input required type="text" placeholder="Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})}
                                    className="border border-borderSoft rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                <input required type="email" placeholder="Email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})}
                                    className="border border-borderSoft rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                
                                {currentUser.role === 'company_admin' ? (
                                    <select 
                                        className="border border-borderSoft rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value as UserRole})}
                                    >
                                        <option value="member">Member</option>
                                        <option value="team_admin">Team Admin</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center px-3 text-sm text-textSecondary bg-white border border-borderSoft rounded-md">Role: Member</div>
                                )}

                                <button type="submit" className="px-4 py-2 bg-textPrimary text-white rounded-md text-sm font-medium hover:bg-black transition-colors">
                                    Add
                                </button>
                            </form>
                            {currentUser.role === 'company_admin' && (
                                <div className="mt-2">
                                    <input type="text" placeholder="Assign to Team (Optional ID)" value={newMember.teamId} onChange={e => setNewMember({...newMember, teamId: e.target.value})}
                                    className="w-full border border-borderSoft rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* INTEGRATIONS TAB */}
            {activeTab === 'integrations' && (
                <div className="space-y-6">
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
                                    <p className="text-sm text-textSecondary">{notifyEnabled ? "Active." : "Disabled."}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleNotificationToggle}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${notifyEnabled ? 'bg-danger/10 text-danger hover:bg-danger/20' : 'bg-primary text-white hover:bg-primaryDark'}`}
                            >
                                {notifyEnabled ? 'Disable' : 'Enable Permission'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* EDIT MEMBER MODAL */}
        {editingMember && (
            <div className="fixed inset-0 bg-textPrimary/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-bgCard rounded-md max-w-md w-full p-8 shadow-2xl border border-borderSoft">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-textPrimary">Edit Team Member</h3>
                        <button onClick={() => setEditingMember(null)} className="text-textMuted hover:text-textPrimary">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <form onSubmit={handleEditMemberSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-textSecondary mb-1">Name</label>
                            <input required type="text" value={editingMember.name} onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                                className="block w-full border border-borderSoft rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textSecondary mb-1">Email</label>
                            <input required type="email" value={editingMember.email} onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                                className="block w-full border border-borderSoft rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        
                        {currentUser.role === 'company_admin' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-textSecondary mb-1">Role</label>
                                    <select 
                                        className="block w-full border border-borderSoft rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        value={editingMember.role} onChange={e => setEditingMember({...editingMember, role: e.target.value as UserRole})}
                                    >
                                        <option value="member">Member</option>
                                        <option value="team_admin">Team Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-textSecondary mb-1">Team ID</label>
                                    <input type="text" value={editingMember.teamId || ''} onChange={(e) => setEditingMember({...editingMember, teamId: e.target.value})}
                                        className="block w-full border border-borderSoft rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                            </>
                        )}
                        
                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2 border border-borderSoft rounded-md text-sm font-medium hover:bg-bgMuted">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primaryDark">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
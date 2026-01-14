import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDb';
import { FollowUpWithLead, DashboardStats } from '../types';
import { CheckCircle, Clock, Calendar, Mail, Phone, Users, Sparkles, X, Edit, MoreVertical, ExternalLink, Filter, Building, Briefcase } from 'lucide-react';
import { generateFollowUpEmail } from '../services/geminiService';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onViewLead?: (leadId: string) => void;
}

type FilterType = 'all' | 'today' | 'overdue' | 'completed';

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onViewLead }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allTasks, setAllTasks] = useState<FollowUpWithLead[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<FollowUpWithLead[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  const [draftModal, setDraftModal] = useState<{ isOpen: boolean, content: string, leadName: string } | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [activeFilter, allTasks]);

  const loadData = () => {
    setStats(db.getDashboardStats());
    const all = db.getFollowUps(); 
    const sorted = all.sort((a, b) => {
        if (a.status !== b.status) {
            if (a.status === 'pending') return -1;
            if (b.status === 'pending') return 1;
        }
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });
    setAllTasks(sorted);
  };

  const applyFilter = () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 86400000;

    let result = [];

    switch (activeFilter) {
        case 'today':
            result = allTasks.filter(f => 
                f.status === 'pending' && 
                new Date(f.scheduledAt).getTime() >= startOfToday && 
                new Date(f.scheduledAt).getTime() < endOfToday
            );
            break;
        case 'overdue':
            result = allTasks.filter(f => 
                f.status === 'pending' && 
                new Date(f.scheduledAt).getTime() < startOfToday
            );
            break;
        case 'completed':
            result = allTasks.filter(f => 
                f.status === 'completed' &&
                new Date(f.scheduledAt).getTime() >= startOfToday && 
                new Date(f.scheduledAt).getTime() < endOfToday
            );
            break;
        case 'all':
        default:
            result = allTasks.filter(f => f.status === 'pending');
            break;
    }
    setFilteredTasks(result);
  };

  const handleComplete = (id: string) => {
    db.updateFollowUpStatus(id, 'completed');
    loadData();
  };

  const handleAIDraft = async (leadName: string, notes: string, type: string) => {
    setIsLoadingAI(true);
    const content = await generateFollowUpEmail(leadName, notes, type);
    setDraftModal({ isOpen: true, content, leadName });
    setIsLoadingAI(false);
  };

  const getListTitle = () => {
      switch(activeFilter) {
          case 'today': return "Tasks for Today";
          case 'overdue': return "Overdue Follow-ups";
          case 'completed': return "Completed Today";
          default: return "Priority Action Items";
      }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Scope Header */}
      {stats && (
          <div className="flex items-center gap-2 mb-2">
             {stats.scope === 'Company' ? <Building className="h-5 w-5 text-primary" /> : 
              stats.scope === 'Team' ? <Users className="h-5 w-5 text-primary" /> : 
              <Briefcase className="h-5 w-5 text-primary" />}
             <h2 className="text-xl font-bold text-textPrimary">
                 {stats.scope} Dashboard
             </h2>
             <span className="text-sm text-textSecondary border-l border-borderSoft pl-2 ml-2">
                 {stats.scope === 'Company' ? 'Overview of all teams' : stats.scope === 'Team' ? 'Team performance' : 'My Tasks'}
             </span>
          </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => onNavigate('leads')} className="cursor-pointer transform transition-transform hover:scale-[1.02]">
            <StatCard 
                title="Total Leads" 
                value={stats?.totalLeads || 0} 
                icon={Users} 
                color="text-primary" 
                bg="bg-primary/10" 
            />
        </div>
        <div onClick={() => setActiveFilter('today')} className="cursor-pointer transform transition-transform hover:scale-[1.02]">
            <StatCard 
                title="Today's Tasks" 
                value={stats?.todayPending || 0} 
                icon={Calendar} 
                color="text-success" 
                bg="bg-success/10" 
                isActive={activeFilter === 'today'}
            />
        </div>
        <div onClick={() => setActiveFilter('overdue')} className="cursor-pointer transform transition-transform hover:scale-[1.02]">
            <StatCard 
                title="Overdue" 
                value={stats?.overdue || 0} 
                icon={Clock} 
                color="text-danger" 
                bg="bg-danger/10" 
                isActive={activeFilter === 'overdue'}
            />
        </div>
        <div onClick={() => setActiveFilter('completed')} className="cursor-pointer transform transition-transform hover:scale-[1.02]">
            <StatCard 
                title="Completed Today" 
                value={stats?.completedToday || 0} 
                icon={CheckCircle} 
                color="text-accent" 
                bg="bg-accent/10" 
                isActive={activeFilter === 'completed'}
            />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-bgCard rounded-md shadow-sm border border-borderSoft overflow-hidden min-h-[400px]">
        <div className="px-8 py-6 border-b border-borderSoft flex justify-between items-center bg-bgMuted/30">
          <div>
            <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2">
                {getListTitle()}
                {activeFilter !== 'all' && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setActiveFilter('all'); }}
                        className="ml-2 text-xs font-medium text-primary hover:text-primaryDark bg-primary/10 px-2.5 py-1 rounded-full border border-primary/10 flex items-center transition-colors"
                    >
                        Clear Filter <X className="h-3 w-3 ml-1" />
                    </button>
                )}
            </h2>
            <p className="text-sm text-textMuted mt-1">
                {activeFilter === 'all' ? 'Manage your upcoming follow-ups' : `Showing ${activeFilter} items`}
            </p>
          </div>
          <button 
            onClick={() => onNavigate('leads')} 
            className="px-4 py-2 bg-bgCard border border-borderSoft rounded-md text-sm font-medium text-textSecondary hover:bg-bgMuted shadow-sm transition-all"
          >
            View All Leads
          </button>
        </div>
        <div className="divide-y divide-borderSoft">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-bgMuted rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                {activeFilter === 'completed' ? <CheckCircle className="h-8 w-8 text-textMuted" /> : <Filter className="h-8 w-8 text-textMuted" />}
              </div>
              <h3 className="text-lg font-medium text-textPrimary">No items found</h3>
              <p className="text-textMuted mt-1">
                  {activeFilter === 'completed' 
                    ? "You haven't completed any tasks today yet." 
                    : activeFilter === 'today'
                    ? "No tasks scheduled for today."
                    : activeFilter === 'overdue'
                    ? "Great job! No overdue items."
                    : "No pending follow-ups."}
              </p>
              {activeFilter !== 'all' && (
                  <button onClick={() => setActiveFilter('all')} className="mt-4 text-primary hover:underline text-sm font-medium">
                      View all pending tasks
                  </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue = task.status === 'pending' && new Date(task.scheduledAt).getTime() < new Date().setHours(0,0,0,0);
              const isCompleted = task.status === 'completed';
              
              return (
                <div key={task.id} className={`p-6 hover:bg-bgMuted/30 transition-colors group ${isCompleted ? 'opacity-60 bg-bgMuted/20' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-5">
                      <div className={`flex-shrink-0 p-3 rounded-md ${
                          isCompleted ? 'bg-success/20 text-success' :
                          isOverdue ? 'bg-danger/10 text-danger' : 
                          'bg-primary/10 text-primary'
                      }`}>
                        {task.type === 'email' ? <Mail className="h-6 w-6" /> : task.type === 'call' ? <Phone className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform cursor-pointer" 
                             onClick={() => onViewLead && onViewLead(task.leadId)}>
                            <h3 className={`text-base font-bold transition-colors flex items-center gap-1 ${isCompleted ? 'text-textSecondary line-through' : 'text-textPrimary hover:text-primary'}`}>
                                {task.lead.name}
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-textMuted" />
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                isCompleted ? 'bg-bgMuted text-textMuted' :
                                isOverdue ? 'bg-danger/10 text-danger' : 
                                'bg-success/10 text-success'
                            }`}>
                                {isCompleted ? 'Done' : isOverdue ? 'Overdue' : 'Scheduled'}
                            </span>
                        </div>
                        <p className="text-sm text-textSecondary flex items-center mt-1.5">
                           <Clock className="h-3.5 w-3.5 mr-1.5 text-textMuted" />
                           {new Date(task.scheduledAt).toLocaleDateString()} at {new Date(task.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-sm text-textSecondary mt-2 bg-bgMuted/50 p-2 rounded-md border border-borderSoft inline-block">
                            "{task.notes}"
                        </p>
                      </div>
                    </div>
                    
                    {!isCompleted && (
                        <div className="flex items-center space-x-3 self-end sm:self-center">
                        {task.type === 'email' && (
                            <button 
                            onClick={() => handleAIDraft(task.lead.name, task.lead.notes, 'email')}
                            className="inline-flex items-center px-4 py-2 border border-accent/20 shadow-sm text-sm font-medium rounded-md text-accent bg-white hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                            >
                            <Sparkles className="h-4 w-4 mr-2" />
                            {isLoadingAI ? 'Thinking...' : 'AI Draft'}
                            </button>
                        )}
                        <button 
                            onClick={() => handleComplete(task.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-success hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success transition-colors"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Done
                        </button>
                        </div>
                    )}
                    {isCompleted && (
                        <div className="text-sm text-success font-medium flex items-center self-end sm:self-center bg-success/10 px-3 py-1 rounded-full">
                            <CheckCircle className="h-4 w-4 mr-2" /> Completed
                        </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* AI Draft Modal */}
      {draftModal && (
        <div className="fixed inset-0 bg-textPrimary/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-bgCard rounded-md max-w-lg w-full p-8 shadow-2xl transform transition-all border border-borderSoft">
             <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                   <div className="p-2 bg-accent/10 rounded-md text-accent">
                       <Sparkles className="h-5 w-5" />
                   </div>
                   <h3 className="text-xl font-bold text-textPrimary">AI Draft</h3>
               </div>
               <button onClick={() => setDraftModal(null)} className="text-textMuted hover:text-textPrimary transition-colors p-1 hover:bg-bgMuted rounded-full">
                 <X className="h-6 w-6" />
               </button>
             </div>
             <p className="text-sm text-textSecondary mb-4">Generated draft for <strong>{draftModal.leadName}</strong> based on your notes.</p>
             <div className="relative">
                <textarea 
                className="w-full h-48 p-4 bg-bgMuted/30 text-textPrimary border border-borderSoft rounded-md focus:ring-2 focus:ring-accent focus:border-transparent font-mono text-sm resize-none"
                value={draftModal.content}
                readOnly
                />
             </div>
             <div className="mt-6 flex justify-end space-x-3">
               <button 
                 onClick={() => setDraftModal(null)}
                 className="px-5 py-2.5 border border-borderSoft rounded-md text-textPrimary font-medium hover:bg-bgMuted transition-colors"
               >
                 Close
               </button>
               <button 
                  onClick={() => {
                    navigator.clipboard.writeText(draftModal.content);
                    alert('Copied to clipboard!');
                    setDraftModal(null);
                  }}
                  className="px-5 py-2.5 bg-primary text-white rounded-md hover:bg-primaryDark font-medium shadow-lg shadow-primary/20 transition-all active:scale-95"
               >
                 Copy to Clipboard
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{title: string, value: number, icon: any, color: string, bg: string, isActive?: boolean}> = ({ title, value, icon: Icon, color, bg, isActive }) => (
  <div className={`bg-bgCard overflow-hidden shadow-soft transition-all duration-200 rounded-md border ${isActive ? 'ring-2 ring-primary border-transparent shadow-lg' : 'border-borderSoft hover:shadow-lg'}`}>
    <div className="p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-sm p-4 ${bg} ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-textSecondary truncate">{title}</dt>
            <dd className="text-2xl font-bold text-textPrimary mt-1">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;
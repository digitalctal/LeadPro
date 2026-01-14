import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDb';
import { Lead, FollowUpWithLead, FollowUp } from '../types';
import { Plus, Search, Mail, Phone, Calendar, UserPlus, X, ChevronRight, ArrowLeft, Save, Clock, CheckCircle, Briefcase, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';

interface LeadsProps {
  initialLeadId?: string | null;
  onClearInitialLead?: () => void;
}

export default function Leads({ initialLeadId, onClearInitialLead }: LeadsProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // View State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Data for Schedule Modal
  const [scheduleTargetId, setScheduleTargetId] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState({ date: '', time: '', type: 'call' as any, notes: '' });
  
  // Data for Add Lead Modal
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', notes: '' });

  // Detail View State
  const [detailForm, setDetailForm] = useState<Lead | null>(null);
  const [leadFollowUps, setLeadFollowUps] = useState<FollowUpWithLead[]>([]);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  
  // Update FollowUp State
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

  useEffect(() => {
    refreshLeads();
  }, []);

  // Handle Deep Linking
  useEffect(() => {
    if (initialLeadId && leads.length > 0) {
      const target = leads.find(l => l.id === initialLeadId);
      if (target) {
        setSelectedLead(target);
        if (onClearInitialLead) onClearInitialLead();
      }
    }
  }, [initialLeadId, leads, onClearInitialLead]);

  useEffect(() => {
    if (selectedLead) {
      setDetailForm({ ...selectedLead });
      refreshFollowUps(selectedLead.id);
    }
  }, [selectedLead]);

  const refreshLeads = () => {
    const allLeads = db.getLeads();
    setLeads(allLeads);
    
    // Refresh detail view if open
    if (selectedLead) {
      const updated = allLeads.find(l => l.id === selectedLead.id);
      if (updated) setSelectedLead(updated);
    }
  };

  const refreshFollowUps = (leadId: string) => {
    const all = db.getFollowUps();
    const relevant = all.filter(f => f.leadId === leadId).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    setLeadFollowUps(relevant);
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    db.addLead({ ...newLead, status: 'new' });
    setIsAddModalOpen(false);
    setNewLead({ name: '', email: '', phone: '', notes: '' });
    refreshLeads();
  };

  const handleUpdateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailForm) return;
    db.updateLead(detailForm);
    refreshLeads();
    alert('Client details updated successfully.');
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTargetId) return;
    
    const scheduledAt = new Date(`${scheduleData.date}T${scheduleData.time}`).toISOString();
    db.addFollowUp({
        leadId: scheduleTargetId,
        scheduledAt,
        type: scheduleData.type,
        notes: scheduleData.notes
    });
    
    setIsScheduleModalOpen(false);
    setScheduleData({ date: '', time: '', type: 'call', notes: '' });
    
    // Refresh
    refreshLeads();
    if (selectedLead && selectedLead.id === scheduleTargetId) {
        refreshFollowUps(selectedLead.id);
    }
    
    alert('Follow-up scheduled!');
  };

  const handleUpdateFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFollowUp) return;
    db.updateFollowUp(editingFollowUp);
    setEditingFollowUp(null);
    if (selectedLead) {
        refreshFollowUps(selectedLead.id);
    }
    refreshLeads(); // To update dashboard counts if needed
  };

  const openScheduleModal = (leadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); 
    setScheduleTargetId(leadId);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setScheduleData({
        date: dateStr,
        time: '10:00',
        type: 'call',
        notes: 'Follow up check-in'
    });
    setIsScheduleModalOpen(true);
  };

  const openEditFollowUpModal = (followUp: FollowUp) => {
      setEditingFollowUp({ ...followUp });
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsMobileDetailsOpen(false); // Default to closed on mobile to show timeline
  };

  const handleBackToList = () => {
    setSelectedLead(null);
    setDetailForm(null);
    if (onClearInitialLead) onClearInitialLead(); // Ensure state is cleared on back navigation too
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- DETAIL VIEW RENDER ---
  if (selectedLead && detailForm) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header / Nav */}
        <div className="flex items-center space-x-4">
          <button onClick={handleBackToList} className="p-2 rounded-full hover:bg-bgMuted transition-colors">
            <ArrowLeft className="h-6 w-6 text-textSecondary" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-textPrimary">{detailForm.name}</h1>
            <p className="text-sm text-textSecondary">Created on {new Date(detailForm.createdAt).toLocaleDateString()}</p>
          </div>
          <button 
             onClick={(e) => openScheduleModal(selectedLead.id, e)}
             className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md shadow-md hover:bg-primaryDark transition-colors font-medium"
          >
             <Calendar className="h-4 w-4 mr-2" />
             <span className="hidden sm:inline">Schedule New</span>
             <span className="sm:hidden">New</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: CLIENT DETAILS */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-bgCard rounded-md shadow-sm border border-borderSoft overflow-hidden">
                {/* Mobile Toggle Header */}
                <button 
                    onClick={() => setIsMobileDetailsOpen(!isMobileDetailsOpen)}
                    className="w-full flex justify-between items-center p-6 bg-bgCard lg:cursor-default"
                >
                    <h2 className="text-lg font-bold text-textPrimary flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-textMuted" />
                        Client Details
                    </h2>
                    <div className="lg:hidden text-textMuted">
                        {isMobileDetailsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                </button>
                
                {/* Form Content (Collapsible on Mobile) */}
                <div className={`${isMobileDetailsOpen ? 'block' : 'hidden'} lg:block px-6 pb-6 pt-0 border-t lg:border-t-0 border-borderSoft`}>
                    <form onSubmit={handleUpdateLead} className="space-y-4 pt-4 lg:pt-0">
                    <div>
                        <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">Full Name</label>
                        <input type="text" className="block w-full border border-borderSoft rounded-md py-2 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary outline-none text-sm"
                        value={detailForm.name} onChange={e => setDetailForm({...detailForm, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">Email</label>
                        <input type="email" className="block w-full border border-borderSoft rounded-md py-2 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary outline-none text-sm"
                        value={detailForm.email} onChange={e => setDetailForm({...detailForm, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">Phone</label>
                        <input type="text" className="block w-full border border-borderSoft rounded-md py-2 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary outline-none text-sm"
                        value={detailForm.phone} onChange={e => setDetailForm({...detailForm, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">Status</label>
                        <select className="block w-full border border-borderSoft rounded-md py-2 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary outline-none text-sm"
                        value={detailForm.status} onChange={e => setDetailForm({...detailForm, status: e.target.value as any})}>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">Notes</label>
                        <textarea className="block w-full border border-borderSoft rounded-md py-2 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary outline-none text-sm" rows={5}
                        value={detailForm.notes} onChange={e => setDetailForm({...detailForm, notes: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-textPrimary hover:bg-black focus:outline-none">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </button>
                    </form>
                </div>
             </div>
          </div>

          {/* RIGHT COLUMN: TIMELINE & SCHEDULE */}
          <div className="lg:col-span-2 space-y-6">
             {/* Communication History & Schedule Card */}
             <div className="bg-bgCard rounded-md shadow-sm border border-borderSoft p-6 min-h-[500px]">
                <h2 className="text-lg font-bold text-textPrimary mb-6 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-textMuted" />
                    Communication & Schedule
                </h2>
                
                <div className="relative border-l-2 border-borderSoft ml-3 space-y-8">
                  {leadFollowUps.length === 0 && (
                      <div className="ml-8 text-textMuted italic">No communication history or scheduled events.</div>
                  )}

                  {leadFollowUps.map((item, idx) => {
                      const isPast = new Date(item.scheduledAt).getTime() < new Date().getTime();
                      const dateObj = new Date(item.scheduledAt);
                      const isCompleted = item.status === 'completed';
                      
                      return (
                          <div key={item.id} className="relative ml-8 group">
                              {/* Timeline Dot */}
                              <span className={`absolute -left-[41px] top-1 h-5 w-5 rounded-full border-2 bg-white flex items-center justify-center
                                  ${isCompleted ? 'border-success text-success' : isPast ? 'border-danger text-danger' : 'border-primary text-primary'}
                              `}>
                                  <div className={`h-2 w-2 rounded-full ${isCompleted ? 'bg-success' : isPast ? 'bg-danger' : 'bg-primary'}`}></div>
                              </span>

                              <div 
                                onClick={() => openEditFollowUpModal(item)}
                                className={`p-4 rounded-md border transition-all cursor-pointer hover:shadow-md 
                                    ${isCompleted ? 'bg-bgCard border-borderSoft' : isPast ? 'bg-danger/5 border-danger/10' : 'bg-primary/5 border-primary/10'}
                                `}
                              >
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <div className="flex items-center gap-2">
                                              <p className={`text-sm font-bold ${isCompleted ? 'text-textPrimary' : isPast ? 'text-danger' : 'text-primary'}`}>
                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)} 
                                              </p>
                                              {isCompleted && <CheckCircle className="h-4 w-4 text-success" />}
                                          </div>
                                          <p className="text-xs text-textSecondary font-medium mt-1">
                                              {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                          </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          {!isCompleted && !isPast && (
                                              <span className="bg-primary/20 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Upcoming</span>
                                          )}
                                          {!isCompleted && isPast && (
                                              <span className="bg-danger/20 text-danger text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Overdue</span>
                                          )}
                                          <Edit2 className="h-4 w-4 text-textMuted group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                      </div>
                                  </div>
                                  <p className="text-sm text-textSecondary mt-3 border-t border-borderSoft pt-2">
                                      {item.notes}
                                  </p>
                              </div>
                          </div>
                      );
                  })}
                </div>
             </div>
          </div>
        </div>
        
        {/* Modals reused */}
        {renderScheduleModal()}
        {renderEditFollowUpModal()}
      </div>
    );
  }

  // --- LIST VIEW RENDER ---
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Actions */}
      <div className="bg-bgCard p-4 rounded-md shadow-sm border border-borderSoft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-lg w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-textMuted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-borderSoft rounded-md leading-5 bg-white text-textPrimary placeholder-textMuted focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
            placeholder="Search leads by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Lead
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-bgCard shadow-sm overflow-hidden rounded-md border border-borderSoft">
        <ul className="divide-y divide-borderSoft">
          {filteredLeads.map((lead) => (
            <li 
                key={lead.id} 
                onClick={() => handleLeadClick(lead)}
                className="hover:bg-bgMuted/50 transition-colors p-5 cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                      <p className="text-lg font-bold text-textPrimary truncate group-hover:text-primary transition-colors">{lead.name}</p>
                      <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold uppercase tracking-wide rounded-full ${
                          lead.status === 'new' ? 'bg-success/20 text-success' : 
                          lead.status === 'contacted' ? 'bg-primary/20 text-primary' : 
                          'bg-bgMuted text-textSecondary'
                      }`}>
                          {lead.status}
                      </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center text-sm text-textSecondary gap-x-6 gap-y-1 mt-1">
                    <div className="flex items-center">
                      <Mail className="flex-shrink-0 mr-2 h-4 w-4 text-textMuted" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="flex-shrink-0 mr-2 h-4 w-4 text-textMuted" />
                      {lead.phone}
                    </div>
                  </div>
                  {lead.notes && (
                      <p className="mt-2 text-sm text-textSecondary bg-bgMuted p-2 rounded-sm border border-borderSoft inline-block max-w-2xl">
                          {lead.notes}
                      </p>
                  )}
                </div>
                <div className="flex-shrink-0 flex items-center">
                   <button
                     onClick={(e) => openScheduleModal(lead.id, e)}
                     className="inline-flex items-center px-4 py-2 border border-borderSoft shadow-sm text-sm font-medium rounded-md text-textSecondary bg-white hover:bg-bgMuted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                   >
                     <Calendar className="h-4 w-4 mr-2 text-textMuted" />
                     Schedule
                   </button>
                   <div className="ml-2 text-textMuted group-hover:text-primary transition-colors">
                       <ChevronRight className="h-5 w-5" />
                   </div>
                </div>
              </div>
            </li>
          ))}
          {filteredLeads.length === 0 && (
              <li className="p-12 text-center text-textMuted flex flex-col items-center">
                  <div className="bg-bgMuted p-4 rounded-full mb-3">
                      <Search className="h-6 w-6 text-textMuted" />
                  </div>
                  <p className="text-lg font-medium">No leads found.</p>
                  <p className="text-sm">Try adjusting your search terms.</p>
              </li>
          )}
        </ul>
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-textPrimary/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-bgCard rounded-md max-w-md w-full p-8 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-textPrimary">Add New Lead</h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="text-textMuted hover:text-textSecondary">
                     <X className="h-6 w-6" />
                 </button>
             </div>
             <form onSubmit={handleAddLead} className="space-y-5">
               <div>
                 <label className="block text-sm font-semibold text-textSecondary mb-1">Full Name</label>
                 <input required type="text" className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                    value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} placeholder="e.g. John Doe" />
               </div>
               <div>
                 <label className="block text-sm font-semibold text-textSecondary mb-1">Email Address</label>
                 <input required type="email" className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                    value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} placeholder="john@example.com" />
               </div>
               <div>
                 <label className="block text-sm font-semibold text-textSecondary mb-1">Phone Number</label>
                 <input type="tel" className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                    value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
               </div>
               <div>
                 <label className="block text-sm font-semibold text-textSecondary mb-1">Initial Notes</label>
                 <textarea className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" rows={3}
                    value={newLead.notes} onChange={e => setNewLead({...newLead, notes: e.target.value})} placeholder="Context about the lead..." />
               </div>
               <div className="flex justify-end space-x-3 pt-4">
                 <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 border border-borderSoft rounded-md text-sm font-medium text-textSecondary hover:bg-bgMuted transition-colors">Cancel</button>
                 <button type="submit" className="px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primaryDark shadow-md shadow-primary/20 transition-colors">Save Lead</button>
               </div>
             </form>
           </div>
        </div>
      )}

      {renderScheduleModal()}
      {renderEditFollowUpModal()}
    </div>
  );

  function renderScheduleModal() {
      if (!isScheduleModalOpen) return null;
      return (
        <div className="fixed inset-0 bg-textPrimary/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-bgCard rounded-md max-w-md w-full p-8 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-textPrimary">Schedule Follow-up</h3>
                 <button onClick={() => setIsScheduleModalOpen(false)} className="text-textMuted hover:text-textSecondary">
                     <X className="h-6 w-6" />
                 </button>
             </div>
             <form onSubmit={handleScheduleSubmit} className="space-y-5">
               <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-textSecondary mb-1">Date</label>
                    <input required type="date" className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                        value={scheduleData.date} onChange={e => setScheduleData({...scheduleData, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-textSecondary mb-1">Time</label>
                    <input required type="time" className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                        value={scheduleData.time} onChange={e => setScheduleData({...scheduleData, time: e.target.value})} />
                  </div>
               </div>
               <div>
                 <label className="block text-sm font-semibold text-textSecondary mb-1">Type</label>
                 <select className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                    value={scheduleData.type} onChange={e => setScheduleData({...scheduleData, type: e.target.value as any})}>
                    <option value="call">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-semibold text-textSecondary mb-1">Agenda / Notes</label>
                 <textarea className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" rows={3}
                    value={scheduleData.notes} onChange={e => setScheduleData({...scheduleData, notes: e.target.value})} placeholder="What's the purpose of this follow-up?" />
               </div>
               <div className="flex justify-end space-x-3 pt-4">
                 <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-5 py-2.5 border border-borderSoft rounded-md text-sm font-medium text-textSecondary hover:bg-bgMuted transition-colors">Cancel</button>
                 <button type="submit" className="px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primaryDark shadow-md shadow-primary/20 transition-colors">Confirm Schedule</button>
               </div>
             </form>
           </div>
        </div>
      );
  }

  function renderEditFollowUpModal() {
      if (!editingFollowUp) return null;
      
      // Parse current values
      const currentIso = new Date(editingFollowUp.scheduledAt);
      const dateStr = currentIso.toISOString().split('T')[0];
      const timeStr = currentIso.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});

      const updateLocalState = (field: string, value: any) => {
          setEditingFollowUp(prev => {
              if(!prev) return null;
              if (field === 'date' || field === 'time') {
                  // Reconstruct ISO
                  const d = field === 'date' ? value : dateStr;
                  const t = field === 'time' ? value : timeStr;
                  return { ...prev, scheduledAt: new Date(`${d}T${t}`).toISOString() };
              }
              return { ...prev, [field]: value };
          });
      };

      return (
        <div className="fixed inset-0 bg-textPrimary/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-bgCard rounded-md max-w-md w-full p-8 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-textPrimary">Update Communication</h3>
                 <button onClick={() => setEditingFollowUp(null)} className="text-textMuted hover:text-textSecondary">
                     <X className="h-6 w-6" />
                 </button>
             </div>
             <form onSubmit={handleUpdateFollowUpSubmit} className="space-y-5">
               <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-textSecondary mb-1">Date</label>
                    <input required type="date" className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                        value={dateStr} onChange={e => updateLocalState('date', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-textSecondary mb-1">Time</label>
                    <input required type="time" className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                        value={timeStr} onChange={e => updateLocalState('time', e.target.value)} />
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-5">
                   <div>
                        <label className="block text-sm font-semibold text-textSecondary mb-1">Type</label>
                        <select className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                            value={editingFollowUp.type} onChange={e => updateLocalState('type', e.target.value)}>
                            <option value="call">Phone Call</option>
                            <option value="email">Email</option>
                            <option value="meeting">Meeting</option>
                        </select>
                   </div>
                   <div>
                        <label className="block text-sm font-semibold text-textSecondary mb-1">Status</label>
                        <select className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                            value={editingFollowUp.status} onChange={e => updateLocalState('status', e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="skipped">Skipped</option>
                        </select>
                   </div>
               </div>

               <div>
                 <label className="block text-sm font-semibold text-textSecondary mb-1">Outcome / Notes</label>
                 <textarea className="block w-full border border-borderSoft rounded-md shadow-sm py-2.5 px-3 bg-white text-textPrimary focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm" rows={4}
                    value={editingFollowUp.notes} onChange={e => updateLocalState('notes', e.target.value)} placeholder="Log the result of the communication..." />
               </div>

               <div className="flex justify-end space-x-3 pt-4">
                 <button type="button" onClick={() => setEditingFollowUp(null)} className="px-5 py-2.5 border border-borderSoft rounded-md text-sm font-medium text-textSecondary hover:bg-bgMuted transition-colors">Cancel</button>
                 <button type="submit" className="px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primaryDark shadow-md shadow-primary/20 transition-colors">Update Record</button>
               </div>
             </form>
           </div>
        </div>
      );
  }
}
import { Lead, FollowUp, FollowUpWithLead, DashboardStats, User } from '../types';

// --- SEED GENERATORS ---

const COMPANIES = [
  { name: 'Verdant Solutions', domain: 'verdant.com', admin: 'Sarah Green' },
  { name: 'Amber Logistics', domain: 'amberlog.com', admin: 'Mike Orange' },
  { name: 'Citrus Financial', domain: 'citrusfin.com', admin: 'Jessica Peel' }
];

const generateUsers = (): User[] => {
  const users: User[] = [];

  COMPANIES.forEach((comp, compIdx) => {
    // 1. Create Admin
    const adminId = `u_${compIdx}_admin`;
    users.push({
      id: adminId,
      name: comp.admin,
      email: `admin@${comp.domain}`,
      role: 'admin',
      organization: comp.name
    });

    // 2. Create 9 Members
    for (let i = 1; i <= 9; i++) {
      users.push({
        id: `u_${compIdx}_m${i}`,
        name: `${comp.name.split(' ')[0]} User ${i}`,
        email: `user${i}@${comp.domain}`,
        role: 'member',
        organization: comp.name
      });
    }
  });

  return users;
};

const generateLeadsAndFollowups = (users: User[]): { leads: Lead[], followups: FollowUp[] } => {
  const leads: Lead[] = [];
  const followups: FollowUp[] = [];
  
  // Only generate for admins to keep it simple for demo login, 
  // but in a real app, members would have data too.
  const admins = users.filter(u => u.role === 'admin');

  admins.forEach(admin => {
    // Generate 5 leads per admin
    for (let i = 1; i <= 5; i++) {
      const leadId = `l_${admin.id}_${i}`;
      leads.push({
        id: leadId,
        userId: admin.id,
        organizationId: admin.organization,
        name: `Lead ${i} for ${admin.organization}`,
        email: `prospect${i}@client.com`,
        phone: `555-010${i}`,
        notes: `Interested in ${admin.organization} services. Needs follow up.`,
        status: i % 2 === 0 ? 'new' : 'contacted',
        createdAt: new Date().toISOString()
      });

      // Generate a followup for each lead
      followups.push({
        id: `f_${leadId}`,
        leadId: leadId,
        userId: admin.id,
        // Mix dates: some past (overdue), some future
        scheduledAt: new Date(Date.now() + (i % 2 === 0 ? 86400000 : -86400000)).toISOString(),
        type: i % 3 === 0 ? 'call' : 'email',
        status: 'pending',
        notes: 'Standard check-in procedure.'
      });
    }
  });

  return { leads, followups };
};

// --- INITIALIZATION ---

const SEED_USERS = generateUsers();
const { leads: SEED_LEADS, followups: SEED_FOLLOWUPS } = generateLeadsAndFollowups(SEED_USERS);

const STORAGE_KEYS = {
  USERS: 'lt_users_db',
  LEADS: 'lt_leads',
  FOLLOWUPS: 'lt_followups',
  CURRENT_USER: 'lt_user_session'
};

class MockDB {
  constructor() {
    this.init();
  }

  private init() {
    // Reset or Init logic. 
    // For this demo, if no users exist, we seed the new big dataset.
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(SEED_LEADS));
      localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(SEED_FOLLOWUPS));
    }
  }

  // --- AUTH & USER MANAGEMENT ---

  login(email: string): User | null {
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  register(name: string, email: string, organization: string): User {
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    // Check if email exists
    if (users.find(u => u.email === email)) {
        throw new Error('User already exists');
    }

    const newUser: User = {
        id: 'u' + Math.random().toString(36).substr(2, 5),
        name,
        email,
        role: 'admin', // First user of org is admin
        organization
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  addTeamMember(adminUser: User, name: string, email: string): User {
      if (adminUser.role !== 'admin') throw new Error('Only admins can add members');
      
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const newUser: User = {
          id: 'u' + Math.random().toString(36).substr(2, 5),
          name,
          email,
          role: 'member',
          organization: adminUser.organization
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return newUser;
  }

  getTeamMembers(organization: string): User[] {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      return users.filter(u => u.organization === organization);
  }

  updateUser(updatedUser: User) {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const idx = users.findIndex(u => u.id === updatedUser.id);
      if (idx !== -1) {
          users[idx] = updatedUser;
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          
          // Update session if it's the current user
          const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
          if (session.id === updatedUser.id) {
              localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
          }
      }
  }

  // --- DATA ACCESS ---

  getCurrentUser(): User | null {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
  }

  getLeads(): Lead[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    
    const allLeads: Lead[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
    // Filter by Organization so team shares leads
    return allLeads.filter(l => l.organizationId === user.organization);
  }

  addLead(lead: Omit<Lead, 'id' | 'createdAt' | 'userId' | 'organizationId'>): Lead {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const leads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
    const newLead: Lead = {
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      organizationId: user.organization,
      createdAt: new Date().toISOString(),
    };
    leads.push(newLead);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    return newLead;
  }

  updateLead(updatedLead: Lead) {
    const leads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
    const index = leads.findIndex((l: Lead) => l.id === updatedLead.id);
    if (index !== -1) {
      leads[index] = updatedLead;
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    }
  }

  getFollowUps(): FollowUpWithLead[] {
    const user = this.getCurrentUser();
    if (!user) return [];

    const leads = this.getLeads(); // Already filtered by Org
    const leadIds = new Set(leads.map(l => l.id));
    
    const followups: FollowUp[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWUPS) || '[]');
    
    return followups
        .filter(f => leadIds.has(f.leadId)) // Only show followups for leads in my org
        .map(f => {
            const lead = leads.find(l => l.id === f.leadId);
            return { ...f, lead: lead! };
        })
        .filter(f => f.lead);
  }

  addFollowUp(followUp: Omit<FollowUp, 'id' | 'userId' | 'status'>): FollowUp {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const followups: FollowUp[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWUPS) || '[]');
    const newFollowUp: FollowUp = {
      ...followUp,
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      status: 'pending',
    };
    followups.push(newFollowUp);
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(followups));
    return newFollowUp;
  }

  updateFollowUpStatus(id: string, status: FollowUp['status']) {
    const followups: FollowUp[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWUPS) || '[]');
    const index = followups.findIndex(f => f.id === id);
    if (index !== -1) {
      followups[index].status = status;
      localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(followups));
    }
  }

  updateFollowUp(updatedFollowUp: FollowUp) {
    const followups: FollowUp[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWUPS) || '[]');
    const index = followups.findIndex(f => f.id === updatedFollowUp.id);
    if (index !== -1) {
      followups[index] = updatedFollowUp;
      localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(followups));
    }
  }

  getDashboardStats(): DashboardStats {
    const leads = this.getLeads();
    const followups = this.getFollowUps();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 86400000;

    const overdue = followups.filter(f => f.status === 'pending' && new Date(f.scheduledAt).getTime() < startOfToday).length;
    const todayPending = followups.filter(f => f.status === 'pending' && new Date(f.scheduledAt).getTime() >= startOfToday && new Date(f.scheduledAt).getTime() < endOfToday).length;
    const completedToday = followups.filter(f => f.status === 'completed' && new Date(f.scheduledAt).getTime() >= startOfToday && new Date(f.scheduledAt).getTime() < endOfToday).length;

    return {
      totalLeads: leads.length,
      todayPending,
      overdue,
      completedToday
    };
  }
}

export const db = new MockDB();

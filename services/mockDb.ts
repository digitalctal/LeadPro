import { Lead, FollowUp, FollowUpWithLead, DashboardStats, User, UserRole, PlanTier } from '../types';

// --- SEED GENERATORS ---

// 1. Company Level (Hierarchy: Company Admin -> Team Admin -> Member)
// 2. Team Level (Hierarchy: Team Admin -> Member)
// 3. Single User (No Hierarchy)

const generateUsers = (): User[] => {
  const users: User[] = [];

  // --- SCENARIO 1: COMPANY PLAN (Verdant Corp) ---
  // 1 Company Admin
  users.push({
    id: 'u_comp_admin',
    name: 'Sarah CEO',
    email: 'admin@verdant.com',
    role: 'company_admin',
    plan: 'company',
    organization: 'Verdant Corp',
    teamId: 'management'
  });

  // 2 Teams within Company
  ['Sales', 'Support'].forEach((teamName, idx) => {
    // Team Head
    users.push({
      id: `u_comp_team_${idx}_head`,
      name: `${teamName} Lead`,
      email: `head.${teamName.toLowerCase()}@verdant.com`,
      role: 'team_admin',
      plan: 'company',
      organization: 'Verdant Corp',
      teamId: teamName
    });

    // 3 Members per team
    for(let i=1; i<=3; i++) {
        users.push({
            id: `u_comp_team_${idx}_mem_${i}`,
            name: `${teamName} Rep ${i}`,
            email: `rep${i}.${teamName.toLowerCase()}@verdant.com`,
            role: 'member',
            plan: 'company',
            organization: 'Verdant Corp',
            teamId: teamName
          });
    }
  });


  // --- SCENARIO 2: TEAM PLAN (Amber Squad) ---
  // Standalone Team Admin
  users.push({
    id: 'u_team_admin',
    name: 'Mike Manager',
    email: 'admin@ambersquad.com',
    role: 'team_admin',
    plan: 'team',
    organization: 'Amber Squad',
    teamId: 'general'
  });
  
  // 4 Members
  for(let i=1; i<=4; i++) {
    users.push({
        id: `u_team_mem_${i}`,
        name: `Amber Agent ${i}`,
        email: `agent${i}@ambersquad.com`,
        role: 'member',
        plan: 'team',
        organization: 'Amber Squad',
        teamId: 'general'
      });
  }

  // --- SCENARIO 3: SINGLE USER PLAN ---
  users.push({
    id: 'u_single',
    name: 'Alex Freelancer',
    email: 'alex@solo.com',
    role: 'single_user',
    plan: 'single',
    organization: 'Alex Consulting',
    teamId: 'solo'
  });

  return users;
};

const generateLeadsAndFollowups = (users: User[]): { leads: Lead[], followups: FollowUp[] } => {
  const leads: Lead[] = [];
  const followups: FollowUp[] = [];
  
  users.forEach(user => {
    // Generate leads for everyone to simulate data density
    const leadCount = user.role === 'company_admin' ? 0 : 5; // CEO might not have personal leads

    for (let i = 1; i <= leadCount; i++) {
      const leadId = `l_${user.id}_${i}`;
      leads.push({
        id: leadId,
        userId: user.id,
        organizationId: user.organization, // Leads belong to Org
        name: `Lead ${i} for ${user.name}`,
        email: `prospect${i}@client.com`,
        phone: `555-010${i}`,
        notes: `Interest level high. Owner: ${user.name}`,
        status: i % 2 === 0 ? 'new' : 'contacted',
        createdAt: new Date().toISOString()
      });

      followups.push({
        id: `f_${leadId}`,
        leadId: leadId,
        userId: user.id,
        scheduledAt: new Date(Date.now() + (i % 2 === 0 ? 86400000 : -86400000)).toISOString(),
        type: i % 3 === 0 ? 'call' : 'email',
        status: 'pending',
        notes: 'Follow up required.'
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

  // Registers a NEW Single User or Company Admin (Starts a new plan)
  register(name: string, email: string, organization: string): User {
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (users.find(u => u.email === email)) throw new Error('User already exists');

    // Default registration via login page creates a Company Admin for a Company Plan
    // Or a Single User. For simplicity in this demo, let's default to Single User
    // User can upgrade in settings.
    const newUser: User = {
        id: 'u' + Math.random().toString(36).substr(2, 5),
        name,
        email,
        role: 'single_user',
        plan: 'single',
        organization,
        teamId: 'default'
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  // Hierarchy aware addition
  addTeamMember(adminUser: User, name: string, email: string, role: UserRole, teamId?: string): User {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      
      // Permissions check
      if (adminUser.role === 'member' || adminUser.role === 'single_user') {
          throw new Error('You do not have permission to add members.');
      }

      // If Team Admin, can only add to their own team
      if (adminUser.role === 'team_admin') {
          if (role !== 'member') throw new Error('Team Admins can only add Members.');
          // Force team ID
          teamId = adminUser.teamId; 
      }

      // If Company Admin, can add Team Admins or Members
      if (adminUser.role === 'company_admin' && !teamId) {
          teamId = 'general'; // Default bucket
      }

      const newUser: User = {
          id: 'u' + Math.random().toString(36).substr(2, 5),
          name,
          email,
          role,
          plan: adminUser.plan, // Inherit plan
          organization: adminUser.organization,
          teamId: teamId
      };
      
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return newUser;
  }

  deleteUser(adminUser: User, targetUserId: string) {
      if (adminUser.role === 'member' || adminUser.role === 'single_user') throw new Error('Unauthorized');
      
      let users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      // Filter out
      users = users.filter(u => u.id !== targetUserId);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // Get users based on hierarchy
  getManagedUsers(currentUser: User): User[] {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      
      if (currentUser.role === 'company_admin') {
          // See everyone in organization
          return users.filter(u => u.organization === currentUser.organization && u.id !== currentUser.id);
      }
      
      if (currentUser.role === 'team_admin') {
          // See everyone in their team
          return users.filter(u => u.organization === currentUser.organization && u.teamId === currentUser.teamId && u.id !== currentUser.id);
      }

      return [];
  }

  updateUser(updatedUser: User) {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const idx = users.findIndex(u => u.id === updatedUser.id);
      if (idx !== -1) {
          users[idx] = updatedUser;
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          
          const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
          if (session.id === updatedUser.id) {
              localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
          }
      }
  }

  updatePlan(userId: string, newPlan: PlanTier, newRole: UserRole) {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
          users[idx].plan = newPlan;
          users[idx].role = newRole;
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          // Update Session
          const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
          if (session.id === userId) {
            session.plan = newPlan;
            session.role = newRole;
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
          }
      }
  }

  // --- REPORTING ---

  calculateStats(tasks: FollowUp[]) {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const pending = tasks.filter(t => t.status === 'pending').length;
      const skipped = tasks.filter(t => t.status === 'skipped').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      const byType = {
          call: tasks.filter(t => t.type === 'call' && t.status === 'completed').length,
          email: tasks.filter(t => t.type === 'email' && t.status === 'completed').length,
          meeting: tasks.filter(t => t.type === 'meeting' && t.status === 'completed').length
      };

      return { total, completed, pending, skipped, completionRate, byType };
  }

  getOverviewStats(adminUser: User, timeframe: 'week' | 'month' | 'all') {
      const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const allFollowups: FollowUp[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWUPS) || '[]');

      // 1. Get Organization Users
      const orgUsers = allUsers.filter((u: User) => u.organization === adminUser.organization);
      const orgUserIds = orgUsers.map((u: User) => u.id);

      // 2. Filter Tasks by Time & Org
      const now = new Date();
      let tasks = allFollowups.filter(f => orgUserIds.includes(f.userId));

      if (timeframe === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          tasks = tasks.filter(t => new Date(t.scheduledAt) >= weekAgo);
      } else if (timeframe === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          tasks = tasks.filter(t => new Date(t.scheduledAt) >= monthAgo);
      }

      // 3. Org Level Stats
      const orgStats = this.calculateStats(tasks);

      // 4. Team Level Stats
      const teams: any[] = [];
      const distinctTeams = Array.from(new Set(orgUsers.map((u: User) => u.teamId || 'Unassigned'))).filter(t => t !== 'management'); // Exclude management placeholder if needed, or keep
      
      distinctTeams.forEach((teamId: any) => {
          const teamMembers = orgUsers.filter((u: User) => (u.teamId || 'Unassigned') === teamId);
          const memberIds = teamMembers.map((u: User) => u.id);
          const teamTasks = tasks.filter(t => memberIds.includes(t.userId));
          
          teams.push({
              id: teamId,
              name: teamId === 'Unassigned' ? 'Unassigned' : teamId,
              memberCount: teamMembers.length,
              stats: this.calculateStats(teamTasks)
          });
      });

      // 5. User Level Stats
      const userStats = orgUsers.map((u: User) => {
          const userTasks = tasks.filter(t => t.userId === u.id);
          return {
              id: u.id,
              name: u.name,
              role: u.role,
              teamId: u.teamId,
              stats: this.calculateStats(userTasks)
          };
      });

      return {
          orgStats,
          teams: teams.sort((a, b) => b.stats.completionRate - a.stats.completionRate),
          users: userStats.sort((a, b) => b.stats.completionRate - a.stats.completionRate)
      };
  }

  getReportData(target: string | 'all', timeframe: 'week' | 'month' | 'all', scopeType: 'user' | 'team' | 'org' = 'user') {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return null;

      const allUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      let userIdsToFetch: string[] = [];

      // Determine User IDs based on Scope
      if (scopeType === 'user' && target !== 'all') {
          userIdsToFetch = [target];
      } else if (scopeType === 'team') {
          // Target is a teamId
          userIdsToFetch = allUsers.filter((u: User) => u.organization === currentUser.organization && u.teamId === target).map((u: User) => u.id);
      } else if (target === 'all' || scopeType === 'org') {
           if (currentUser.role === 'company_admin') {
               userIdsToFetch = allUsers.filter((u: User) => u.organization === currentUser.organization).map((u: User) => u.id);
          } else if (currentUser.role === 'team_admin') {
               userIdsToFetch = allUsers.filter((u: User) => u.organization === currentUser.organization && u.teamId === currentUser.teamId).map((u: User) => u.id);
          } else {
               userIdsToFetch = [currentUser.id];
          }
      }

      // Fetch & Filter Tasks
      const allFollowups: FollowUp[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWUPS) || '[]');
      const allLeads: Lead[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');

      let tasks = allFollowups.filter(f => userIdsToFetch.includes(f.userId));

      const now = new Date();
      if (timeframe === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          tasks = tasks.filter(t => new Date(t.scheduledAt) >= weekAgo);
      } else if (timeframe === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          tasks = tasks.filter(t => new Date(t.scheduledAt) >= monthAgo);
      }

      // Enrich
      const enrichedTasks = tasks.map(t => {
          const lead = allLeads.find(l => l.id === t.leadId);
          const user = allUsers.find(u => u.id === t.userId);
          return {
              ...t,
              leadName: lead ? lead.name : 'Unknown Lead',
              userName: user ? user.name : 'Unknown User'
          };
      });

      const stats = this.calculateStats(enrichedTasks);

      return {
          stats,
          tasks: enrichedTasks.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      };
  }

  // --- DATA ACCESS ---

  getCurrentUser(): User | null {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
  }

  getLeads(): Lead[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    
    const allLeads: Lead[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
    const allUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

    // Hierarchy Logic for VIEWING leads
    if (user.role === 'company_admin') {
        return allLeads.filter(l => l.organizationId === user.organization);
    }
    
    if (user.role === 'team_admin') {
        // Get all user IDs in this team
        const teamUserIds = allUsers
            .filter(u => u.organization === user.organization && u.teamId === user.teamId)
            .map(u => u.id);
        return allLeads.filter(l => teamUserIds.includes(l.userId));
    }

    // Members and Single Users only see their own assigned leads (or team leads depending on policy, sticking to shared org for now but filtered)
    // For this MVP, let's say Members see Leads assigned to them specifically to keep it simple, 
    // OR we can say they see Team leads. Let's go with Organization sharing for simplicity of the MVP "Keep it as it is" instruction,
    // but scoped to Org.
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

    const leads = this.getLeads(); // This respects the hierarchy logic above
    const leadIds = new Set(leads.map(l => l.id));
    
    const followups: FollowUp[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWUPS) || '[]');
    
    return followups
        .filter(f => leadIds.has(f.leadId))
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
    const user = this.getCurrentUser();
    if (!user) return { totalLeads: 0, todayPending: 0, overdue: 0, completedToday: 0, scope: 'Personal' };

    // Get leads visible to this user role
    const leads = this.getLeads();
    const followups = this.getFollowUps();
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 86400000;

    const overdue = followups.filter(f => f.status === 'pending' && new Date(f.scheduledAt).getTime() < startOfToday).length;
    const todayPending = followups.filter(f => f.status === 'pending' && new Date(f.scheduledAt).getTime() >= startOfToday && new Date(f.scheduledAt).getTime() < endOfToday).length;
    const completedToday = followups.filter(f => f.status === 'completed' && new Date(f.scheduledAt).getTime() >= startOfToday && new Date(f.scheduledAt).getTime() < endOfToday).length;

    let scope: 'Personal' | 'Team' | 'Company' = 'Personal';
    if (user.role === 'company_admin') scope = 'Company';
    else if (user.role === 'team_admin') scope = 'Team';

    return {
      totalLeads: leads.length,
      todayPending,
      overdue,
      completedToday,
      scope
    };
  }
}

export const db = new MockDB();

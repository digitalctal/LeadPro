export type UserRole = 'company_admin' | 'team_admin' | 'member' | 'single_user';
export type PlanTier = 'single' | 'team' | 'company';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: PlanTier;
  organization: string; // Company Name
  teamId?: string; // For grouping within a company
}

export interface Lead {
  id: string;
  userId: string;
  organizationId: string; // Shared by team/company
  name: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
}

export interface FollowUp {
  id: string;
  leadId: string;
  userId: string;
  scheduledAt: string; // ISO Date string
  type: 'call' | 'email' | 'meeting';
  status: 'pending' | 'completed' | 'skipped';
  notes?: string;
}

export interface FollowUpWithLead extends FollowUp {
  lead: Lead;
}

export interface DashboardStats {
  totalLeads: number;
  todayPending: number;
  overdue: number;
  completedToday: number;
  scope: 'Personal' | 'Team' | 'Company';
}
import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDb';
import { User } from '../types';
import { 
    BarChart3, PieChart, TrendingUp, Calendar, Filter, Download, Briefcase, Mail, Phone, Users, 
    CheckCircle, Clock, XCircle, ArrowRight, ArrowLeft, LayoutGrid, List, AlertCircle 
} from 'lucide-react';

interface ReportsProps {
    initialUserId?: string | null;
}

type ViewMode = 'overview' | 'detail';
type ReportScope = 'org' | 'team' | 'user';

export default function Reports({ initialUserId }: ReportsProps) {
    const currentUser = db.getCurrentUser();
    
    // View State
    const [viewMode, setViewMode] = useState<ViewMode>('overview');
    const [reportScope, setReportScope] = useState<ReportScope>('org');
    const [targetId, setTargetId] = useState<string>('all');
    const [targetName, setTargetName] = useState<string>('Organization'); // For breadcrumbs

    // Filters
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');

    // Data
    const [overviewData, setOverviewData] = useState<any>(null); // For Company Admin Dashboard
    const [detailReport, setDetailReport] = useState<any>(null); // For Specific Drill-down

    useEffect(() => {
        if (initialUserId) {
            handleDrillDown(initialUserId, 'User Report', 'user');
        } else if (currentUser?.role === 'company_admin') {
            setViewMode('overview');
            setReportScope('org');
            loadOverview();
        } else {
            // Non-company admins go straight to their relevant detail view
            handleDrillDown('all', 'My Reports', currentUser?.role === 'team_admin' ? 'team' : 'user');
        }
    }, [initialUserId, currentUser]);

    useEffect(() => {
        if (viewMode === 'overview') {
            loadOverview();
        } else {
            loadDetail();
        }
    }, [viewMode, timeframe, targetId]);

    const loadOverview = () => {
        if (!currentUser) return;
        const data = db.getOverviewStats(currentUser, timeframe);
        setOverviewData(data);
    };

    const loadDetail = () => {
        const data = db.getReportData(targetId, timeframe, reportScope);
        setDetailReport(data);
    };

    const handleDrillDown = (id: string, name: string, scope: ReportScope) => {
        setTargetId(id);
        setTargetName(name);
        setReportScope(scope);
        setViewMode('detail');
    };

    const handleBackToOverview = () => {
        setTargetId('all');
        setTargetName('Organization');
        setReportScope('org');
        setViewMode('overview');
    };

    if (!currentUser) return null;

    // --- RENDER HELPERS ---

    const renderNotifications = (data: any) => {
        const alerts = [];
        if (data.orgStats.completionRate < 50) alerts.push({ type: 'warning', text: "Overall completion rate is below 50%." });
        const lowPerfTeams = data.teams.filter((t: any) => t.stats.completionRate < 40);
        if (lowPerfTeams.length > 0) alerts.push({ type: 'danger', text: `${lowPerfTeams.length} teams are critically behind schedule.` });
        
        if (alerts.length === 0) return null;

        return (
            <div className="space-y-2 mb-6">
                {alerts.map((alert, idx) => (
                    <div key={idx} className={`flex items-center p-3 rounded-md text-sm font-medium ${alert.type === 'danger' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {alert.text}
                    </div>
                ))}
            </div>
        );
    };

    const renderCompletionRing = (percentage: number, size = 60) => {
        const radius = (size - 8) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percentage / 100) * circumference;
        const color = percentage >= 75 ? 'text-success' : percentage >= 50 ? 'text-warning' : 'text-danger';

        return (
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg className="transform -rotate-90 w-full h-full">
                    <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-bgMuted" />
                    <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={offset} 
                        className={`${color} transition-all duration-1000 ease-out`} 
                    />
                </svg>
                <span className="absolute text-xs font-bold text-textPrimary">{percentage}%</span>
            </div>
        );
    };

    // --- VIEW: OVERVIEW DASHBOARD ---
    if (viewMode === 'overview' && overviewData) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
                            <LayoutGrid className="h-6 w-6 text-primary" />
                            Organization Overview
                        </h1>
                        <p className="text-textSecondary text-sm mt-1">
                            High-level performance metrics across all teams.
                        </p>
                    </div>
                    <div className="relative">
                         <select 
                            value={timeframe} 
                            onChange={(e) => setTimeframe(e.target.value as any)}
                            className="appearance-none pl-10 pr-8 py-2 bg-bgCard border border-borderSoft rounded-md text-sm font-medium text-textPrimary focus:ring-2 focus:ring-primary outline-none shadow-sm"
                        >
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-textMuted pointer-events-none" />
                    </div>
                </div>

                {renderNotifications(overviewData)}

                {/* Global Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-bgCard p-6 rounded-lg shadow-sm border border-borderSoft flex items-center justify-between">
                        <div>
                            <p className="text-sm text-textSecondary font-medium">Total Workload</p>
                            <h3 className="text-2xl font-bold text-textPrimary mt-1">{overviewData.orgStats.total}</h3>
                            <p className="text-xs text-textMuted mt-1">Tasks Assigned</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <Briefcase className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="bg-bgCard p-6 rounded-lg shadow-sm border border-borderSoft flex items-center justify-between">
                        <div>
                            <p className="text-sm text-textSecondary font-medium">Completion Rate</p>
                            <h3 className="text-2xl font-bold text-textPrimary mt-1">{overviewData.orgStats.completionRate}%</h3>
                            <p className="text-xs text-textMuted mt-1">Org Average</p>
                        </div>
                        {renderCompletionRing(overviewData.orgStats.completionRate, 50)}
                    </div>
                    <div className="bg-bgCard p-6 rounded-lg shadow-sm border border-borderSoft flex items-center justify-between">
                        <div>
                            <p className="text-sm text-textSecondary font-medium">Pending Items</p>
                            <h3 className="text-2xl font-bold text-textPrimary mt-1">{overviewData.orgStats.pending}</h3>
                            <p className="text-xs text-textMuted mt-1">Needs Action</p>
                        </div>
                        <div className="p-3 bg-warning/10 rounded-full text-warning">
                            <Clock className="h-6 w-6" />
                        </div>
                    </div>
                     <div className="bg-bgCard p-6 rounded-lg shadow-sm border border-borderSoft flex items-center justify-between">
                        <div>
                            <p className="text-sm text-textSecondary font-medium">Missed/Skipped</p>
                            <h3 className="text-2xl font-bold text-textPrimary mt-1">{overviewData.orgStats.skipped}</h3>
                            <p className="text-xs text-textMuted mt-1">Opportunities Lost</p>
                        </div>
                        <div className="p-3 bg-danger/10 rounded-full text-danger">
                            <XCircle className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* Teams Section */}
                <div>
                    <h2 className="text-lg font-bold text-textPrimary mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-textMuted" />
                        Team Performance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {overviewData.teams.map((team: any) => (
                            <div 
                                key={team.id} 
                                onClick={() => handleDrillDown(team.id, team.name, 'team')}
                                className="bg-bgCard p-6 rounded-lg border border-borderSoft hover:shadow-lg hover:border-primary/30 cursor-pointer transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-textPrimary text-lg group-hover:text-primary transition-colors">{team.name}</h3>
                                        <p className="text-sm text-textSecondary">{team.memberCount} Members</p>
                                    </div>
                                    <div className="bg-bgMuted p-1.5 rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-6">
                                    <div className="space-y-1">
                                        <div className="text-xs text-textSecondary">Completed</div>
                                        <div className="font-bold text-lg">{team.stats.completed}/{team.stats.total}</div>
                                    </div>
                                    {renderCompletionRing(team.stats.completionRate)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-bgCard rounded-lg shadow-sm border border-borderSoft overflow-hidden">
                    <div className="p-6 border-b border-borderSoft flex justify-between items-center">
                        <h2 className="text-lg font-bold text-textPrimary flex items-center">
                            <List className="h-5 w-5 mr-2 text-textMuted" />
                            Individual Performance
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-borderSoft">
                            <thead className="bg-bgMuted">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Activity Distribution</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Completion</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-textSecondary uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-bgCard divide-y divide-borderSoft">
                                {overviewData.users.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-bgMuted/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-textPrimary">{user.name}</div>
                                            <div className="text-xs text-textSecondary">{user.teamId || 'No Team'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                                            <span className="px-2 py-0.5 bg-bgMuted rounded-full text-xs font-medium border border-borderSoft capitalize">{user.role.replace('_', ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap w-48">
                                            {/* Micro Chart */}
                                            <div className="flex items-end h-8 gap-1">
                                                <div className="bg-primary w-1/3 rounded-t-sm" style={{ height: `${(user.stats.byType.call / (user.stats.completed || 1)) * 100}%` }} title="Calls"></div>
                                                <div className="bg-accent w-1/3 rounded-t-sm" style={{ height: `${(user.stats.byType.email / (user.stats.completed || 1)) * 100}%` }} title="Emails"></div>
                                                <div className="bg-indigo-500 w-1/3 rounded-t-sm" style={{ height: `${(user.stats.byType.meeting / (user.stats.completed || 1)) * 100}%` }} title="Meetings"></div>
                                            </div>
                                            <div className="flex text-[10px] text-textMuted gap-1 mt-1 justify-between px-1">
                                                <span>Call</span><span>Mail</span><span>Meet</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-full bg-bgMuted rounded-full h-2 mr-3 max-w-[100px]">
                                                    <div 
                                                        className={`h-2 rounded-full ${user.stats.completionRate >= 70 ? 'bg-success' : 'bg-warning'}`} 
                                                        style={{ width: `${user.stats.completionRate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold">{user.stats.completionRate}%</span>
                                            </div>
                                            <div className="text-xs text-textMuted mt-1">{user.stats.completed} done / {user.stats.total} total</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button 
                                                onClick={() => handleDrillDown(user.id, user.name, 'user')}
                                                className="text-primary hover:text-primaryDark text-sm font-medium hover:underline"
                                            >
                                                View Report
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: DETAIL REPORT (User/Team) ---
    if (!detailReport) return <div className="p-12 text-center text-textMuted">Loading report data...</div>;
    const { stats, tasks } = detailReport;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
             {/* Header & Controls */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-textMuted">
                        {currentUser.role === 'company_admin' && (
                            <>
                                <button onClick={handleBackToOverview} className="hover:text-primary transition-colors">Overview</button>
                                <span className="text-borderSoft">/</span>
                            </>
                        )}
                        <span className="text-textPrimary font-semibold">{targetName}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
                        {reportScope === 'team' ? <Users className="h-6 w-6 text-primary" /> : <BarChart3 className="h-6 w-6 text-primary" />}
                        {targetName} Report
                    </h1>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                         <select 
                            value={timeframe} 
                            onChange={(e) => setTimeframe(e.target.value as any)}
                            className="appearance-none pl-10 pr-8 py-2 bg-bgCard border border-borderSoft rounded-md text-sm font-medium text-textPrimary focus:ring-2 focus:ring-primary outline-none shadow-sm"
                        >
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-textMuted pointer-events-none" />
                    </div>

                    <button className="p-2 border border-borderSoft bg-bgCard rounded-md hover:bg-bgMuted text-textSecondary" title="Export CSV">
                        <Download className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-bgCard p-6 rounded-lg shadow-sm border border-borderSoft flex flex-col items-center text-center">
                    <div className="p-3 bg-primary/10 rounded-full text-primary mb-3">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-bold text-textPrimary">{stats.total}</span>
                    <span className="text-sm text-textSecondary">Total Assigned</span>
                </div>
                 <div className="bg-bgCard p-6 rounded-lg shadow-sm border border-borderSoft flex flex-col items-center text-center">
                    <div className="p-3 bg-success/10 rounded-full text-success mb-3">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-bold text-textPrimary">{stats.completed}</span>
                    <span className="text-sm text-textSecondary">Completed</span>
                    <span className="text-xs font-bold text-success mt-1">{stats.completionRate}% Rate</span>
                </div>
                 <div className="bg-bgCard p-6 rounded-lg shadow-sm border border-borderSoft flex flex-col items-center text-center">
                    <div className="p-3 bg-warning/10 rounded-full text-warning mb-3">
                        <Clock className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-bold text-textPrimary">{stats.pending}</span>
                    <span className="text-sm text-textSecondary">Pending</span>
                </div>
                 <div className="bg-bgCard p-6 rounded-lg shadow-sm border border-borderSoft flex flex-col items-center text-center">
                    <div className="p-3 bg-danger/10 rounded-full text-danger mb-3">
                        <XCircle className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-bold text-textPrimary">{stats.skipped}</span>
                    <span className="text-sm text-textSecondary">Skipped</span>
                </div>
            </div>

            {/* Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-bgCard p-6 rounded-lg shadow-sm border border-borderSoft">
                    <h3 className="text-lg font-bold text-textPrimary mb-6 flex items-center">
                        <PieChart className="h-5 w-5 mr-2 text-textMuted" />
                        Completed Work by Type
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center"><Phone className="h-4 w-4 mr-2 text-primary" /> Calls</span>
                                <span className="font-bold">{stats.byType.call}</span>
                            </div>
                            <div className="w-full bg-bgMuted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${stats.completed ? (stats.byType.call / stats.completed) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center"><Mail className="h-4 w-4 mr-2 text-accent" /> Emails</span>
                                <span className="font-bold">{stats.byType.email}</span>
                            </div>
                            <div className="w-full bg-bgMuted rounded-full h-2">
                                <div className="bg-accent h-2 rounded-full transition-all duration-500" style={{ width: `${stats.completed ? (stats.byType.email / stats.completed) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center"><Users className="h-4 w-4 mr-2 text-indigo-500" /> Meetings</span>
                                <span className="font-bold">{stats.byType.meeting}</span>
                            </div>
                            <div className="w-full bg-bgMuted rounded-full h-2">
                                <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.completed ? (stats.byType.meeting / stats.completed) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-bgCard p-6 rounded-lg shadow-sm border border-borderSoft">
                    <h3 className="text-lg font-bold text-textPrimary mb-6 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-textMuted" />
                        Status Distribution
                    </h3>
                     <div className="flex h-48 items-end gap-4 px-4 pt-4 pb-2 border-b border-borderSoft">
                         <div className="flex-1 flex flex-col items-center gap-2">
                             <div className="w-full bg-success/20 hover:bg-success/30 transition-colors rounded-t-sm relative group" style={{height: `${(stats.completed / (stats.total || 1)) * 100}%`}}>
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-success opacity-0 group-hover:opacity-100">{stats.completed}</span>
                             </div>
                             <span className="text-xs font-semibold text-textSecondary">Completed</span>
                         </div>
                         <div className="flex-1 flex flex-col items-center gap-2">
                             <div className="w-full bg-warning/20 hover:bg-warning/30 transition-colors rounded-t-sm relative group" style={{height: `${(stats.pending / (stats.total || 1)) * 100}%`}}>
                                 <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-warning opacity-0 group-hover:opacity-100">{stats.pending}</span>
                             </div>
                             <span className="text-xs font-semibold text-textSecondary">Pending</span>
                         </div>
                         <div className="flex-1 flex flex-col items-center gap-2">
                             <div className="w-full bg-danger/20 hover:bg-danger/30 transition-colors rounded-t-sm relative group" style={{height: `${(stats.skipped / (stats.total || 1)) * 100}%`}}>
                                 <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-danger opacity-0 group-hover:opacity-100">{stats.skipped}</span>
                             </div>
                             <span className="text-xs font-semibold text-textSecondary">Skipped</span>
                         </div>
                     </div>
                </div>
            </div>

            {/* Detailed Activity Log */}
            <div className="bg-bgCard rounded-lg shadow-sm border border-borderSoft overflow-hidden">
                <div className="p-6 border-b border-borderSoft bg-bgMuted/30">
                    <h3 className="text-lg font-bold text-textPrimary">Detailed Activity Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-borderSoft">
                        <thead className="bg-bgMuted">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Assignee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Lead / Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-bgCard divide-y divide-borderSoft">
                            {tasks.map((task: any) => (
                                <tr key={task.id} className="hover:bg-bgMuted/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                                        {new Date(task.scheduledAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-textPrimary">
                                        {task.userName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary capitalize flex items-center gap-2">
                                        {task.type === 'call' && <Phone className="h-3 w-3" />}
                                        {task.type === 'email' && <Mail className="h-3 w-3" />}
                                        {task.type === 'meeting' && <Users className="h-3 w-3" />}
                                        {task.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary font-medium">
                                        {task.leadName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${task.status === 'completed' ? 'bg-success/10 text-success' : 
                                              task.status === 'pending' ? 'bg-warning/10 text-warning' : 
                                              'bg-danger/10 text-danger'}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-textSecondary truncate max-w-xs">
                                        {task.notes}
                                    </td>
                                </tr>
                            ))}
                            {tasks.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-textMuted">
                                        No activity found for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
import { useState } from 'react';
import { 
  PlacementDrive, 
  StudentProfile, 
  Application, 
  AuditLogItem, 
  BranchCode, 
  DriveTier, 
  Company 
} from '../../types';
import { evaluateEligibility, TIER_CONFIG } from '../../services/eligibilityEngine';
import { exportStudentsToCsv, exportDrivesReportToCsv } from '../../services/exportService';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ShieldCheck, 
  FileSpreadsheet,
  X,
  History,
  Layers
} from 'lucide-react';

interface TpoDashboardProps {
  drives: PlacementDrive[];
  students: StudentProfile[];
  applications: Application[];
  companies: Company[];
  auditLogs: AuditLogItem[];
  onCreateDrive: (newDrive: PlacementDrive) => void;
  onUpdateDriveStatus: (driveId: string, status: any) => void;
}

export default function TpoDashboard({
  drives,
  students,
  applications,
  companies,
  auditLogs,
  onCreateDrive,
  onUpdateDriveStatus,
}: TpoDashboardProps) {
  const [activeTab, setActiveTab] = useState<'drives' | 'students' | 'analytics' | 'audit'>('drives');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingEligibleDrive, setViewingEligibleDrive] = useState<PlacementDrive | null>(null);

  // Student filter states
  const [studentSearch, setStudentSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [placementFilter, setPlacementFilter] = useState<string>('ALL');

  // Form state for creating drive
  const [formCompanyId, setFormCompanyId] = useState(companies[0]?.id || 'comp_google');
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formJobRole, setFormJobRole] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTier, setFormTier] = useState<DriveTier>('DREAM');
  const [formCtc, setFormCtc] = useState<number>(10.5);
  const [formBaseSalary, setFormBaseSalary] = useState<number>(9.0);
  const [formMinCgpa, setFormMinCgpa] = useState<number>(7.5);
  const [formMaxBacklogs, setFormMaxBacklogs] = useState<number>(0);
  const [formBranches, setFormBranches] = useState<BranchCode[]>(['CSE', 'IT', 'AI_DS', 'ECE']);
  const [formLocations, setFormLocations] = useState('Bangalore, Hyderabad');
  const [formDeadline, setFormDeadline] = useState('2025-11-15T18:00');

  // Compute analytics metrics
  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.isPlaced).length;
  const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : '0';
  const highestPackage = Math.max(...students.map(s => s.highestOfferLpa || 0), 0);
  const placedOffers = students.filter(s => s.isPlaced && s.highestOfferLpa);
  const avgPackage = placedOffers.length > 0 
    ? (placedOffers.reduce((sum, s) => sum + (s.highestOfferLpa || 0), 0) / placedOffers.length).toFixed(1)
    : '0';

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesBranch = branchFilter === 'ALL' || s.branch === branchFilter;
    const matchesPlaced = 
      placementFilter === 'ALL' || 
      (placementFilter === 'PLACED' && s.isPlaced) || 
      (placementFilter === 'UNPLACED' && !s.isPlaced);
    return matchesSearch && matchesBranch && matchesPlaced;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const comp = companies.find(c => c.id === formCompanyId) || companies[0];

    const newDrive: PlacementDrive = {
      id: `drive_${Date.now()}`,
      companyId: comp.id,
      companyName: comp.name,
      companyLogo: comp.logo,
      jobTitle: formJobTitle || 'Software Engineer',
      jobRole: formJobRole || 'Core Development',
      jobDescription: formDescription || 'Full stack engineering and distributed cloud software development.',
      tier: formTier,
      ctcLpa: formCtc,
      baseSalaryLpa: formBaseSalary,
      jobLocations: formLocations.split(',').map(s => s.trim()),
      bondDetails: { hasBond: false },
      eligibility: {
        minCgpa: formMinCgpa,
        minTenthPercent: 70,
        minTwelfthPercent: 70,
        maxActiveBacklogs: formMaxBacklogs,
        maxHistoryBacklogs: 1,
        allowedBranches: formBranches,
        batchYears: [2025],
      },
      rounds: [
        {
          roundNumber: 1,
          name: 'Online Aptitude & Coding Test',
          type: 'CODING',
          date: new Date(Date.now() + 86400000 * 5).toISOString(),
          locationOrUrl: 'Campus Center Lab',
          instructions: 'Online 90 mins test.'
        }
      ],
      applicationDeadline: formDeadline,
      driveDate: formDeadline.split('T')[0],
      status: 'UPCOMING',
      createdAt: new Date().toISOString(),
      openingsCount: 10,
      allowedDreamUpgrade: true,
    };

    onCreateDrive(newDrive);
    setShowCreateModal(false);
  };

  const ALL_BRANCHES: BranchCode[] = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI_DS'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Placement Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{placementRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {placedStudents} of {totalStudents} students placed
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Highest Package</span>
            <GraduationCap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono">{highestPackage} LPA</div>
          <div className="text-[11px] text-slate-500 mt-1">Super Dream Tier Apex</div>
        </div>

        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Average Package</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-300 font-mono">{avgPackage} LPA</div>
          <div className="text-[11px] text-slate-500 mt-1">Across placed candidates</div>
        </div>

        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Recruiting Drives</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{drives.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">{companies.length} corporate partners</div>
        </div>
      </div>

      {/* TPO Top Actions Bar */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Navigation tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('drives')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'drives'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Placement Drives ({drives.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Student Roster ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Branch Analytics
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportDrivesReportToCsv(drives, applications)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export Drives CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" /> Post New Drive
          </button>
        </div>
      </div>

      {/* TAB 1: PLACEMENT DRIVES MANAGEMENT */}
      {activeTab === 'drives' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drives.map(drive => {
              const driveApps = applications.filter(a => a.driveId === drive.id);
              // Calculate eligible pool in real-time
              const eligibleCount = students.filter(s => evaluateEligibility(s, drive).isEligible).length;
              const tierInfo = TIER_CONFIG[drive.tier];

              return (
                <div key={drive.id} className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${tierInfo.badgeColor}`}>
                        {tierInfo.label} • {drive.ctcLpa} LPA
                      </span>
                      <select
                        value={drive.status}
                        onChange={(e) => onUpdateDriveStatus(drive.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded text-[10px] px-2 py-0.5 text-slate-300 font-medium"
                      >
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="ONGOING">ONGOING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    <h3 className="text-base font-bold text-white mt-2">{drive.jobTitle}</h3>
                    <div className="text-xs text-slate-300 font-medium">{drive.companyName}</div>

                    <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cutoff CGPA:</span>
                        <span className="font-mono text-indigo-400 font-bold">&ge; {drive.eligibility.minCgpa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Max Backlogs:</span>
                        <span className="font-mono text-white">{drive.eligibility.maxActiveBacklogs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Eligible Branches:</span>
                        <span className="font-mono text-slate-300 text-[11px] truncate max-w-[120px]">
                          {drive.eligibility.allowedBranches.join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Deadline:</span>
                        <span className="font-mono text-slate-300 text-[11px]">
                          {new Date(drive.applicationDeadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Total Applicants:</span>
                      <span className="font-mono font-bold text-white">{driveApps.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Eligible Cohort Pool:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {eligibleCount} / {students.length} students
                      </span>
                    </div>

                    <button
                      onClick={() => setViewingEligibleDrive(drive)}
                      className="w-full mt-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs text-center transition-colors"
                    >
                      Audit Eligible Candidates
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT ROSTER WITH FILTERS & CSV EXPORT */}
      {activeTab === 'students' && (
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 w-48 md:w-60"
                />
              </div>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
              >
                <option value="ALL">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="AI_DS">AI_DS</option>
              </select>

              <select
                value={placementFilter}
                onChange={(e) => setPlacementFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
              >
                <option value="ALL">All Status</option>
                <option value="PLACED">Placed Candidates</option>
                <option value="UNPLACED">Unplaced Candidates</option>
              </select>
            </div>

            <button
              onClick={() => exportStudentsToCsv(students)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold self-start md:self-auto"
            >
              <Download className="w-3.5 h-3.5" /> Download Full Roster (.CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Branch</th>
                  <th className="py-3 px-3">CGPA</th>
                  <th className="py-3 px-3">Active Backlogs</th>
                  <th className="py-3 px-3">Verification</th>
                  <th className="py-3 px-3">Placement Status</th>
                  <th className="py-3 px-3">Highest Offer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredStudents.map(stud => (
                  <tr key={stud.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-semibold text-indigo-400">{stud.rollNumber}</td>
                    <td className="py-3 px-3 font-semibold text-white">{stud.fullName}</td>
                    <td className="py-3 px-3 font-mono">{stud.branch}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">{stud.currentCgpa.toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className={stud.activeBacklogs > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {stud.activeBacklogs}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {stud.verificationStatus === 'VERIFIED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {stud.isPlaced ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                          Placed ({stud.placedTier})
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Unplaced</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                      {stud.highestOfferLpa ? `${stud.highestOfferLpa} LPA` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PLACEMENT ANALYTICS & BRANCH-WISE STATS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Branch-Wise Placement Performance
            </h3>
            
            <div className="space-y-3">
              {ALL_BRANCHES.map(br => {
                const branchStudents = students.filter(s => s.branch === br);
                const placedInBranch = branchStudents.filter(s => s.isPlaced).length;
                const branchRate = branchStudents.length > 0
                  ? Math.round((placedInBranch / branchStudents.length) * 100)
                  : 0;

                return (
                  <div key={br} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono text-slate-300 font-medium">{br}</span>
                      <span className="font-mono text-indigo-400 font-bold">
                        {placedInBranch}/{branchStudents.length} ({branchRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${branchRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Recruitment Tier Distribution
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-purple-300">Super Dream Tier (&ge; 18 LPA)</div>
                  <div className="text-[11px] text-slate-400">Google, Microsoft, Amazon, Atlassian</div>
                </div>
                <div className="font-mono font-extrabold text-white text-sm">
                  {students.filter(s => s.placedTier === 'SUPER_DREAM').length} Offers
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-blue-300">Dream Tier (8 - 18 LPA)</div>
                  <div className="text-[11px] text-slate-400">Deloitte, Wells Fargo, Oracle</div>
                </div>
                <div className="font-mono font-extrabold text-white text-sm">
                  {students.filter(s => s.placedTier === 'DREAM').length} Offers
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-amber-300">Regular / Mass (&lt; 8 LPA)</div>
                  <div className="text-[11px] text-slate-400">TCS, Infosys, Cognizant, Wipro</div>
                </div>
                <div className="font-mono font-extrabold text-white text-sm">
                  {students.filter(s => s.placedTier === 'REGULAR').length} Offers
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Placement Cell Administrative Audit Trail
            </h3>
            <span className="text-xs text-slate-400">Immutable chronological event logs</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded font-bold">
                      {log.action}
                    </span>
                    <span className="font-bold text-white">{log.actorName} ({log.actorRole})</span>
                  </div>
                  <div className="text-slate-300 mt-1">{log.details}</div>
                </div>
                <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE DRIVE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Post New Campus Recruitment Drive</h3>
                <p className="text-xs text-slate-400">Configure eligibility cutoffs, CTC compensation, and rounds</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Recruiting Company</label>
                  <select
                    value={formCompanyId}
                    onChange={(e) => setFormCompanyId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Associate Software Engineer"
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Placement Tier</label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as DriveTier)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="SUPER_DREAM">Super Dream (&ge; 18 LPA)</option>
                    <option value="DREAM">Dream (8 - 18 LPA)</option>
                    <option value="CORE">Core Engineering (&ge; 6 LPA)</option>
                    <option value="REGULAR">Regular / Mass (&lt; 8 LPA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total CTC (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formCtc}
                    onChange={(e) => setFormCtc(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Base Salary (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formBaseSalary}
                    onChange={(e) => setFormBaseSalary(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Eligibility Cutoffs */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-white block">Automated Eligibility Rules Engine</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Minimum CGPA Cutoff</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formMinCgpa}
                      onChange={(e) => setFormMinCgpa(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Max Standing Backlogs Allowed</label>
                    <input
                      type="number"
                      value={formMaxBacklogs}
                      onChange={(e) => setFormMaxBacklogs(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5">Eligible Departments / Branches</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_BRANCHES.map(b => {
                      const isChecked = formBranches.includes(b);
                      return (
                        <button
                          type="button"
                          key={b}
                          onClick={() => {
                            if (isChecked) {
                              setFormBranches(formBranches.filter(x => x !== b));
                            } else {
                              setFormBranches([...formBranches, b]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors ${
                            isChecked
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Job Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Responsibilities, requirements, technology stacks..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  Publish Campus Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUDIT ELIGIBLE CANDIDATES MODAL */}
      {viewingEligibleDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-800 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Eligible Candidate Cohort: {viewingEligibleDrive.jobTitle}
                </h3>
                <p className="text-xs text-slate-400">
                  {viewingEligibleDrive.companyName} • Min CGPA: {viewingEligibleDrive.eligibility.minCgpa} • Branches: {viewingEligibleDrive.eligibility.allowedBranches.join(', ')}
                </p>
              </div>
              <button
                onClick={() => setViewingEligibleDrive(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {students.map(stud => {
                const result = evaluateEligibility(stud, viewingEligibleDrive);
                return (
                  <div
                    key={stud.id}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                      result.isEligible
                        ? 'bg-emerald-950/20 border-emerald-800/40'
                        : 'bg-slate-950 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{stud.fullName}</span>
                        <span className="font-mono text-indigo-300 text-[11px]">({stud.rollNumber} - {stud.branch})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        CGPA: {stud.currentCgpa.toFixed(2)} • Active Backlogs: {stud.activeBacklogs} • Placed: {stud.isPlaced ? `${stud.highestOfferLpa} LPA` : 'No'}
                      </div>
                      {!result.isEligible && result.reasons.length > 0 && (
                        <div className="text-[10px] text-rose-400 mt-1">
                          Reason: {result.reasons[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      {result.isEligible ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Eligible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Ineligible
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

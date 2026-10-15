import { useState } from 'react';
import { StudentProfile, User } from '../../types';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  FileCheck, 
  Clock, 
  Check, 
  X,
  FileText
} from 'lucide-react';

interface FacultyDashboardProps {
  facultyUser: User;
  students: StudentProfile[];
  onVerifyStudent: (studentId: string, status: 'VERIFIED' | 'REJECTED_FLAGGED', notes: string) => void;
}

export default function FacultyDashboard({
  facultyUser,
  students,
  onVerifyStudent,
}: FacultyDashboardProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [inspectStudent, setInspectStudent] = useState<StudentProfile | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  // Department students
  const deptStudents = students.filter(s => !facultyUser.department || s.branch === facultyUser.department);

  const filtered = deptStudents.filter(s => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(search.toLowerCase()) || 
      s.rollNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = 
      filterStatus === 'ALL' || 
      s.verificationStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = deptStudents.filter(s => s.verificationStatus === 'PENDING').length;
  const verifiedCount = deptStudents.filter(s => s.verificationStatus === 'VERIFIED').length;
  const flaggedCount = deptStudents.filter(s => s.verificationStatus === 'REJECTED_FLAGGED').length;

  const handleAction = (status: 'VERIFIED' | 'REJECTED_FLAGGED') => {
    if (!inspectStudent) return;
    onVerifyStudent(inspectStudent.id, status, verificationNotes);
    setInspectStudent(null);
    setVerificationNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 text-indigo-400">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{facultyUser.name}</h1>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Head of Department / Academic Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Department of {facultyUser.department || 'Computer Science & Engineering'} • Official Academic Attestation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-amber-400 uppercase font-semibold">Pending Review</div>
              <div className="text-lg font-extrabold text-white">{pendingCount}</div>
            </div>
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-emerald-400 uppercase font-semibold">Verified</div>
              <div className="text-lg font-extrabold text-white">{verifiedCount}</div>
            </div>
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-rose-400 uppercase font-semibold">Flagged</div>
              <div className="text-lg font-extrabold text-white">{flaggedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Roster & Attestation Table */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-400" />
            Department Candidate Academic Audit Roster
          </h2>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate or roll..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Attestation</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED_FLAGGED">Discrepancy Flagged</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-3 px-3">Roll No</th>
                <th className="py-3 px-3">Candidate Name</th>
                <th className="py-3 px-3">CGPA</th>
                <th className="py-3 px-3">10th %</th>
                <th className="py-3 px-3">12th %</th>
                <th className="py-3 px-3">Backlogs</th>
                <th className="py-3 px-3">Audit Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map(stud => (
                <tr key={stud.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{stud.rollNumber}</td>
                  <td className="py-3 px-3 font-semibold text-white">{stud.fullName}</td>
                  <td className="py-3 px-3 font-mono font-bold text-white">{stud.currentCgpa.toFixed(2)}</td>
                  <td className="py-3 px-3 font-mono">{stud.tenthPercentage}%</td>
                  <td className="py-3 px-3 font-mono">{stud.twelfthPercentage}%</td>
                  <td className="py-3 px-3 font-mono">
                    <span className={stud.activeBacklogs > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                      {stud.activeBacklogs}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {stud.verificationStatus === 'VERIFIED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Verified
                      </span>
                    )}
                    {stud.verificationStatus === 'PENDING' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pending
                      </span>
                    )}
                    {stud.verificationStatus === 'REJECTED_FLAGGED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Flagged
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        setInspectStudent(stud);
                        setVerificationNotes(stud.verificationNotes || '');
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
                    >
                      Audit & Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT & VERIFY MODAL */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-800 shadow-2xl space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Academic Record Audit</h3>
                <p className="text-slate-400 text-[11px]">
                  {inspectStudent.fullName} • Roll: {inspectStudent.rollNumber} • Register: {inspectStudent.registerNumber}
                </p>
              </div>
              <button
                onClick={() => setInspectStudent(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Claimed Cumulative CGPA:</span>
                <span className="font-mono text-indigo-400 font-bold text-sm">
                  {inspectStudent.currentCgpa.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">10th Standard Marks:</span>
                <span className="font-mono text-white">{inspectStudent.tenthPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">12th Standard Marks:</span>
                <span className="font-mono text-white">{inspectStudent.twelfthPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Arrears / Backlogs:</span>
                <span className="font-mono text-white">{inspectStudent.activeBacklogs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Historical Cleared Backlogs:</span>
                <span className="font-mono text-white">{inspectStudent.historyBacklogs}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Faculty Verification Audit Remarks</label>
              <textarea
                rows={3}
                placeholder="e.g. Original marksheets verified against University Controller of Examinations ledger."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleAction('REJECTED_FLAGGED')}
                className="px-3.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 font-semibold"
              >
                Flag Discrepancy
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInspectStudent(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('VERIFIED')}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Verify & Authorize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

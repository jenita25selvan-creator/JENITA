import { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  StudentProfile, 
  PlacementDrive, 
  Application, 
  ApplicationStage 
} from '../../types';
import { evaluateEligibility, TIER_CONFIG } from '../../services/eligibilityEngine';
import { 
  GraduationCap, 
  Award, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  DollarSign, 
  MapPin, 
  AlertCircle, 
  FileText, 
  Calendar, 
  Video, 
  Check, 
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface StudentDashboardProps {
  student: StudentProfile;
  drives: PlacementDrive[];
  applications: Application[];
  onApplyDrive: (driveId: string) => void;
  onAcceptOffer: (applicationId: string) => void;
  onDeclineOffer: (applicationId: string) => void;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
}

export default function StudentDashboard({
  student,
  drives,
  applications,
  onApplyDrive,
  onAcceptOffer,
  onDeclineOffer,
  onUpdateProfile,
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'drives' | 'applications' | 'profile'>('drives');
  const [selectedDriveForDetails, setSelectedDriveForDetails] = useState<PlacementDrive | null>(null);
  const [viewOfferApp, setViewOfferApp] = useState<Application | null>(null);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillText, setNewSkillText] = useState('');

  // Handle offer acceptance with confetti celebration
  const handleAcceptOfferWithCelebration = (appId: string) => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
    onAcceptOffer(appId);
    setViewOfferApp(null);
  };

  const handleAddSkill = () => {
    if (!newSkillText.trim()) return;
    const updatedSkills = [...student.skills, newSkillText.trim()];
    onUpdateProfile({ skills: updatedSkills });
    setNewSkillText('');
    setShowAddSkillModal(false);
  };

  const studentApplications = applications.filter(a => a.studentId === student.id);

  // Helper for stage stepper
  const STAGES_PIPELINE: { stage: ApplicationStage; label: string }[] = [
    { stage: 'APPLIED', label: 'Applied' },
    { stage: 'SHORTLISTED', label: 'Shortlisted' },
    { stage: 'APTITUDE_ROUND', label: 'Aptitude' },
    { stage: 'TECHNICAL_ROUND_1', label: 'Tech Round' },
    { stage: 'HR_ROUND', label: 'HR Round' },
    { stage: 'OFFER_EXTENDED', label: 'Offer Received' },
  ];

  return (
    <div className="space-y-6">
      {/* Student Banner Card */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border-2 border-indigo-500/30 flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80" 
                alt={student.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-white">{student.fullName}</h1>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {student.rollNumber}
                </span>
                {student.verificationStatus === 'VERIFIED' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified by HOD
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" /> Verification Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Department of {student.branch} • Batch {student.batchYear} • {student.email}
              </p>
            </div>
          </div>

          {/* Quick Academic Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Current CGPA</div>
              <div className="text-base font-extrabold text-indigo-400">{student.currentCgpa.toFixed(2)}</div>
            </div>
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Backlogs</div>
              <div className={`text-base font-extrabold ${student.activeBacklogs === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {student.activeBacklogs}
              </div>
            </div>
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Placement Status</div>
              <div className="text-xs font-bold mt-0.5">
                {student.isPlaced ? (
                  <span className="text-emerald-400">Placed ({student.highestOfferLpa} LPA)</span>
                ) : (
                  <span className="text-slate-400">Seeking Placement</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('drives')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'drives'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Available Campus Drives ({drives.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'applications'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> My Applications & Pipeline ({studentApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Academic Profile & Resume
          </button>
        </div>
      </div>

      {/* TAB 1: AVAILABLE DRIVES WITH AUTOMATED ELIGIBILITY ENGINE */}
      {activeTab === 'drives' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Active Recruitment Drives & Live Eligibility Engine
            </h2>
            <span className="text-xs text-slate-400">
              Cutoffs auto-evaluated against your verified academic record
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map(drive => {
              const eligibility = evaluateEligibility(student, drive);
              const hasApplied = studentApplications.some(a => a.driveId === drive.id);
              const tierInfo = TIER_CONFIG[drive.tier];

              return (
                <div
                  key={drive.id}
                  className="bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Top row: Company, Role & Tier */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${tierInfo.badgeColor}`}>
                          {tierInfo.label} • {drive.ctcLpa} LPA
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5">{drive.jobTitle}</h3>
                        <div className="text-xs font-medium text-slate-300 flex items-center gap-2 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{drive.companyName}</span>
                          <span className="text-slate-600">•</span>
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{drive.jobLocations.join(', ')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono text-indigo-300 font-bold">
                          {drive.ctcLpa} LPA
                        </span>
                        <div className="text-[10px] text-slate-400">Base: {drive.baseSalaryLpa} LPA</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                      {drive.jobDescription}
                    </p>

                    {/* Eligibility Summary Pill */}
                    <div className="mt-4 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Eligibility Status:</span>
                        {eligibility.isEligible ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Eligible to Apply
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-400 text-xs">
                            <XCircle className="w-3.5 h-3.5" /> Not Eligible
                          </span>
                        )}
                      </div>

                      {/* Criteria Highlights */}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                        <span>Min CGPA: {drive.eligibility.minCgpa}</span>
                        <span>•</span>
                        <span>Max Backlogs: {drive.eligibility.maxActiveBacklogs}</span>
                        <span>•</span>
                        <span>Branches: {drive.eligibility.allowedBranches.join(', ')}</span>
                      </div>

                      {/* If ineligible, show primary reason */}
                      {!eligibility.isEligible && eligibility.reasons.length > 0 && (
                        <div className="mt-2 text-[11px] text-rose-300 bg-rose-950/40 p-1.5 rounded border border-rose-900/50 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span>{eligibility.reasons[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => setSelectedDriveForDetails(drive)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                    >
                      Drive Details & Rounds <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      {hasApplied ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Applied
                        </span>
                      ) : (
                        <button
                          disabled={!eligibility.isEligible}
                          onClick={() => onApplyDrive(drive.id)}
                          className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                            eligibility.isEligible
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                          }`}
                        >
                          Apply to Drive
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS & STAGE PIPELINE */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Live Application Stages & Recruitment Pipeline
            </h2>
            <span className="text-xs text-slate-400">
              Track progress from initial screening to final offer acceptance
            </span>
          </div>

          {studentApplications.length === 0 ? (
            <div className="bg-slate-900 rounded-xl p-10 text-center border border-slate-800">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No Applications Submitted Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Explore available campus recruitment drives and apply to eligible openings to initiate your placement pipeline.
              </p>
              <button
                onClick={() => setActiveTab('drives')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500"
              >
                Browse Drives
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {studentApplications.map(app => {
                const isOfferExtended = app.currentStage === 'OFFER_EXTENDED';
                const isAccepted = app.currentStage === 'OFFER_ACCEPTED';
                const isDeclined = app.currentStage === 'OFFER_DECLINED';
                const isRejected = app.currentStage === 'REJECTED';

                return (
                  <div key={app.id} className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{app.jobTitle}</h3>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                            {app.companyName}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {app.ctcLpa} LPA
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Applied on: {new Date(app.appliedDate).toLocaleDateString()} • Application Ref: {app.id}
                        </p>
                      </div>

                      {/* Current Status Pill */}
                      <div>
                        {isAccepted && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" /> Offer Accepted
                          </span>
                        )}
                        {isDeclined && (
                          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold">
                            Offer Declined
                          </span>
                        )}
                        {isOfferExtended && (
                          <button
                            onClick={() => setViewOfferApp(app)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 animate-pulse"
                          >
                            <Award className="w-3.5 h-3.5" /> Review Offer Letter ({app.ctcLpa} LPA)
                          </button>
                        )}
                        {isRejected && (
                          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                            Application Closed / Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pipeline Stage Visual Progression Stepper */}
                    {!isRejected && (
                      <div className="pt-2">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Recruitment Stages
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                          {STAGES_PIPELINE.map((st, idx) => {
                            const isCurrent = app.currentStage === st.stage;
                            // Approximate stage completion
                            const stageOrder = ['APPLIED', 'SHORTLISTED', 'APTITUDE_ROUND', 'TECHNICAL_ROUND_1', 'HR_ROUND', 'OFFER_EXTENDED', 'OFFER_ACCEPTED'];
                            const currentIndex = stageOrder.indexOf(app.currentStage);
                            const thisIndex = stageOrder.indexOf(st.stage);
                            const isPassed = thisIndex < currentIndex || (isAccepted && st.stage === 'OFFER_EXTENDED');

                            return (
                              <div
                                key={idx}
                                className={`p-2 rounded-lg text-center border text-xs ${
                                  isCurrent
                                    ? 'bg-indigo-950/70 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/50'
                                    : isPassed
                                    ? 'bg-slate-950 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-950 border-slate-800 text-slate-500'
                                }`}
                              >
                                <div className="text-[10px] font-mono mb-0.5">
                                  {isPassed ? '✓ Done' : isCurrent ? '● Active' : `Round 0${idx + 1}`}
                                </div>
                                <div className="truncate font-medium">{st.label}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Interview Slot Alert if scheduled */}
                    {app.interviewSlot && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                            <Video className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">
                              Interview Scheduled: {app.interviewSlot.roundName}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{app.interviewSlot.slotTime}</span>
                              {app.interviewSlot.interviewerName && (
                                <>
                                  <span>•</span>
                                  <span>{app.interviewSlot.interviewerName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <a
                          href={app.interviewSlot.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                        >
                          <span>Join Meeting</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACADEMIC PROFILE & RESUME */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Academic Scores & Verification */}
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" /> Academic Credentials
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Register Number</span>
                  <span className="font-mono text-white font-medium">{student.registerNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">10th Standard %</span>
                  <span className="font-mono text-white font-medium">{student.tenthPercentage}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">12th Standard %</span>
                  <span className="font-mono text-white font-medium">{student.twelfthPercentage}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Cumulative CGPA</span>
                  <span className="font-mono text-indigo-400 font-bold">{student.currentCgpa.toFixed(2)} / 10.0</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Standing Backlogs</span>
                  <span className="font-mono text-white font-medium">{student.activeBacklogs}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Historical Backlogs</span>
                  <span className="font-mono text-white font-medium">{student.historyBacklogs}</span>
                </div>
              </div>

              {/* Semester Breakdown */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Semester GPA Progression
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {student.semesterGpa.map(sem => (
                    <div key={sem.semester} className="bg-slate-950 p-2 rounded text-center border border-slate-800">
                      <div className="text-[10px] text-slate-500">Sem {sem.semester}</div>
                      <div className="text-xs font-mono font-bold text-white">{sem.gpa.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Skills, Resume, Projects */}
          <div className="md:col-span-2 space-y-4">
            {/* Skills & ATS Scanned Keywords */}
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  Verified Skills & ATS Tags
                </h3>
                <button
                  onClick={() => setShowAddSkillModal(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Skill
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-950 text-indigo-300 border border-slate-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume Upload & Card */}
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Primary Campus Resume
                </h3>
                <span className="text-xs text-emerald-400 font-mono font-semibold">
                  Parsed & Indexed
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{student.resumeFileName}</div>
                    <div className="text-[11px] text-slate-400">PDF • Verified on Oct 2025 • ATS score: 94/100</div>
                  </div>
                </div>

                <a
                  href={student.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Projects */}
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Featured Engineering Projects
              </h3>

              <div className="space-y-2.5">
                {student.projects.map((proj, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-white">{proj.title}</div>
                    <div className="text-slate-400 text-[11px]">{proj.description}</div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.techStack.map((t, tidx) => (
                        <span key={tidx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRIVE DETAILS MODAL */}
      {selectedDriveForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-indigo-400">
                  {selectedDriveForDetails.companyName}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedDriveForDetails.jobTitle}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Package: <strong className="text-emerald-400 font-mono">{selectedDriveForDetails.ctcLpa} LPA</strong> • Tier: {selectedDriveForDetails.tier}
                </div>
              </div>
              <button
                onClick={() => setSelectedDriveForDetails(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-white mb-1">Job Description & Responsibilities</h4>
                <p className="text-slate-300 leading-relaxed">{selectedDriveForDetails.jobDescription}</p>
              </div>

              {/* Selection Rounds */}
              <div>
                <h4 className="font-bold text-white mb-2">Selection Rounds & Schedule</h4>
                <div className="space-y-2">
                  {selectedDriveForDetails.rounds.map(r => (
                    <div key={r.roundNumber} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="flex items-center justify-between font-semibold text-white">
                        <span>Round {r.roundNumber}: {r.name} ({r.type})</span>
                        <span className="text-indigo-400 font-mono">{new Date(r.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">{r.instructions}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">Venue / Platform: {r.locationOrUrl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bond & Terms */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block mb-1">Service Bond & Commitments</span>
                <p className="text-slate-400">
                  {selectedDriveForDetails.bondDetails.hasBond
                    ? `Service agreement: ${selectedDriveForDetails.bondDetails.durationMonths} months. Penalty: ₹${selectedDriveForDetails.bondDetails.penaltyAmount?.toLocaleString()}`
                    : 'No service bond required for this position.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedDriveForDetails(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onApplyDrive(selectedDriveForDetails.id);
                  setSelectedDriveForDetails(null);
                }}
                disabled={!evaluateEligibility(student, selectedDriveForDetails).isEligible}
                className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                  evaluateEligibility(student, selectedDriveForDetails).isEligible
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFER LETTER ACCEPT / DECLINE MODAL */}
      {viewOfferApp && viewOfferApp.offerDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-emerald-500/40 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Formal Campus Placement Offer
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">{viewOfferApp.companyName}</h3>
                <div className="text-xs text-slate-400">Position: {viewOfferApp.jobTitle}</div>
              </div>
              <button
                onClick={() => setViewOfferApp(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Offered CTC</span>
                <span className="text-lg font-mono font-extrabold text-emerald-400">
                  {viewOfferApp.offerDetails.offeredCtc} LPA
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Issue Date</span>
                <span className="font-mono text-white">{viewOfferApp.offerDetails.offerDate}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Acceptance Deadline</span>
                <span className="font-mono text-rose-300 font-semibold">{viewOfferApp.offerDetails.offerExpiryDate}</span>
              </div>

              <div className="pt-2 text-slate-400 leading-relaxed text-[11px]">
                By accepting this offer, your status will be updated to Placed. As per the College Placement Policy, accepting this offer locks your placement in this tier and restricts lower-tier drives to ensure equitable opportunities for classmates.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  onDeclineOffer(viewOfferApp.id);
                  setViewOfferApp(null);
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Decline Offer
              </button>
              <button
                onClick={() => handleAcceptOfferWithCelebration(viewOfferApp.id)}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
              >
                <Check className="w-4 h-4" /> Accept Offer & Confirm Placement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SKILL MODAL */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-xl max-w-sm w-full p-5 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Add Technical Skill</h3>
            <input
              type="text"
              placeholder="e.g. Kubernetes, Rust, GraphQL"
              value={newSkillText}
              onChange={(e) => setNewSkillText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddSkillModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

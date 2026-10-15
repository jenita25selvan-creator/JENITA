import { useState } from 'react';
import { 
  PlacementDrive, 
  Application, 
  ApplicationStage, 
  Company 
} from '../../types';
import { 
  Building2, 
  Users, 
  Calendar, 
  Video, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Send, 
  ExternalLink, 
  X,
  ChevronRight,
  Filter
} from 'lucide-react';

interface RecruiterDashboardProps {
  recruiterCompany: Company;
  drives: PlacementDrive[];
  applications: Application[];
  onUpdateApplicationStage: (appId: string, newStage: ApplicationStage, remarks?: string, interviewSlot?: any) => void;
  onExtendOffer: (appId: string, offeredCtc: number, letterUrl: string) => void;
}

export default function RecruiterDashboard({
  recruiterCompany,
  drives,
  applications,
  onUpdateApplicationStage,
  onExtendOffer,
}: RecruiterDashboardProps) {
  const [selectedDriveId, setSelectedDriveId] = useState<string>(drives[0]?.id || '');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  
  // Modals
  const [scheduleModalApp, setScheduleModalApp] = useState<Application | null>(null);
  const [offerModalApp, setOfferModalApp] = useState<Application | null>(null);

  // Scheduling Form
  const [slotRoundName, setSlotRoundName] = useState('Technical Round 1');
  const [slotTime, setSlotTime] = useState('2025-10-28 14:00 IST');
  const [slotUrl, setSlotUrl] = useState('https://meet.google.com/xyz-recruiter-demo');
  const [interviewerName, setInterviewerName] = useState('Senior Staff Architect');

  // Offer Form
  const [offerCtc, setOfferCtc] = useState<number>(32.0);

  // Relevant applications for this company/drive
  const companyDrives = drives.filter(d => d.companyId === recruiterCompany.id || d.companyName.toLowerCase().includes(recruiterCompany.name.toLowerCase()));
  const currentDrive = drives.find(d => d.id === selectedDriveId) || companyDrives[0] || drives[0];

  const driveApplications = applications.filter(a => {
    const matchesDrive = a.driveId === currentDrive?.id;
    const matchesStage = selectedStageFilter === 'ALL' || a.currentStage === selectedStageFilter;
    return matchesDrive && matchesStage;
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalApp) return;

    onUpdateApplicationStage(
      scheduleModalApp.id,
      'TECHNICAL_ROUND_1',
      `Interview slot confirmed for ${slotRoundName} at ${slotTime}`,
      {
        roundName: slotRoundName,
        slotTime: slotTime,
        meetingUrl: slotUrl,
        interviewerName: interviewerName,
      }
    );
    setScheduleModalApp(null);
  };

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerModalApp) return;

    onExtendOffer(
      offerModalApp.id,
      offerCtc,
      `https://campus-recruit.edu/offers/Official_${offerModalApp.studentRoll}_${recruiterCompany.name}.pdf`
    );
    setOfferModalApp(null);
  };

  return (
    <div className="space-y-6">
      {/* Recruiter Header */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
              <Building2 className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{recruiterCompany.name}</h1>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {recruiterCompany.tier} Recruiter
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Campus Portal • Lead Recruiter: {recruiterCompany.contactPerson} ({recruiterCompany.contactEmail})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Applicants</div>
              <div className="text-base font-extrabold text-white">{driveApplications.length}</div>
            </div>
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Drive</div>
              <div className="text-xs font-bold text-indigo-400 mt-0.5 max-w-[120px] truncate">
                {currentDrive?.jobTitle}
              </div>
            </div>
          </div>
        </div>

        {/* Drive Selector Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-800">
          <span className="text-xs text-slate-400 mr-2 font-medium">Select Drive:</span>
          {companyDrives.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDriveId(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDriveId === d.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {d.jobTitle} ({d.ctcLpa} LPA)
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Candidate Management */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Applicant Screening & Pipeline Progression
          </h2>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
            >
              <option value="ALL">All Pipeline Stages</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="TECHNICAL_ROUND_1">Technical Round</option>
              <option value="HR_ROUND">HR Round</option>
              <option value="OFFER_EXTENDED">Offer Extended</option>
              <option value="OFFER_ACCEPTED">Offer Accepted</option>
            </select>
          </div>
        </div>

        {driveApplications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No applicants found matching filter criteria for this drive.
          </div>
        ) : (
          <div className="space-y-3">
            {driveApplications.map(app => (
              <div
                key={app.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{app.studentName}</h3>
                    <span className="font-mono text-indigo-400 text-xs font-semibold">
                      {app.studentRoll}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 font-mono">
                      {app.studentBranch}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      CGPA: {app.studentCgpa.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-slate-400 text-[11px] mt-1 flex items-center gap-3">
                    <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-indigo-300 font-mono font-semibold">
                      Current Stage: {app.currentStage.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {app.interviewSlot && (
                    <div className="mt-2 text-[11px] text-sky-300 bg-sky-950/40 p-1.5 rounded border border-sky-900/50 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>{app.interviewSlot.roundName} scheduled for {app.interviewSlot.slotTime}</span>
                    </div>
                  )}
                </div>

                {/* Candidate Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {app.currentStage === 'APPLIED' && (
                    <button
                      onClick={() => onUpdateApplicationStage(app.id, 'SHORTLISTED', 'Profile shortlisted by Recruiter')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                    >
                      Shortlist
                    </button>
                  )}

                  {app.currentStage === 'SHORTLISTED' && (
                    <button
                      onClick={() => {
                        setScheduleModalApp(app);
                        setSlotRoundName('Technical Round 1');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" /> Schedule Tech Interview
                    </button>
                  )}

                  {app.currentStage === 'TECHNICAL_ROUND_1' && (
                    <>
                      <button
                        onClick={() => onUpdateApplicationStage(app.id, 'HR_ROUND', 'Cleared Technical Round 1 with distinction')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                      >
                        Pass to HR Round
                      </button>
                      <button
                        onClick={() => onUpdateApplicationStage(app.id, 'REJECTED', 'Did not clear Technical assessment criteria')}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {app.currentStage === 'HR_ROUND' && (
                    <button
                      onClick={() => {
                        setOfferModalApp(app);
                        setOfferCtc(app.ctcLpa);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Award className="w-3.5 h-3.5" /> Issue Offer Letter ({app.ctcLpa} LPA)
                    </button>
                  )}

                  {app.currentStage === 'OFFER_EXTENDED' && (
                    <span className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
                      Awaiting Student Acceptance
                    </span>
                  )}

                  {app.currentStage === 'OFFER_ACCEPTED' && (
                    <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Offer Accepted
                    </span>
                  )}

                  {app.currentStage === 'REJECTED' && (
                    <span className="px-3 py-1 rounded bg-slate-800 text-slate-500 text-[11px]">
                      Candidate Disqualified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {scheduleModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-800 shadow-2xl space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Schedule Candidate Interview</h3>
                <p className="text-slate-400 text-[11px]">
                  Candidate: {scheduleModalApp.studentName} ({scheduleModalApp.studentRoll})
                </p>
              </div>
              <button
                onClick={() => setScheduleModalApp(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Interview Round Name</label>
                <input
                  type="text"
                  required
                  value={slotRoundName}
                  onChange={(e) => setSlotRoundName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Slot Date & Time</label>
                <input
                  type="text"
                  required
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Virtual Meeting Room URL</label>
                <input
                  type="url"
                  required
                  value={slotUrl}
                  onChange={(e) => setSlotUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Interviewer Designation</label>
                <input
                  type="text"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setScheduleModalApp(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Confirm & Notify Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXTEND OFFER MODAL */}
      {offerModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-emerald-500/40 shadow-2xl space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Issue Formal Campus Offer</h3>
                <p className="text-slate-400 text-[11px]">
                  Recipient: {offerModalApp.studentName} ({offerModalApp.studentRoll})
                </p>
              </div>
              <button
                onClick={() => setOfferModalApp(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOfferSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Total Offered CTC (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={offerCtc}
                  onChange={(e) => setOfferCtc(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                Extending this offer will generate an encrypted PDF offer letter and push an instant notification to the candidate's portal.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setOfferModalApp(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Dispatch Offer Letter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

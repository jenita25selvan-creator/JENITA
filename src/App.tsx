/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Navbar from './components/Navbar';
import ArchitectureBlueprintView from './components/blueprint/ArchitectureBlueprintView';
import StudentDashboard from './components/student/StudentDashboard';
import TpoDashboard from './components/tpo/TpoDashboard';
import RecruiterDashboard from './components/recruiter/RecruiterDashboard';
import FacultyDashboard from './components/faculty/FacultyDashboard';

import { 
  INITIAL_USERS, 
  INITIAL_STUDENTS, 
  INITIAL_COMPANIES, 
  INITIAL_DRIVES, 
  INITIAL_APPLICATIONS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS 
} from './data/mockData';
import { 
  User, 
  StudentProfile, 
  PlacementDrive, 
  Application, 
  AppNotification, 
  AuditLogItem, 
  ApplicationStage 
} from './types';
import { evaluateEligibility } from './services/eligibilityEngine';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function App() {
  // Application Data States
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('u_student_1');
  const [viewMode, setViewMode] = useState<'portal' | 'blueprint'>('blueprint'); // Start on blueprint/architecture first as requested!

  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [drives, setDrives] = useState<PlacementDrive[]>(INITIAL_DRIVES);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [companies] = useState(INITIAL_COMPANIES);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const currentStudent = students.find(s => s.userId === currentUser.id) || students[0];
  const recruiterCompany = companies.find(c => c.id === currentUser.companyId) || companies[0];

  // Apply to drive handler
  const handleApplyDrive = (driveId: string) => {
    const drive = drives.find(d => d.id === driveId);
    if (!drive) return;

    const eligibility = evaluateEligibility(currentStudent, drive);
    if (!eligibility.isEligible) {
      alert(`Cannot apply: ${eligibility.reasons.join(', ')}`);
      return;
    }

    const newApp: Application = {
      id: `app_${Date.now()}`,
      driveId: drive.id,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      studentRoll: currentStudent.rollNumber,
      studentBranch: currentStudent.branch,
      studentCgpa: currentStudent.currentCgpa,
      studentEmail: currentStudent.email,
      companyName: drive.companyName,
      jobTitle: drive.jobTitle,
      ctcLpa: drive.ctcLpa,
      appliedDate: new Date().toISOString(),
      currentStage: 'APPLIED',
      stageHistory: [
        {
          stage: 'APPLIED',
          timestamp: new Date().toISOString(),
          remarks: 'Application logged with verified profile.',
        },
      ],
    };

    setApplications(prev => [newApp, ...prev]);

    // Push notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: `Application Submitted: ${drive.companyName}`,
      message: `You successfully applied for ${drive.jobTitle} (${drive.ctcLpa} LPA). Stage: Applied.`,
      type: 'DRIVE_ALERT',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Audit log
    const newLog: AuditLogItem = {
      id: `audit_${Date.now()}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'STUDENT_APPLIED',
      entityType: 'APPLICATION',
      entityId: newApp.id,
      details: `${currentUser.name} submitted application for ${drive.companyName} (${drive.jobTitle}).`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Accept offer handler
  const handleAcceptOffer = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app || !app.offerDetails) return;

    const drive = drives.find(d => d.id === app.driveId);
    const driveTier = drive?.tier || 'REGULAR';

    // 1. Update application
    setApplications(prev =>
      prev.map(a =>
        a.id === applicationId
          ? {
              ...a,
              currentStage: 'OFFER_ACCEPTED' as ApplicationStage,
              stageHistory: [
                ...a.stageHistory,
                {
                  stage: 'OFFER_ACCEPTED' as ApplicationStage,
                  timestamp: new Date().toISOString(),
                  remarks: 'Formally accepted offer letter.',
                },
              ],
            }
          : a
      )
    );

    // 2. Update student placement profile
    setStudents(prev =>
      prev.map(s =>
        s.id === app.studentId
          ? {
              ...s,
              isPlaced: true,
              placedTier: driveTier,
              highestOfferLpa: app.offerDetails?.offeredCtc,
              acceptedOfferId: app.id,
            }
          : s
      )
    );

    // 3. Notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: `Offer Accepted: ${app.companyName}! 🎉`,
      message: `You have formally accepted the placement offer of ${app.offerDetails.offeredCtc} LPA. Congratulations!`,
      type: 'OFFER_RECEIVED',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    // 4. Audit
    const newLog: AuditLogItem = {
      id: `audit_${Date.now()}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'ACCEPT_OFFER',
      entityType: 'OFFER',
      entityId: app.id,
      details: `${currentUser.name} accepted formal offer from ${app.companyName} (${app.offerDetails.offeredCtc} LPA). Placement locked.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Decline offer
  const handleDeclineOffer = (applicationId: string) => {
    setApplications(prev =>
      prev.map(a =>
        a.id === applicationId
          ? {
              ...a,
              currentStage: 'OFFER_DECLINED' as ApplicationStage,
              stageHistory: [
                ...a.stageHistory,
                {
                  stage: 'OFFER_DECLINED' as ApplicationStage,
                  timestamp: new Date().toISOString(),
                  remarks: 'Candidate declined offer.',
                },
              ],
            }
          : a
      )
    );
  };

  // Recruiter promotes stage / schedules interview
  const handleUpdateApplicationStage = (
    appId: string,
    newStage: ApplicationStage,
    remarks?: string,
    interviewSlot?: any
  ) => {
    setApplications(prev =>
      prev.map(a => {
        if (a.id !== appId) return a;
        const updated = {
          ...a,
          currentStage: newStage,
          stageHistory: [
            ...a.stageHistory,
            {
              stage: newStage,
              timestamp: new Date().toISOString(),
              remarks: remarks || `Moved to ${newStage}`,
            },
          ],
        };
        if (interviewSlot) {
          updated.interviewSlot = interviewSlot;
        }
        return updated;
      })
    );

    const targetApp = applications.find(a => a.id === appId);
    if (targetApp) {
      // Notify student
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: targetApp.studentId,
        title: `Status Update: ${targetApp.companyName}`,
        message: remarks || `Your application has progressed to ${newStage.replace(/_/g, ' ')}.`,
        type: interviewSlot ? 'INTERVIEW_SCHEDULE' : 'INFO',
        timestamp: 'Just now',
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);

      // Audit log
      const log: AuditLogItem = {
        id: `audit_${Date.now()}`,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'UPDATE_STAGE',
        entityType: 'APPLICATION',
        entityId: appId,
        details: `${currentUser.name} promoted application of ${targetApp.studentName} to ${newStage}.`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setAuditLogs(prev => [log, ...prev]);
    }
  };

  // Recruiter extends formal offer
  const handleExtendOffer = (appId: string, offeredCtc: number, letterUrl: string) => {
    setApplications(prev =>
      prev.map(a => {
        if (a.id !== appId) return a;
        return {
          ...a,
          currentStage: 'OFFER_EXTENDED' as ApplicationStage,
          offerDetails: {
            offeredCtc,
            offerDate: new Date().toISOString().split('T')[0],
            offerExpiryDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
            offerLetterUrl: letterUrl,
          },
          stageHistory: [
            ...a.stageHistory,
            {
              stage: 'OFFER_EXTENDED' as ApplicationStage,
              timestamp: new Date().toISOString(),
              remarks: `Formal Offer Letter issued for ${offeredCtc} LPA.`,
            },
          ],
        };
      })
    );

    const targetApp = applications.find(a => a.id === appId);
    if (targetApp) {
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: targetApp.studentId,
        title: `Formal Offer Received: ${targetApp.companyName}! 🌟`,
        message: `Congratulations! ${targetApp.companyName} has extended an official placement offer of ${offeredCtc} LPA. Review & accept on your dashboard.`,
        type: 'OFFER_RECEIVED',
        timestamp: 'Just now',
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  // TPO creates drive
  const handleCreateDrive = (newDrive: PlacementDrive) => {
    setDrives(prev => [newDrive, ...prev]);

    const log: AuditLogItem = {
      id: `audit_${Date.now()}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'PUBLISH_DRIVE',
      entityType: 'DRIVE',
      entityId: newDrive.id,
      details: `${currentUser.name} published ${newDrive.companyName} (${newDrive.jobTitle}) offering ${newDrive.ctcLpa} LPA.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs(prev => [log, ...prev]);

    // Broadcast notification
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: 'ALL',
      title: `New Campus Drive: ${newDrive.companyName}`,
      message: `${newDrive.companyName} announced ${newDrive.jobTitle} (${newDrive.ctcLpa} LPA). Check your eligibility now!`,
      type: 'DRIVE_ALERT',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Update drive status
  const handleUpdateDriveStatus = (driveId: string, status: any) => {
    setDrives(prev =>
      prev.map(d => (d.id === driveId ? { ...d, status } : d))
    );
  };

  // Faculty audits & verifies student
  const handleVerifyStudent = (studentId: string, status: 'VERIFIED' | 'REJECTED_FLAGGED', notes: string) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === studentId
          ? {
              ...s,
              verificationStatus: status,
              verifiedByFacultyId: currentUser.id,
              verificationNotes: notes,
            }
          : s
      )
    );

    const stud = students.find(s => s.id === studentId);
    if (stud) {
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: stud.userId,
        title: status === 'VERIFIED' ? 'Academic Credentials Verified' : 'Academic Discrepancy Flagged',
        message: notes || `HOD has marked your profile as ${status}.`,
        type: 'VERIFICATION_UPDATE',
        timestamp: 'Just now',
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);

      const log: AuditLogItem = {
        id: `audit_${Date.now()}`,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'VERIFY_STUDENT',
        entityType: 'STUDENT',
        entityId: studentId,
        details: `${currentUser.name} attested ${stud.fullName} (${stud.rollNumber}) as ${status}. Notes: ${notes}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setAuditLogs(prev => [log, ...prev]);
    }
  };

  // Update student profile
  const handleUpdateProfile = (updated: Partial<StudentProfile>) => {
    setStudents(prev =>
      prev.map(s => (s.id === currentStudent.id ? { ...s, ...updated } : s))
    );
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleResetData = () => {
    setStudents(INITIAL_STUDENTS);
    setDrives(INITIAL_DRIVES);
    setApplications(INITIAL_APPLICATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUserId('u_student_1');
    setViewMode('portal');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={setCurrentUserId}
        viewMode={viewMode}
        onSwitchViewMode={setViewMode}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onResetData={handleResetData}
      />

      {/* Role Quick Selector Sub-Bar */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-white">Active Persona:</span>
            <span className="text-indigo-300 font-bold">{currentUser.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentUser.role}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 text-[11px] mr-1 hidden sm:inline">Switch Role:</span>
            <button
              onClick={() => { setCurrentUserId('u_student_1'); setViewMode('portal'); }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                currentUserId === 'u_student_1' && viewMode === 'portal'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Student (Rahul - CSE)
            </button>
            <button
              onClick={() => { setCurrentUserId('u_student_2'); setViewMode('portal'); }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                currentUserId === 'u_student_2' && viewMode === 'portal'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Student (Ananya - Placed 7.5L)
            </button>
            <button
              onClick={() => { setCurrentUserId('u_tpo_1'); setViewMode('portal'); }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                currentUserId === 'u_tpo_1' && viewMode === 'portal'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              TPO Head (Dr. Arvind)
            </button>
            <button
              onClick={() => { setCurrentUserId('u_recruiter_1'); setViewMode('portal'); }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                currentUserId === 'u_recruiter_1' && viewMode === 'portal'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Recruiter (Google)
            </button>
            <button
              onClick={() => { setCurrentUserId('u_faculty_1'); setViewMode('portal'); }}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                currentUserId === 'u_faculty_1' && viewMode === 'portal'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Faculty HOD (Prof. Rao)
            </button>
            <button
              onClick={() => setViewMode('blueprint')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ml-2 ${
                viewMode === 'blueprint'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900 border border-purple-800/40'
              }`}
            >
              📐 System Architecture & ER Schema
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'blueprint' ? (
          <ArchitectureBlueprintView />
        ) : (
          <>
            {currentUser.role === 'student' && (
              <StudentDashboard
                student={currentStudent}
                drives={drives}
                applications={applications}
                onApplyDrive={handleApplyDrive}
                onAcceptOffer={handleAcceptOffer}
                onDeclineOffer={handleDeclineOffer}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {currentUser.role === 'tpo' && (
              <TpoDashboard
                drives={drives}
                students={students}
                applications={applications}
                companies={companies}
                auditLogs={auditLogs}
                onCreateDrive={handleCreateDrive}
                onUpdateDriveStatus={handleUpdateDriveStatus}
              />
            )}

            {currentUser.role === 'recruiter' && (
              <RecruiterDashboard
                recruiterCompany={recruiterCompany}
                drives={drives}
                applications={applications}
                onUpdateApplicationStage={handleUpdateApplicationStage}
                onExtendOffer={handleExtendOffer}
              />
            )}

            {currentUser.role === 'faculty' && (
              <FacultyDashboard
                facultyUser={currentUser}
                students={students}
                onVerifyStudent={handleVerifyStudent}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CampusRecruit Enterprise Placement Management System • Academic Year 2025-2026</span>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setViewMode('blueprint')} className="hover:text-white transition-colors">
              System Architecture & ER Schema
            </button>
            <span>•</span>
            <button onClick={handleResetData} className="hover:text-rose-400 transition-colors">
              Reset Datasets
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

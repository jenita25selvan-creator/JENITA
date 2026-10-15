export type UserRole = 'student' | 'tpo' | 'recruiter' | 'faculty';

export type BranchCode = 'CSE' | 'IT' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'AI_DS';

export type DriveTier = 'SUPER_DREAM' | 'DREAM' | 'CORE' | 'REGULAR'; // Super Dream >= 18 LPA, Dream 8-18 LPA, Regular < 8 LPA

export type DriveStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type ApplicationStage = 
  | 'APPLIED' 
  | 'SHORTLISTED' 
  | 'APTITUDE_ROUND' 
  | 'TECHNICAL_ROUND_1' 
  | 'TECHNICAL_ROUND_2' 
  | 'HR_ROUND' 
  | 'OFFER_EXTENDED' 
  | 'OFFER_ACCEPTED' 
  | 'OFFER_DECLINED' 
  | 'REJECTED';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED_FLAGGED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: BranchCode;
  companyId?: string; // if recruiter
  phone?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  rollNumber: string;
  registerNumber: string;
  fullName: string;
  email: string;
  phone: string;
  branch: BranchCode;
  batchYear: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
  // Academics
  tenthPercentage: number;
  twelfthPercentage: number;
  diplomaPercentage?: number;
  currentCgpa: number;
  activeBacklogs: number;
  historyBacklogs: number;
  semesterGpa: { semester: number; gpa: number }[];
  verificationStatus: VerificationStatus;
  verifiedByFacultyId?: string;
  verificationNotes?: string;
  // Professional Details
  skills: string[];
  resumeUrl: string;
  resumeFileName: string;
  resumeParsedSkills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  projects: {
    title: string;
    description: string;
    techStack: string[];
    link?: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    year: number;
  }[];
  // Placement Status
  isPlaced: boolean;
  placedTier?: DriveTier;
  highestOfferLpa?: number;
  acceptedOfferId?: string;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  logo: string;
  description: string;
  headquarters: string;
  contactEmail: string;
  contactPerson: string;
  contactPhone: string;
  tier: DriveTier;
  rating?: number;
}

export interface SelectionRoundConfig {
  roundNumber: number;
  name: string;
  type: 'APTITUDE' | 'CODING' | 'TECHNICAL' | 'GROUP_DISCUSSION' | 'HR';
  date: string;
  locationOrUrl: string;
  instructions: string;
}

export interface EligibilityCriteria {
  minCgpa: number;
  minTenthPercent: number;
  minTwelfthPercent: number;
  maxActiveBacklogs: number;
  maxHistoryBacklogs: number;
  allowedBranches: BranchCode[];
  batchYears: number[];
  genderPreference?: 'ALL' | 'FEMALE_ONLY';
}

export interface PlacementDrive {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  jobTitle: string;
  jobRole: string;
  jobDescription: string;
  tier: DriveTier;
  ctcLpa: number; // in Lakhs Per Annum (e.g., 18.5)
  baseSalaryLpa: number;
  stipendPerMonth?: number; // for internship
  jobLocations: string[];
  bondDetails: {
    hasBond: boolean;
    durationMonths?: number;
    penaltyAmount?: number;
  };
  eligibility: EligibilityCriteria;
  rounds: SelectionRoundConfig[];
  applicationDeadline: string;
  driveDate: string;
  status: DriveStatus;
  createdAt: string;
  openingsCount: number;
  allowedDreamUpgrade: boolean; // whether students placed in lower tier can apply
}

export interface Application {
  id: string;
  driveId: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  studentBranch: BranchCode;
  studentCgpa: number;
  studentEmail: string;
  companyName: string;
  jobTitle: string;
  ctcLpa: number;
  appliedDate: string;
  currentStage: ApplicationStage;
  stageHistory: {
    stage: ApplicationStage;
    timestamp: string;
    remarks?: string;
  }[];
  interviewSlot?: {
    roundName: string;
    slotTime: string;
    meetingUrl: string;
    interviewerName?: string;
  };
  offerDetails?: {
    offeredCtc: number;
    offerDate: string;
    offerExpiryDate: string;
    offerLetterUrl: string;
    acceptedAt?: string;
    declinedAt?: string;
  };
}

export interface EligibilityResult {
  isEligible: boolean;
  canApplyUnderPolicy: boolean;
  reasons: string[];
  criteriaBreakdown: {
    cgpaMet: boolean;
    tenthMet: boolean;
    twelfthMet: boolean;
    backlogsMet: boolean;
    branchMet: boolean;
    batchMet: boolean;
    placementPolicyMet: boolean;
  };
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'DRIVE_ALERT' | 'INTERVIEW_SCHEDULE' | 'OFFER_RECEIVED' | 'VERIFICATION_UPDATE' | 'INFO';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AuditLogItem {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'STUDENT' | 'DRIVE' | 'APPLICATION' | 'OFFER' | 'POLICY';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface SystemAnalytics {
  totalStudents: number;
  placedStudents: number;
  placementPercentage: number;
  totalCompaniesVisited: number;
  totalDrivesConducted: number;
  totalOffersGenerated: number;
  highestPackageLpa: number;
  averagePackageLpa: number;
  medianPackageLpa: number;
  branchWiseStats: {
    branch: BranchCode;
    total: number;
    placed: number;
    avgLpa: number;
    highestLpa: number;
  }[];
  tierDistribution: {
    tier: DriveTier;
    count: number;
    avgLpa: number;
  }[];
  topRecruiters: {
    company: string;
    hiresCount: number;
    avgPackage: number;
  }[];
}

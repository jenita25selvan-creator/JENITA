export interface ArchitectureDoc {
  sectionTitle: string;
  summary: string;
  content: string;
}

export const ARCHITECTURE_OVERVIEW = {
  title: "CampusRecruit Enterprise Architecture Specification",
  version: "v2.4.0",
  lastUpdated: "October 2025",
  techStack: [
    { layer: "Frontend Client", tech: "React 19 + TypeScript + Tailwind CSS", justification: "Type-safe, component-driven UI with instant state reactivity, zero-pill accessible UI, and mobile responsive layout for on-the-go student updates." },
    { layer: "Backend Runtime", tech: "Node.js (v22 LTS) + Express.js", justification: "Non-blocking event loop ideal for concurrent student applications, real-time stage progression WebSockets, and high I/O throughput." },
    { layer: "Primary Database", tech: "PostgreSQL 16 Relational DB", justification: "ACID compliance essential for zero race-conditions during application deadlines, multi-column composite indexing for instant eligibility filtering, and strict foreign-key integrity." },
    { layer: "In-Memory Cache & Queues", tech: "Redis 7.2 + BullMQ", justification: "Caches active drive listings, absorbs sudden 5,000+ student application traffic bursts, and runs background email/SMS dispatch worker queues." },
    { layer: "Document & Resume Storage", tech: "AWS S3 / GCP Cloud Storage with Pre-Signed URLs", justification: "Secure, off-server direct-to-S3 resume/offer uploads with 5-minute pre-signed expiring tokens, virus scanning webhook, and private bucket isolation." },
    { layer: "Authentication & RBAC", tech: "JWT (RS256 asymmetric) + HTTP-only Refresh Tokens", justification: "Stateless verification across micro-services, cryptographically signed roles (Student, TPO, Recruiter, Faculty), with instantaneous revocation support in Redis." }
  ]
};

export const SQL_SCHEMA_DDL = `-- ========================================================
-- CampusRecruit Relational Database Schema (PostgreSQL 16)
-- Enterprise-grade DDL with UUIDs, Foreign Keys, Indexes & Constraints
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('STUDENT', 'TPO', 'RECRUITER', 'FACULTY');
CREATE TYPE branch_code AS ENUM ('CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI_DS');
CREATE TYPE drive_tier AS ENUM ('SUPER_DREAM', 'DREAM', 'CORE', 'REGULAR');
CREATE TYPE drive_status AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE application_stage AS ENUM (
  'APPLIED', 'SHORTLISTED', 'APTITUDE_ROUND', 
  'TECHNICAL_ROUND_1', 'TECHNICAL_ROUND_2', 
  'HR_ROUND', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 
  'OFFER_DECLINED', 'REJECTED'
);
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED_FLAGGED');

-- 2. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role user_role NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. COMPANIES TABLE
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  website_url TEXT,
  industry VARCHAR(100),
  logo_url TEXT,
  description TEXT,
  headquarters VARCHAR(150),
  contact_person VARCHAR(100),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  tier drive_tier DEFAULT 'REGULAR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. STUDENTS TABLE
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roll_number VARCHAR(30) UNIQUE NOT NULL,
  register_number VARCHAR(30) UNIQUE NOT NULL,
  branch branch_code NOT NULL,
  batch_year SMALLINT NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  date_of_birth DATE NOT NULL,
  
  -- Academic Cutoffs
  tenth_percentage NUMERIC(5, 2) NOT NULL CHECK (tenth_percentage BETWEEN 0 AND 100),
  twelfth_percentage NUMERIC(5, 2) NOT NULL CHECK (twelfth_percentage BETWEEN 0 AND 100),
  current_cgpa NUMERIC(4, 2) NOT NULL CHECK (current_cgpa BETWEEN 0.00 AND 10.00),
  active_backlogs SMALLINT DEFAULT 0 CHECK (active_backlogs >= 0),
  history_backlogs SMALLINT DEFAULT 0 CHECK (history_backlogs >= 0),
  
  -- Verification & Status
  verification_status verification_status DEFAULT 'PENDING',
  verified_by_faculty_id UUID REFERENCES users(id),
  verification_notes TEXT,
  
  -- Placement Profile
  resume_url TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  is_placed BOOLEAN DEFAULT FALSE,
  placed_tier drive_tier,
  highest_offer_lpa NUMERIC(6, 2) DEFAULT 0.00,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PLACEMENT DRIVES TABLE
CREATE TABLE placement_drives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  job_title VARCHAR(150) NOT NULL,
  job_role VARCHAR(100) NOT NULL,
  job_description TEXT NOT NULL,
  tier drive_tier NOT NULL,
  ctc_lpa NUMERIC(6, 2) NOT NULL CHECK (ctc_lpa > 0),
  base_salary_lpa NUMERIC(6, 2) NOT NULL,
  stipend_per_month NUMERIC(10, 2),
  locations TEXT[] NOT NULL,
  has_bond BOOLEAN DEFAULT FALSE,
  bond_duration_months SMALLINT DEFAULT 0,
  bond_penalty_inr NUMERIC(10, 2) DEFAULT 0,
  
  -- Eligibility Criteria
  min_cgpa NUMERIC(4, 2) DEFAULT 6.00,
  min_tenth_percent NUMERIC(5, 2) DEFAULT 60.00,
  min_twelfth_percent NUMERIC(5, 2) DEFAULT 60.00,
  max_active_backlogs SMALLINT DEFAULT 0,
  max_history_backlogs SMALLINT DEFAULT 1,
  allowed_branches branch_code[] NOT NULL,
  batch_years SMALLINT[] NOT NULL,
  
  application_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  drive_date DATE NOT NULL,
  openings_count INT DEFAULT 1,
  status drive_status DEFAULT 'UPCOMING',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. APPLICATIONS TABLE
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_id UUID NOT NULL REFERENCES placement_drives(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  current_stage application_stage DEFAULT 'APPLIED',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Unique constraint: A student can apply to a drive at most once
  CONSTRAINT unique_student_drive UNIQUE (drive_id, student_id)
);

-- 7. APPLICATION STAGE AUDIT HISTORY
CREATE TABLE application_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_stage application_stage,
  to_stage application_stage NOT NULL,
  changed_by UUID REFERENCES users(id),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. INTERVIEW ROUNDS & SLOTS
CREATE TABLE interview_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  round_number SMALLINT NOT NULL,
  round_name VARCHAR(100) NOT NULL,
  slot_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location_or_url TEXT NOT NULL,
  interviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. OFFERS TABLE
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id),
  drive_id UUID NOT NULL REFERENCES placement_drives(id),
  offered_ctc_lpa NUMERIC(6, 2) NOT NULL,
  offer_letter_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'ACCEPTED', 'DECLINED', 'REVOKED')),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  responded_at TIMESTAMP WITH TIME ZONE
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  actor_role user_role NOT NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HIGH PERFORMANCE COMPOSITE INDEXES FOR FILTERING 5,000+ STUDENTS
CREATE INDEX idx_students_filter ON students (branch, batch_year, current_cgpa, active_backlogs);
CREATE INDEX idx_drives_status_deadline ON placement_drives (status, application_deadline);
CREATE INDEX idx_applications_stage ON applications (drive_id, current_stage);
CREATE INDEX idx_audit_created ON audit_logs (created_at DESC);
`;

export const API_ENDPOINTS_LIST = [
  {
    category: "Authentication & RBAC",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/login",
        desc: "Role-based authentication returning signed JWT & refresh cookie.",
        requestBody: `{\n  "email": "rahul.sharma@campus.edu",\n  "password": "SecurePassword123!",\n  "role": "student"\n}`,
        responseBody: `{\n  "success": true,\n  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "user": {\n    "id": "u_student_1",\n    "name": "Rahul Sharma",\n    "role": "student",\n    "branch": "CSE"\n  }\n}`
      },
      {
        method: "POST",
        path: "/api/v1/auth/refresh",
        desc: "Exchanges valid HTTP-Only refresh token for a fresh access token.",
        requestBody: `{} // Sent automatically via credentials cookie`,
        responseBody: `{\n  "accessToken": "eyJhbGciOiJSUzI1Ni..."\n}`
      }
    ]
  },
  {
    category: "Student Profile & Academic Verification",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/students/me",
        desc: "Fetch authenticated student's full academic, resume, and placement profile.",
        requestBody: `None (Auth Bearer header)`,
        responseBody: `{\n  "id": "stud_1",\n  "rollNumber": "21CS042",\n  "cgpa": 8.85,\n  "activeBacklogs": 0,\n  "isPlaced": false,\n  "verificationStatus": "VERIFIED"\n}`
      },
      {
        method: "PATCH",
        path: "/api/v1/faculty/students/:id/verify",
        desc: "Faculty/HOD marks academic details as verified or flagged.",
        requestBody: `{\n  "status": "VERIFIED",\n  "notes": "Original 6th semester grade sheet verified in dean office."\n}`,
        responseBody: `{\n  "success": true,\n  "verifiedAt": "2025-10-15T09:00:00Z",\n  "status": "VERIFIED"\n}`
      }
    ]
  },
  {
    category: "Placement Drive Management",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/drives",
        desc: "TPO or Recruiter creates a new recruitment drive with criteria.",
        requestBody: `{\n  "companyId": "comp_google",\n  "jobTitle": "Software Development Engineer - I",\n  "tier": "SUPER_DREAM",\n  "ctcLpa": 32.0,\n  "eligibility": {\n    "minCgpa": 8.5,\n    "allowedBranches": ["CSE", "IT", "AI_DS"],\n    "maxActiveBacklogs": 0,\n    "batchYears": [2025]\n  },\n  "applicationDeadline": "2025-10-22T23:59:59Z"\n}`,
        responseBody: `{\n  "success": true,\n  "driveId": "drive_google_sde",\n  "eligibleStudentsCount": 142,\n  "status": "UPCOMING"\n}`
      },
      {
        method: "GET",
        path: "/api/v1/drives/:id/eligible-candidates",
        desc: "Automated Rules Engine queries eligible students matching CGPA, branch, backlogs, and Dream Offer Policy.",
        requestBody: `None`,
        responseBody: `{\n  "totalEligible": 142,\n  "candidates": [\n    { "id": "stud_1", "name": "Rahul Sharma", "cgpa": 8.85, "branch": "CSE", "canUpgrade": true }\n  ]\n}`
      }
    ]
  },
  {
    category: "Application Lifecycle & Pipeline",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/drives/:id/apply",
        desc: "Student applies to drive. Server-side Rules Engine re-validates criteria atomically.",
        requestBody: `{\n  "confirmedAccuracy": true,\n  "selectedResumeVersion": "Rahul_Sharma_Resume_2025.pdf"\n}`,
        responseBody: `{\n  "applicationId": "app_982",\n  "status": "APPLIED",\n  "message": "Application logged. All criteria met."\n}`
      },
      {
        method: "POST",
        path: "/api/v1/applications/:id/stage",
        desc: "Promote or reject candidate to next stage (Aptitude, Tech 1, HR, Offer).",
        requestBody: `{\n  "toStage": "TECHNICAL_ROUND_1",\n  "remarks": "Passed coding challenge with 100/100 points.",\n  "scheduleSlot": {\n    "time": "2025-10-20T10:00:00Z",\n    "meetingUrl": "https://teams.microsoft.com/..."\n  }\n}`,
        responseBody: `{\n  "success": true,\n  "currentStage": "TECHNICAL_ROUND_1",\n  "notificationDispatched": true\n}`
      },
      {
        method: "POST",
        path: "/api/v1/offers/:id/respond",
        desc: "Student accepts or declines formal offer letter. Triggers Dream Policy locks.",
        requestBody: `{\n  "decision": "ACCEPT",\n  "digitalSignature": "Rahul Sharma - 21CS042"\n}`,
        responseBody: `{\n  "success": true,\n  "status": "OFFER_ACCEPTED",\n  "studentPlacementTierUpdated": "SUPER_DREAM",\n  "otherApplicationsWithdrawn": 3\n}`
      }
    ]
  }
];

export const PLACEMENT_POLICY_MATRIX = [
  {
    currentStatus: "Unplaced",
    canApplyRegular: "YES (Full Eligibility)",
    canApplyDream: "YES (Full Eligibility)",
    canApplySuperDream: "YES (Full Eligibility)",
    notes: "Can apply to any tier matching academic criteria."
  },
  {
    currentStatus: "Placed in Regular (< 8 LPA)",
    canApplyRegular: "BLOCKED (One-Offer Rule)",
    canApplyDream: "YES (Upgrade opportunity)",
    canApplySuperDream: "YES (Upgrade opportunity)",
    notes: "Permitted up to 2 upgrade attempts to higher tiers."
  },
  {
    currentStatus: "Placed in Dream (8 - 18 LPA)",
    canApplyRegular: "BLOCKED",
    canApplyDream: "BLOCKED (Same tier locked)",
    canApplySuperDream: "YES (Must offer >= 1.5x current CTC)",
    notes: "Permitted exactly 1 Super Dream upgrade shot."
  },
  {
    currentStatus: "Placed in Super Dream (>= 18 LPA)",
    canApplyRegular: "BLOCKED",
    canApplyDream: "BLOCKED",
    canApplySuperDream: "BLOCKED (Maximum tier reached)",
    notes: "Apex tier reached. Excluded from campus drives to ensure equitable offers for peers."
  }
];

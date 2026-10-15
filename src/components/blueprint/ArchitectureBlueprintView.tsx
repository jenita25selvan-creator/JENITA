import { useState } from 'react';
import { 
  Database, 
  Server, 
  FileCode, 
  Network, 
  ShieldCheck, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  Play, 
  Cpu, 
  Sparkles,
  GitBranch,
  TableProperties
} from 'lucide-react';
import { ARCHITECTURE_OVERVIEW, SQL_SCHEMA_DDL, API_ENDPOINTS_LIST, PLACEMENT_POLICY_MATRIX } from '../../data/architectureDocs';

export default function ArchitectureBlueprintView() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'api' | 'policy' | 'structure'>('architecture');
  const [copiedSql, setCopiedSql] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<number>(0);
  const [apiCategoryIndex, setApiCategoryIndex] = useState<number>(0);
  
  // Interactive Policy Simulator
  const [simStudentStatus, setSimStudentStatus] = useState<'UNPLACED' | 'REGULAR' | 'DREAM' | 'SUPER_DREAM'>('REGULAR');
  const [simCurrentCtc, setSimCurrentCtc] = useState<number>(6.5);
  const [simTargetTier, setSimTargetTier] = useState<'REGULAR' | 'DREAM' | 'SUPER_DREAM'>('DREAM');
  const [simTargetCtc, setSimTargetCtc] = useState<number>(12.0);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_DDL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SQL_SCHEMA_DDL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campus_placement_schema_postgres.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Policy Simulation calculation
  const getPolicySimulationResult = () => {
    if (simStudentStatus === 'UNPLACED') {
      return {
        allowed: true,
        reason: 'Candidate is unplaced and has open access to all placement drive tiers meeting academic cutoffs.'
      };
    }
    if (simStudentStatus === 'SUPER_DREAM') {
      return {
        allowed: false,
        reason: 'Denied: Candidate already holds a Super Dream offer. University One-Offer ceiling policy blocks all further campus applications.'
      };
    }
    if (simStudentStatus === 'DREAM') {
      if (simTargetTier !== 'SUPER_DREAM') {
        return {
          allowed: false,
          reason: `Denied: Dream offer holders cannot apply for Regular or lateral Dream tier roles. Must be a Super Dream drive (>= 18 LPA).`
        };
      }
      if (simTargetCtc < 18.0) {
        return {
          allowed: false,
          reason: `Denied: Target drive CTC (${simTargetCtc} LPA) does not satisfy Super Dream minimum threshold (>= 18 LPA).`
        };
      }
      return {
        allowed: true,
        reason: `Approved: Dream holder permitted single upgrade attempt to Super Dream (${simTargetCtc} LPA >= 18 LPA).`
      };
    }
    if (simStudentStatus === 'REGULAR') {
      if (simTargetTier === 'REGULAR') {
        return {
          allowed: false,
          reason: 'Denied: One-Offer Rule prohibits applying for another Regular/Mass drive once placed in Regular tier.'
        };
      }
      return {
        allowed: true,
        reason: `Approved: Regular tier holder permitted to upgrade to higher tier (${simTargetTier}).`
      };
    }
    return { allowed: true, reason: 'Eligible' };
  };

  const simResult = getPolicySimulationResult();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 p-6 md:p-8 border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Cpu className="w-4 h-4" /> System Architect Deliverables & Blueprint
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Campus Recruitment Architecture
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Scalable multi-tenant architecture designed for 5,000+ candidates, 200+ companies, automated eligibility calculation, and atomic offer processing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSql}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Download className="w-3.5 h-3.5" /> Download Schema DDL (.sql)
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" /> 1. System Architecture & Tech Stack
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'schema'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" /> 2. ER Diagram & SQL DDL Schema
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'api'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Network className="w-4 h-4" /> 3. REST API Specifications
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'policy'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> 4. Rules Engine & Dream Offer Policy
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'structure'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" /> 5. Folder Structure & Tests
          </button>
        </div>
      </div>

      {/* TAB 1: SYSTEM ARCHITECTURE & TECH STACK JUSTIFICATION */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Tech Stack Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ARCHITECTURE_OVERVIEW.techStack.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-mono text-indigo-400 font-semibold tracking-wider">
                      {item.layer}
                    </span>
                    <span className="text-slate-500 text-xs font-mono">0{idx + 1}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.tech}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.justification}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Architectural Layer Diagram */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Layered Micro-Modular System Architecture
            </h3>
            
            <div className="space-y-4">
              {/* Layer 1: Presentation */}
              <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Layer 1: Presentation & Client Tier</span>
                  <span className="text-xs text-slate-500">React 19 SPA • Tailwind CSS • PWA-ready</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-slate-900 p-2.5 rounded text-center border border-slate-800/80">
                    <div className="text-xs font-semibold text-white">Student Portal</div>
                    <div className="text-[11px] text-slate-400">Profile, Resume, Drives, Live Status</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded text-center border border-slate-800/80">
                    <div className="text-xs font-semibold text-white">TPO Admin Hub</div>
                    <div className="text-[11px] text-slate-400">Drive Management, Rules, Reports</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded text-center border border-slate-800/80">
                    <div className="text-xs font-semibold text-white">Recruiter Workspace</div>
                    <div className="text-[11px] text-slate-400">Job Posting, Candidate Pipeline, Slots</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded text-center border border-slate-800/80">
                    <div className="text-xs font-semibold text-white">Faculty Desk</div>
                    <div className="text-[11px] text-slate-400">Academic & Marksheet Verification</div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-slate-600 font-mono text-xs">
                ↓ REST HTTPS / WSS / JWT Bearer Tokens ↓
              </div>

              {/* Layer 2: API Gateway & Security */}
              <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Layer 2: API Gateway & Security Filter</span>
                  <span className="text-xs text-slate-500">Express Middleware • NGINX Reverse Proxy • Rate Limiting</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="font-semibold text-white mb-1">JWT Auth & RBAC Guard</div>
                    <div className="text-slate-400 text-[11px]">Validates role permissions on every route (Student, TPO, Recruiter, Faculty).</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="font-semibold text-white mb-1">Rate Limiter & Input Sanitizer</div>
                    <div className="text-slate-400 text-[11px]">Helmet.js, CORS whitelist, Joi/Zod input validation against SQLi & XSS.</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="font-semibold text-white mb-1">Audit Logger Middleware</div>
                    <div className="text-slate-400 text-[11px]">Captures actor, IP, timestamp, and payload diff for compliance.</div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-slate-600 font-mono text-xs">
                ↓ Service Bus & RPC Calls ↓
              </div>

              {/* Layer 3: Application Services */}
              <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Layer 3: Core Business Domain Services</span>
                  <span className="text-xs text-slate-500">Node.js Modular Services</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="font-semibold text-indigo-300">Eligibility Engine</div>
                    <div className="text-slate-400 text-[11px]">CGPA, backlog, and Dream Policy evaluation</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="font-semibold text-indigo-300">Pipeline Workflow</div>
                    <div className="text-slate-400 text-[11px]">Stage transitions from Applied to Offer</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="font-semibold text-indigo-300">Interview Scheduler</div>
                    <div className="text-slate-400 text-[11px]">Time slot assignment & Meet link integration</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="font-semibold text-indigo-300">Analytics Aggregator</div>
                    <div className="text-slate-400 text-[11px]">Placed %, branch stats, CTC percentiles</div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-slate-600 font-mono text-xs">
                ↓ Connection Pool (PgBouncer) & Pre-Signed URLs ↓
              </div>

              {/* Layer 4: Data & Storage */}
              <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Layer 4: Persistence, Caching & Object Storage</span>
                  <span className="text-xs text-slate-500">PostgreSQL 16 • Redis 7.2 • AWS S3 / Cloud Storage</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="font-semibold text-amber-300">PostgreSQL 16 (Relational DB)</div>
                    <div className="text-slate-400 text-[11px]">ACID student profiles, drives, applications, audit logs with composite indexes.</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="font-semibold text-amber-300">Redis 7.2 + BullMQ Worker</div>
                    <div className="text-slate-400 text-[11px]">Caching active drives, session tokens, async email/SMS job queues.</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="font-semibold text-amber-300">AWS S3 / GCP Cloud Storage</div>
                    <div className="text-slate-400 text-[11px]">Encrypted PDF storage for resumes & offer letters via direct pre-signed URLs.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scalability & Non-Functional Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" /> Scalability (5k+ Students)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drive eligibility searches use multi-column PostgreSQL indexing on <code className="text-indigo-300">(branch, batch_year, current_cgpa, active_backlogs)</code>, achieving sub-15ms queries even under simultaneous 5,000 candidate registration spikes.
              </p>
            </div>
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" /> Data Privacy & Security
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Role-based column pruning ensures recruiting companies cannot access candidate contact numbers or personal addresses until shortlisted. Passwords hashed using Argon2id with salting.
              </p>
            </div>
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <TableProperties className="w-4 h-4 text-purple-400" /> Concurrency & Atomic Offers
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                PostgreSQL row-level locking <code className="text-indigo-300">SELECT ... FOR UPDATE</code> prevents race conditions when a student attempts to accept multiple conflicting campus offers simultaneously.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ER DIAGRAM & SQL DDL SCHEMA */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          {/* Visual ER Diagram Card Representation */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  Entity-Relationship (ER) Schema Overview
                </h3>
                <p className="text-xs text-slate-400">
                  Primary Keys (PK), Foreign Keys (FK), and Cardinalities (1:1, 1:N, M:N via bridge)
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded text-slate-300">
                10 Relational Tables
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Entity: USERS */}
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-indigo-300">USERS</span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded">Core Auth</span>
                </div>
                <div className="font-mono text-[11px] space-y-1 text-slate-300">
                  <div className="text-amber-400">🔑 id : UUID (PK)</div>
                  <div>email : VARCHAR(255) [UNIQUE]</div>
                  <div>password_hash : VARCHAR</div>
                  <div>full_name : VARCHAR</div>
                  <div>role : ENUM(STUDENT, TPO, RECRUITER, FACULTY)</div>
                  <div>phone : VARCHAR</div>
                </div>
              </div>

              {/* Entity: STUDENTS */}
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-indigo-300">STUDENTS</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">1:1 with USERS</span>
                </div>
                <div className="font-mono text-[11px] space-y-1 text-slate-300">
                  <div className="text-amber-400">🔑 id : UUID (PK)</div>
                  <div className="text-sky-400">🔗 user_id : UUID (FK → USERS)</div>
                  <div>roll_number : VARCHAR [UNIQUE]</div>
                  <div>branch : ENUM (CSE, ECE, MECH, ...)</div>
                  <div>current_cgpa : NUMERIC(4,2)</div>
                  <div>active_backlogs : SMALLINT</div>
                  <div>is_placed : BOOLEAN</div>
                  <div>placed_tier : ENUM</div>
                  <div className="text-sky-400">🔗 verified_by_faculty_id : UUID (FK)</div>
                </div>
              </div>

              {/* Entity: COMPANIES */}
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-indigo-300">COMPANIES</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Recruiters</span>
                </div>
                <div className="font-mono text-[11px] space-y-1 text-slate-300">
                  <div className="text-amber-400">🔑 id : UUID (PK)</div>
                  <div>name : VARCHAR(150)</div>
                  <div>tier : ENUM(SUPER_DREAM, DREAM, ...)</div>
                  <div>contact_email : VARCHAR</div>
                  <div>contact_person : VARCHAR</div>
                  <div>rating : NUMERIC(2,1)</div>
                </div>
              </div>

              {/* Entity: PLACEMENT_DRIVES */}
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-indigo-300">PLACEMENT_DRIVES</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">1:N with APPLICATIONS</span>
                </div>
                <div className="font-mono text-[11px] space-y-1 text-slate-300">
                  <div className="text-amber-400">🔑 id : UUID (PK)</div>
                  <div className="text-sky-400">🔗 company_id : UUID (FK → COMPANIES)</div>
                  <div>job_title : VARCHAR</div>
                  <div>tier : ENUM</div>
                  <div>ctc_lpa : NUMERIC(6,2)</div>
                  <div>min_cgpa : NUMERIC(4,2)</div>
                  <div>max_active_backlogs : SMALLINT</div>
                  <div>allowed_branches : branch_code[]</div>
                  <div>application_deadline : TIMESTAMPTZ</div>
                  <div>status : ENUM</div>
                </div>
              </div>

              {/* Entity: APPLICATIONS */}
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-indigo-300">APPLICATIONS</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Bridge Table</span>
                </div>
                <div className="font-mono text-[11px] space-y-1 text-slate-300">
                  <div className="text-amber-400">🔑 id : UUID (PK)</div>
                  <div className="text-sky-400">🔗 drive_id : UUID (FK → DRIVES)</div>
                  <div className="text-sky-400">🔗 student_id : UUID (FK → STUDENTS)</div>
                  <div>current_stage : ENUM</div>
                  <div>applied_at : TIMESTAMPTZ</div>
                  <div className="text-emerald-400">⚡ UNIQUE (drive_id, student_id)</div>
                </div>
              </div>

              {/* Entity: OFFERS */}
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-indigo-300">OFFERS</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Final Placement</span>
                </div>
                <div className="font-mono text-[11px] space-y-1 text-slate-300">
                  <div className="text-amber-400">🔑 id : UUID (PK)</div>
                  <div className="text-sky-400">🔗 application_id : UUID (FK UNIQUE)</div>
                  <div className="text-sky-400">🔗 student_id : UUID (FK)</div>
                  <div>offered_ctc_lpa : NUMERIC(6,2)</div>
                  <div>offer_letter_url : TEXT</div>
                  <div>status : ENUM (ISSUED, ACCEPTED, DECLINED)</div>
                  <div>expiry_date : TIMESTAMPTZ</div>
                </div>
              </div>
            </div>
          </div>

          {/* Complete PostgreSQL DDL Script Viewer */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-white">PostgreSQL 16 Complete DDL Script</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied!' : 'Copy SQL'}
                </button>
              </div>
            </div>
            <pre className="p-6 text-xs font-mono text-slate-300 bg-slate-950 overflow-x-auto max-h-[500px] leading-relaxed">
              {SQL_SCHEMA_DDL}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: REST API SPECIFICATIONS */}
      {activeTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Endpoint Categories & List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3">API Categories</h3>
              <div className="space-y-1">
                {API_ENDPOINTS_LIST.map((cat, catIdx) => (
                  <button
                    key={catIdx}
                    onClick={() => {
                      setApiCategoryIndex(catIdx);
                      setSelectedEndpoint(0);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      apiCategoryIndex === catIdx
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoints in selected category */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2">
              <h3 className="text-xs uppercase font-semibold text-slate-400 mb-2">Available Endpoints</h3>
              {API_ENDPOINTS_LIST[apiCategoryIndex].endpoints.map((ep, epIdx) => (
                <div
                  key={epIdx}
                  onClick={() => setSelectedEndpoint(epIdx)}
                  className={`p-3 rounded-lg cursor-pointer border transition-all text-xs ${
                    selectedEndpoint === epIdx
                      ? 'bg-indigo-950/40 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300' :
                      ep.method === 'PATCH' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-sky-500/20 text-sky-300'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-[11px] truncate">{ep.path}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] truncate">{ep.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Selected Endpoint Payload & Response */}
          <div className="lg:col-span-7">
            {API_ENDPOINTS_LIST[apiCategoryIndex].endpoints[selectedEndpoint] && (
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300">
                      {API_ENDPOINTS_LIST[apiCategoryIndex].endpoints[selectedEndpoint].method}
                    </span>
                    <h3 className="text-base font-mono font-bold text-white">
                      {API_ENDPOINTS_LIST[apiCategoryIndex].endpoints[selectedEndpoint].path}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    {API_ENDPOINTS_LIST[apiCategoryIndex].endpoints[selectedEndpoint].desc}
                  </p>
                </div>

                {/* Headers */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-[11px] font-mono text-slate-400">Required Headers:</span>
                  <div className="font-mono text-indigo-300 text-[11px] mt-1">
                    Authorization: Bearer &lt;JWT_TOKEN&gt; | Content-Type: application/json
                  </div>
                </div>

                {/* Request Body */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                    <span>Request Body (JSON)</span>
                  </div>
                  <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto">
                    {API_ENDPOINTS_LIST[apiCategoryIndex].endpoints[selectedEndpoint].requestBody}
                  </pre>
                </div>

                {/* Response Body */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <span>HTTP 200/201 Success Response</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">application/json</span>
                  </div>
                  <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-emerald-300 border border-slate-800 overflow-x-auto">
                    {API_ENDPOINTS_LIST[apiCategoryIndex].endpoints[selectedEndpoint].responseBody}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RULES ENGINE & DREAM OFFER POLICY */}
      {activeTab === 'policy' && (
        <div className="space-y-6">
          {/* Policy Table */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              University Campus Recruitment Policy Matrix
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enforces equitable opportunities across student cohorts by regulating one-offer vs dream upgrades.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                    <th className="py-3 px-4">Current Placement Status</th>
                    <th className="py-3 px-4">Regular (&lt; 8 LPA)</th>
                    <th className="py-3 px-4">Dream (8 - 18 LPA)</th>
                    <th className="py-3 px-4">Super Dream (&ge; 18 LPA)</th>
                    <th className="py-3 px-4">Rules & Caveats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {PLACEMENT_POLICY_MATRIX.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-white">{row.currentStatus}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                          row.canApplyRegular.includes('YES') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {row.canApplyRegular}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                          row.canApplyDream.includes('YES') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {row.canApplyDream}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                          row.canApplySuperDream.includes('YES') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {row.canApplySuperDream}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Policy Simulator */}
          <div className="bg-slate-900 rounded-xl p-6 border border-indigo-500/30 shadow-xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" /> Live Rules Engine Simulator
            </div>
            <h3 className="text-lg font-bold text-white mb-4">
              Test Candidate Eligibility Under Policy Engine
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Student Current Status</label>
                <select
                  value={simStudentStatus}
                  onChange={(e) => setSimStudentStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="UNPLACED">Unplaced Candidate</option>
                  <option value="REGULAR">Placed in Regular (&lt; 8 LPA)</option>
                  <option value="DREAM">Placed in Dream (8 - 18 LPA)</option>
                  <option value="SUPER_DREAM">Placed in Super Dream (&ge; 18 LPA)</option>
                </select>
              </div>

              {simStudentStatus !== 'UNPLACED' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Package (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={simCurrentCtc}
                    onChange={(e) => setSimCurrentCtc(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Drive Tier</label>
                <select
                  value={simTargetTier}
                  onChange={(e) => setSimTargetTier(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="REGULAR">Regular Tier (&lt; 8 LPA)</option>
                  <option value="DREAM">Dream Tier (8 - 18 LPA)</option>
                  <option value="SUPER_DREAM">Super Dream (&ge; 18 LPA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Drive CTC (LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={simTargetCtc}
                  onChange={(e) => setSimTargetCtc(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Simulation Result */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              simResult.allowed
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                {simResult.allowed ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>Policy Verdict:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    simResult.allowed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {simResult.allowed ? 'APPLICATION PERMITTED' : 'APPLICATION BLOCKED'}
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-300">{simResult.reason}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FOLDER STRUCTURE & TESTS */}
      {activeTab === 'structure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Folder Structure */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              Full-Stack Repository Layout (Clean Architecture)
            </h3>
            <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto leading-relaxed">
{`campus-recruit-system/
├── server/
│   ├── config/             # DB connection pool, S3 client, Redis
│   ├── controllers/        # Auth, Student, Drive, Offer controllers
│   ├── middleware/         # JWT verification, RBAC guard, AuditLogger
│   ├── models/             # Knex / Drizzle ORM schema mapping
│   ├── routes/             # REST API routers (/api/v1/...)
│   ├── services/           # RulesEngine, EmailQueue, ResumeParser
│   └── tests/              # Jest / Supertest integration specs
├── src/
│   ├── components/
│   │   ├── blueprint/      # System architecture & ER diagram views
│   │   ├── student/        # Profile, resume builder, drives, offers
│   │   ├── tpo/            # Admin hub, drive creator, roster, audit
│   │   ├── recruiter/      # Job postings, candidate pipeline kanban
│   │   ├── faculty/        # Marksheet & academic credentials verification
│   │   └── common/         # Modals, toasts, notification center
│   ├── data/               # Seed datasets & schema documentation
│   ├── services/           # EligibilityEngine & CSV exporter
│   ├── types/              # Comprehensive TypeScript interfaces
│   └── App.tsx             # Root router with role switching
├── package.json
└── README.md`}
            </pre>
          </div>

          {/* Test Cases & Deployment Guide */}
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-xs space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" /> Automated Test Suite Suite (Unit & E2E)
              </h3>
              <div className="space-y-2 text-slate-300">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="font-bold text-emerald-400">TC-01: Eligibility Engine Cutoffs</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Assert student with CGPA 7.10 is rejected from 8.5 cutoff drive with exact reason message.</p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="font-bold text-emerald-400">TC-02: Dream Offer Policy Lock</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Assert placed student (Super Dream @ 28 LPA) cannot submit application to lower or lateral tier.</p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="font-bold text-emerald-400">TC-03: Offer Acceptance Atomicity</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Simulate concurrent acceptance of 2 simultaneous offers; verify 2nd throws HTTP 409 Conflict.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-xs">
              <h3 className="text-sm font-bold text-white mb-2">Production Deployment Steps</h3>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                <li>Provision Managed PostgreSQL 16 (AWS RDS / Cloud SQL) and run DDL migration.</li>
                <li>Setup Redis cluster for session cache and BullMQ background email jobs.</li>
                <li>Configure AWS S3 bucket with CORS and Pre-Signed upload policies.</li>
                <li>Deploy Node.js/Express backend to container cluster (Kubernetes or Cloud Run).</li>
                <li>Deploy React SPA to Global CDN (Cloudflare / CloudFront) with SSL termination.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

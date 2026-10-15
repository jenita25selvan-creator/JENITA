import { StudentProfile, PlacementDrive, Application } from '../types';

export function exportStudentsToCsv(students: StudentProfile[]): void {
  const headers = [
    'Roll Number',
    'Register Number',
    'Full Name',
    'Branch',
    'Batch Year',
    'Current CGPA',
    'Active Backlogs',
    '10th %',
    '12th %',
    'Verification Status',
    'Is Placed',
    'Placed Tier',
    'Highest Package (LPA)',
    'Email',
    'Phone'
  ];

  const rows = students.map(s => [
    s.rollNumber,
    s.registerNumber,
    `"${s.fullName}"`,
    s.branch,
    s.batchYear,
    s.currentCgpa.toFixed(2),
    s.activeBacklogs,
    s.tenthPercentage,
    s.twelfthPercentage,
    s.verificationStatus,
    s.isPlaced ? 'YES' : 'NO',
    s.placedTier || 'N/A',
    s.highestOfferLpa ? `${s.highestOfferLpa} LPA` : '0',
    s.email,
    s.phone
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Campus_Placement_Student_Roster_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportDrivesReportToCsv(drives: PlacementDrive[], applications: Application[]): void {
  const headers = [
    'Drive ID',
    'Company Name',
    'Job Title',
    'Tier',
    'CTC (LPA)',
    'Min CGPA',
    'Eligible Branches',
    'Application Deadline',
    'Status',
    'Total Applicants',
    'Shortlisted',
    'Offers Extended'
  ];

  const rows = drives.map(d => {
    const driveApps = applications.filter(a => a.driveId === d.id);
    const shortlistedCount = driveApps.filter(a => a.currentStage !== 'APPLIED' && a.currentStage !== 'REJECTED').length;
    const offersCount = driveApps.filter(a => a.currentStage === 'OFFER_EXTENDED' || a.currentStage === 'OFFER_ACCEPTED').length;

    return [
      d.id,
      `"${d.companyName}"`,
      `"${d.jobTitle}"`,
      d.tier,
      d.ctcLpa,
      d.eligibility.minCgpa,
      `"${d.eligibility.allowedBranches.join(';')}"`,
      d.applicationDeadline.split('T')[0],
      d.status,
      driveApps.length,
      shortlistedCount,
      offersCount
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Campus_Placement_Drives_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

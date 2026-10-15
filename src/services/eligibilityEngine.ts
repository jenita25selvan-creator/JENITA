import { StudentProfile, PlacementDrive, EligibilityResult, DriveTier } from '../types';

export const TIER_CONFIG: Record<DriveTier, { label: string; minLpa: number; badgeColor: string }> = {
  SUPER_DREAM: { label: 'Super Dream', minLpa: 18, badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  DREAM: { label: 'Dream', minLpa: 8, badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  CORE: { label: 'Core / Engineering', minLpa: 6, badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  REGULAR: { label: 'Regular / Mass', minLpa: 0, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
};

/**
 * Evaluates whether a student meets all eligibility criteria for a given placement drive,
 * including academic cutoffs and the university's placement rules engine (Dream/One-Offer Policy).
 */
export function evaluateEligibility(
  student: StudentProfile,
  drive: PlacementDrive
): EligibilityResult {
  const criteria = drive.eligibility;
  const reasons: string[] = [];

  // 1. CGPA Check
  const cgpaMet = student.currentCgpa >= criteria.minCgpa;
  if (!cgpaMet) {
    reasons.push(`CGPA is ${student.currentCgpa.toFixed(2)}, which is below required ${criteria.minCgpa.toFixed(2)}`);
  }

  // 2. 10th Standard Percentage
  const tenthMet = student.tenthPercentage >= criteria.minTenthPercent;
  if (!tenthMet) {
    reasons.push(`10th standard score is ${student.tenthPercentage}%, below required ${criteria.minTenthPercent}%`);
  }

  // 3. 12th Standard Percentage
  const twelfthMet = student.twelfthPercentage >= criteria.minTwelfthPercent;
  if (!twelfthMet) {
    reasons.push(`12th standard score is ${student.twelfthPercentage}%, below required ${criteria.minTwelfthPercent}%`);
  }

  // 4. Backlog Constraints
  const activeBacklogsMet = student.activeBacklogs <= criteria.maxActiveBacklogs;
  const historyBacklogsMet = student.historyBacklogs <= criteria.maxHistoryBacklogs;
  const backlogsMet = activeBacklogsMet && historyBacklogsMet;
  if (!activeBacklogsMet) {
    reasons.push(`Active backlogs (${student.activeBacklogs}) exceed maximum allowed (${criteria.maxActiveBacklogs})`);
  }
  if (!historyBacklogsMet) {
    reasons.push(`Historical backlogs (${student.historyBacklogs}) exceed maximum allowed (${criteria.maxHistoryBacklogs})`);
  }

  // 5. Eligible Branches
  const branchMet = criteria.allowedBranches.includes(student.branch);
  if (!branchMet) {
    reasons.push(`Branch ${student.branch} is not eligible. Allowed branches: ${criteria.allowedBranches.join(', ')}`);
  }

  // 6. Batch Year
  const batchMet = criteria.batchYears.includes(student.batchYear);
  if (!batchMet) {
    reasons.push(`Batch year ${student.batchYear} is not eligible for this drive`);
  }

  // 7. University Placement Rules Engine (One-Offer & Dream Upgrade Policy)
  let placementPolicyMet = true;
  let canApplyUnderPolicy = true;

  if (student.isPlaced) {
    const studentPlacedTier = student.placedTier || 'REGULAR';
    const driveTier = drive.tier;

    // Super Dream holders are blocked from applying to any further campus drives
    if (studentPlacedTier === 'SUPER_DREAM') {
      placementPolicyMet = false;
      canApplyUnderPolicy = false;
      reasons.push(`Policy Block: You hold a Super Dream offer (${student.highestOfferLpa} LPA). University policy permits only one Super Dream offer.`);
    } 
    // Dream offer holders can only apply to Super Dream drives (>= 18 LPA)
    else if (studentPlacedTier === 'DREAM') {
      if (driveTier !== 'SUPER_DREAM') {
        placementPolicyMet = false;
        canApplyUnderPolicy = false;
        reasons.push(`Policy Block: You hold a Dream offer (${student.highestOfferLpa} LPA). You may only upgrade to Super Dream drives (>= 18 LPA).`);
      } else if (drive.ctcLpa <= (student.highestOfferLpa || 0)) {
        placementPolicyMet = false;
        canApplyUnderPolicy = false;
        reasons.push(`Policy Block: Super Dream CTC (${drive.ctcLpa} LPA) must be higher than current offer (${student.highestOfferLpa} LPA).`);
      }
    } 
    // Regular offer holders can upgrade to Dream or Super Dream
    else if (studentPlacedTier === 'REGULAR' || studentPlacedTier === 'CORE') {
      if (driveTier === 'REGULAR') {
        placementPolicyMet = false;
        canApplyUnderPolicy = false;
        reasons.push(`Policy Block: You already hold a Regular/Core offer. Applying for another Regular tier drive is prohibited.`);
      }
    }
  }

  // 8. Academic Verification Check
  if (student.verificationStatus === 'REJECTED_FLAGGED') {
    placementPolicyMet = false;
    reasons.push(`Academic Profile Flagged: Your academic data was rejected by Faculty. Please resolve discrepancy.`);
  }

  const isEligible = 
    cgpaMet &&
    tenthMet &&
    twelfthMet &&
    backlogsMet &&
    branchMet &&
    batchMet &&
    placementPolicyMet;

  return {
    isEligible,
    canApplyUnderPolicy,
    reasons,
    criteriaBreakdown: {
      cgpaMet,
      tenthMet,
      twelfthMet,
      backlogsMet,
      branchMet,
      batchMet,
      placementPolicyMet,
    },
  };
}

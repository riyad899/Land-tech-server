import { prisma } from "../../lib/prisma";

export interface EvaluationResult {
  overallRiskLevel: "INFORMATION" | "REVIEW_REQUIRED" | "HIGH_PRIORITY" | "INSUFFICIENT_DATA";
  findings: Array<{
    ruleId: string;
    severity: "INFORMATION" | "REVIEW_REQUIRED" | "HIGH_PRIORITY" | "INSUFFICIENT_DATA";
    titleBengali: string;
    descriptionBengali: string;
    evidenceJson: any;
    missingInfo?: string;
    recommendedActionBengali: string;
    legalContext?: string;
  }>;
  comparisonSummary: {
    recordsExaminedCount: number;
    csRecord?: any;
    saRecord?: any;
    rsRecord?: any;
    bsRecord?: any;
    deedsCount: number;
    areaChanges: Array<{ survey: string; area: number }>;
  };
}

export const analyzeCase = async (landCaseId: string): Promise<EvaluationResult> => {
  const landCase = await prisma.landCase.findUnique({
    where: { id: landCaseId },
    include: {
      records: true,
      deeds: {
        include: { transfers: true },
      },
      documents: true,
    },
  });

  if (!landCase) {
    throw new Error("Land case not found");
  }

  const records = landCase.records;
  const deeds = landCase.deeds;

  const findings: EvaluationResult["findings"] = [];

  // Group records by survey type
  const cs = records.find((r) => r.surveyType === "CS");
  const sa = records.find((r) => r.surveyType === "SA");
  const rs = records.find((r) => r.surveyType === "RS");
  const bs = records.find((r) => r.surveyType === "BS" || r.surveyType === "BRS");

  // 1. Data sufficiency check
  if (records.length < 2 && deeds.length === 0) {
    findings.push({
      ruleId: "RULE_INSUFFICIENT_DATA",
      severity: "INSUFFICIENT_DATA",
      titleBengali: "তথ্য অপর্যাপ্ত — অতিরিক্ত জরিপ রেকর্ড প্রয়োজন",
      descriptionBengali: "তুলনা করার মতো পর্যাপ্ত জরিপ (CS, SA, RS, BS) বা বায়া দলিলের তথ্য সিস্টেমে জমা পড়েনি। একটিমাত্র রেকর্ডের ভিত্তিতে কোনো ঝুঁকি বিশ্লেষণ সম্ভব নয়।",
      evidenceJson: { availableRecordCount: records.length, availableDeedCount: deeds.length },
      missingInfo: "সিএস, এসএ বা আরএস খতিয়ানের কপি এবং বায়া দলিলের তালিকা অনুপস্থিত।",
      recommendedActionBengali: "জেলা প্রশাসকের রেকর্ড রুম বা সহকারী কমিশনার (ভূমি) অফিস হতে পূর্ববর্তী খতিয়ানের জাবেদা নকল সংগ্রহ করে আপলোড করুন।",
      legalContext: "রেজিস্ট্রেশন আইন ১৯০৮ এর ধারা ৫২ক অনুযায়ী পূর্ববর্তী মালিকানা প্রমাণে নথিপত্র আবশ্যক।",
    });
  }

  // 2. Land area inconsistency check across surveys
  const surveyAreas: Array<{ survey: string; area: number; khatian: string; dag: string }> = [];
  if (cs) surveyAreas.push({ survey: "CS", area: cs.landAreaAcre, khatian: cs.khatianNumber, dag: cs.dagNumber });
  if (sa) surveyAreas.push({ survey: "SA", area: sa.landAreaAcre, khatian: sa.khatianNumber, dag: sa.dagNumber });
  if (rs) surveyAreas.push({ survey: "RS", area: rs.landAreaAcre, khatian: rs.khatianNumber, dag: rs.dagNumber });
  if (bs) surveyAreas.push({ survey: "BS", area: bs.landAreaAcre, khatian: bs.khatianNumber, dag: bs.dagNumber });

  if (surveyAreas.length >= 2) {
    for (let i = 0; i < surveyAreas.length - 1; i++) {
      const current = surveyAreas[i];
      const next = surveyAreas[i + 1];

      const diff = next.area - current.area;
      const percentChange = (diff / (current.area || 1)) * 100;

      // Suspicious area expansion (> 10% increase)
      if (percentChange > 10) {
        findings.push({
          ruleId: "RULE_SURVEY_AREA_INFLATION",
          severity: percentChange > 25 ? "HIGH_PRIORITY" : "REVIEW_REQUIRED",
          titleBengali: `জরিপে অস্বাভাবিক জমি বৃদ্ধি (${current.survey} বনাম ${next.survey})`,
          descriptionBengali: `${current.survey} খতিয়ানে জমির পরিমাণ ছিল ${current.area} একর, কিন্তু পরবর্তী ${next.survey} খতিয়ানে তা বৃদ্ধি পেয়ে ${next.area} একর হয়েছে (বৃদ্ধি প্রায় ${percentChange.toFixed(1)}%)। কোনো বৈধ অধিগ্রহণ বা পুনঃবণ্টন ব্যতিরেকে এই স্ফীতি খাস বা পার্শ্ববর্তী দাগের জমি অন্তর্ভুক্তির ঝুঁকি নির্দেশ করে।`,
          evidenceJson: {
            previousSurvey: current.survey,
            previousAreaAcre: current.area,
            nextSurvey: next.survey,
            nextAreaAcre: next.area,
            differenceAcre: diff,
          },
          missingInfo: "জমির আয়তন বৃদ্ধির স্বপক্ষে সহকারী কমিশনার (ভূমি) এর সংশোধন আদেশ বা জমাভাগ নথি।",
          recommendedActionBengali: "স্থানীয় এসিল্যান্ড কার্যালয়ের মিসকেস রেকর্ড এবং সার্ভেয়ার দ্বারা সরেজমিনে দাগের সীমানা ডিমারকেশন (Demarcation) যাচাই করুন।",
          legalContext: "ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩ অনুযায়ী ভুয়া রেকর্ডে জমির আয়তন বৃদ্ধি দণ্ডনীয়।",
        });
      } else if (percentChange < -15) {
        // Area drop
        findings.push({
          ruleId: "RULE_SURVEY_AREA_DEFLATION",
          severity: "REVIEW_REQUIRED",
          titleBengali: `জরিপে জমির পরিমাণ হ্রাস (${current.survey} বনাম ${next.survey})`,
          descriptionBengali: `${current.survey} জরিপ হতে ${next.survey} জরিপে জমির পরিমাণ ${Math.abs(percentChange).toFixed(1)}% কমে গেছে (${current.area} একর থেকে কমে ${next.area} একর)। পূর্ববর্তী মালিক কর্তৃক অংশবিশেষ বিক্রয় বা সিকস্তি হতে পারে।`,
          evidenceJson: {
            previousSurvey: current.survey,
            previousAreaAcre: current.area,
            nextSurvey: next.survey,
            nextAreaAcre: next.area,
          },
          missingInfo: "জমি হ্রাসের কারণ হিসেবে বায়া দলিল বা জমাভাগ কেস নথি।",
          recommendedActionBengali: "অন্যান্য শরিকদের নামে পৃথক বাটা দাগ বা খতিয়ান হয়েছে কি না তা যাচাই করুন।",
          legalContext: "স্টেট একুইজিশন অ্যান্ড টেন্যান্সি অ্যাক্ট ১৯৫০ এর ১৪৩ ধারা।",
        });
      }
    }
  }

  // 3. Duplicate sale & Overlapping transfers check
  if (deeds.length > 0) {
    // Total transferred area across all recorded deeds for these plots
    const totalDeedArea = deeds.reduce((sum, d) => sum + (d.landAreaAcre || 0), 0);
    const maxReferenceArea = bs?.landAreaAcre || rs?.landAreaAcre || cs?.landAreaAcre || 0;

    if (maxReferenceArea > 0 && totalDeedArea > maxReferenceArea + 0.02) {
      findings.push({
        ruleId: "RULE_DUPLICATE_SALE_OVERSELL",
        severity: "HIGH_PRIORITY",
        titleBengali: "দ্বৈত বিক্রয় বা অতিরিক্ত হিস্যা বিক্রয়ের প্রবল ঝুঁকি",
        descriptionBengali: `রেকর্ডভুক্ত দলিলের মোট বিক্রিত জমির পরিমাণ (${totalDeedArea.toFixed(2)} একর) মূল খতিয়ানের মোট অনুমোদিত জমির (${maxReferenceArea.toFixed(2)} একর) চেয়ে বেশি। একই দাগে মালিকের প্রাপ্য হিস্যার অতিরিক্ত জমি হস্তান্তর করা হয়েছে যা সরাসরি দ্বৈত বিক্রয় বা জালিয়াতির লক্ষণ।`,
        evidenceJson: {
          totalDeedAreaAcre: totalDeedArea,
          maxReferenceAreaAcre: maxReferenceArea,
          deeds: deeds.map((d) => ({
            deedNumber: d.deedNumber,
            date: d.deedDate,
            soldArea: d.landAreaAcre,
            seller: d.sellerNames,
            buyer: d.buyerNames,
          })),
        },
        missingInfo: "উক্ত দাগে বিক্রেতার কোনো অতিরিক্ত উত্তরাধিকার বা দানপত্রের প্রমাণপত্র।",
        recommendedActionBengali: "অবিলম্বে সাব-রেজিস্ট্রি অফিসের বালাম বহি (Volume Book) তল্লাশি দিন এবং এনআইডি নম্বর মিলিয়ে বিক্রেতার পূর্বের বিক্রয়সমূহ যাচাই করুন।",
        legalContext: "ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩ এর ৪ ও ৫ ধারা অনুযায়ী দ্বৈত বিক্রয় অজামিনযোগ্য অপরাধ।",
      });
    }

    // Check multiple deeds by the same seller for the same plot to different buyers on conflicting dates
    for (let i = 0; i < deeds.length; i++) {
      for (let j = i + 1; j < deeds.length; j++) {
        const d1 = deeds[i];
        const d2 = deeds[j];

        const sameSellers = d1.sellerNames.some((s) => d2.sellerNames.includes(s));
        const diffBuyers = !d1.buyerNames.some((b) => d2.buyerNames.includes(b));

        if (sameSellers && diffBuyers) {
          findings.push({
            ruleId: "RULE_SUSPICIOUS_MULTIPLE_TRANSFERS",
            severity: "HIGH_PRIORITY",
            titleBengali: `একই বিক্রেতা কর্তৃক একাধিক ব্যক্তির নিকট দলিল সম্পাদন (দলিল নং ${d1.deedNumber} ও ${d2.deedNumber})`,
            descriptionBengali: `বিক্রেতা ${d1.sellerNames.join(", ")} একই মৌজা ও দাগে একাধিক পৃথক ক্রেতার (${d1.buyerNames.join(", ")} এবং ${d2.buyerNames.join(", ")}) অনুকূলে দলিল সম্পাদন করেছেন।`,
            evidenceJson: {
              deed1: { number: d1.deedNumber, date: d1.deedDate, buyer: d1.buyerNames },
              deed2: { number: d2.deedNumber, date: d2.deedDate, buyer: d2.buyerNames },
            },
            recommendedActionBengali: "দলিল দুটি বাতিল মোকদ্দমার আওতাধীন কি না এবং প্রথম দলিলের পর বিক্রেতার কোনো অবশিষ্ট জমি অবশিষ্ট ছিল কি না তা দেওয়ানি আদালত ও সাব-রেজিস্ট্রি অফিসে যাচাই করুন।",
            legalContext: "সম্পত্তি হস্তান্তর আইন ১৮৮২ এর ৪৮ ধারা (Prior rights of prior transfer).",
          });
        }
      }
    }
  }

  // 4. Broken ownership chain check
  if (records.length >= 2) {
    const earliestRecord = cs || sa || rs;
    const latestRecord = bs || rs;

    if (earliestRecord && latestRecord && earliestRecord !== latestRecord) {
      const originalOwners = earliestRecord.ownerNames;
      const currentOwners = latestRecord.ownerNames;

      // Check if any name matches or if deeds bridge the gap
      const hasDirectNameMatch = originalOwners.some((o) =>
        currentOwners.some((c) => c.toLowerCase().includes(o.toLowerCase()) || o.toLowerCase().includes(c.toLowerCase())),
      );

      const hasDeeds = deeds.length > 0;

      if (!hasDirectNameMatch && !hasDeeds) {
        findings.push({
          ruleId: "RULE_BROKEN_CHAIN_OF_TITLE",
          severity: "REVIEW_REQUIRED",
          titleBengali: `মালিকানার ধারাবাহিকতায় বিচ্ছিন্নতা (${earliestRecord.surveyType} থেকে ${latestRecord.surveyType})`,
          descriptionBengali: `${earliestRecord.surveyType} খতিয়ানের মূল রেকর্ডীয় মালিক (${originalOwners.join(", ")}) এবং বর্তমান ${latestRecord.surveyType} খতিয়ানের মালিকের (${currentOwners.join(", ")}) মধ্যে কোনো বায়া দলিল বা উত্তরাধিকারের দলিল সংযোগ নথিভুক্ত নেই।`,
          evidenceJson: {
            earliestSurvey: earliestRecord.surveyType,
            earliestOwners: originalOwners,
            latestSurvey: latestRecord.surveyType,
            latestOwners: currentOwners,
          },
          missingInfo: "২৫ বছরের ধারাবাহিক বায়া দলিল (Chain of Deeds) অথবা রেজিস্ট্রিকৃত ওয়ারিশ কাযেম সনদ।",
          recommendedActionBengali: "সিএস/এসএ থেকে বিএস পর্যন্ত ধারাবাহিক হস্তান্তর দলিল ও খাজনা দাখিলার কপি পর্যালোচনা করুন।",
          legalContext: "রেজিস্ট্রেশন আইন ১৯০৮ এর ধারা ৫২ক অনুযায়ী বায়া দলিলের শৃঙ্খলা প্রমাণ আবশ্যক।",
        });
      }
    }
  }

  // 5. Default information finding if no critical risk is found
  if (findings.length === 0 && records.length >= 2) {
    findings.push({
      ruleId: "RULE_NO_OBVIOUS_INCONSISTENCY",
      severity: "INFORMATION",
      titleBengali: "পরীক্ষিত রেকর্ডসমূহে দৃশ্যমান কোনো বড় অসংগতি পাওয়া যায়নি",
      descriptionBengali: "উপস্থাপিত খতিয়ান ও দলিলের তথ্য অনুযায়ী দাগ, মৌজা এবং জমির পরিমাণে আপাতদৃষ্টিতে সামঞ্জস্য বিদ্যমান। তবে এটি কোনো আইনি মালিকানার সনদ নয়, চূড়ান্ত ক্রয়ের পূর্বে সরেজমিন দখলি স্বত্ব যাচাই করুন।",
      evidenceJson: { recordsChecked: records.length, deedsChecked: deeds.length },
      recommendedActionBengali: "সরেজমিনে জমি পরিমাপ এবং স্থানীয় ভূমি অফিসে নামজারির বৈধতা যাচাই সম্পন্ন করুন।",
      legalContext: "নিয়মিত ভূমি যাচাই নীতিমালা।",
    });
  }

  // Determine overall severity
  let overallRiskLevel: EvaluationResult["overallRiskLevel"] = "INFORMATION";
  if (findings.some((f) => f.severity === "HIGH_PRIORITY")) {
    overallRiskLevel = "HIGH_PRIORITY";
  } else if (findings.some((f) => f.severity === "REVIEW_REQUIRED")) {
    overallRiskLevel = "REVIEW_REQUIRED";
  } else if (findings.some((f) => f.severity === "INSUFFICIENT_DATA")) {
    overallRiskLevel = "INSUFFICIENT_DATA";
  }

  // Update Case in DB
  await prisma.landCase.update({
    where: { id: landCaseId },
    data: {
      status: overallRiskLevel === "HIGH_PRIORITY" ? "HIGH_PRIORITY" : overallRiskLevel === "REVIEW_REQUIRED" ? "REVIEW_REQUIRED" : "VERIFIED",
      overallRiskLevel,
    },
  });

  // Save findings in DB
  // Clean up previous pending findings for fresh analysis
  await prisma.riskFinding.deleteMany({
    where: { landCaseId, status: "PENDING" },
  });

  for (const finding of findings) {
    await prisma.riskFinding.create({
      data: {
        landCaseId,
        ruleId: finding.ruleId,
        severity: finding.severity,
        titleBengali: finding.titleBengali,
        descriptionBengali: finding.descriptionBengali,
        evidenceJson: finding.evidenceJson,
        missingInfo: finding.missingInfo,
        recommendedActionBengali: finding.recommendedActionBengali,
        legalContext: finding.legalContext,
        status: "PENDING",
      },
    });
  }

  // Record comparison summary
  const comparisonSummary: EvaluationResult["comparisonSummary"] = {
    recordsExaminedCount: records.length,
    csRecord: cs,
    saRecord: sa,
    rsRecord: rs,
    bsRecord: bs,
    deedsCount: deeds.length,
    areaChanges: surveyAreas.map((s) => ({ survey: s.survey, area: s.area })),
  };

  await prisma.recordComparison.create({
    data: {
      landCaseId,
      summaryBengali: `মোট ${records.length} টি জরিপ রেকর্ড এবং ${deeds.length} টি দলিলের তথ্য তুলনা করা হয়েছে। ঝুঁকি স্তর: ${overallRiskLevel}।`,
      mismatchesJson: findings,
      matchedFields: { mouza: landCase.mouza, district: landCase.district, upazila: landCase.upazila },
    },
  });

  return {
    overallRiskLevel,
    findings,
    comparisonSummary,
  };
};

export const FraudDetectionService = {
  analyzeCase,
};

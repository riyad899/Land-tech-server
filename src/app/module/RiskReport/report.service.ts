import { prisma } from "../../lib/prisma";

const generateCaseReport = async (landCaseId: string) => {
  const landCase = await prisma.landCase.findUnique({
    where: { id: landCaseId },
    include: {
      records: { orderBy: { createdAt: "asc" } },
      deeds: { include: { transfers: true }, orderBy: { deedDate: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      findings: { orderBy: { severity: "desc" } },
      comparisons: { orderBy: { createdAt: "desc" }, take: 1 },
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  if (!landCase) {
    throw new Error("Land case not found");
  }

  const reportData = {
    reportId: `REP-${landCase.caseNumber}`,
    generatedAt: new Date().toISOString(),
    generatedAtBengali: new Intl.DateTimeFormat("bn-BD", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Dhaka",
    }).format(new Date()),
    case: {
      id: landCase.id,
      caseNumber: landCase.caseNumber,
      title: landCase.title,
      district: landCase.district,
      upazila: landCase.upazila,
      mouza: landCase.mouza,
      jlNumber: landCase.jlNumber,
      primaryKhatian: landCase.primaryKhatian,
      primaryDag: landCase.primaryDag,
      overallRiskLevel: landCase.overallRiskLevel,
      status: landCase.status,
    },
    examinedRecords: landCase.records.map((r) => ({
      surveyType: r.surveyType,
      khatianNumber: r.khatianNumber,
      dagNumber: r.dagNumber,
      landAreaAcre: r.landAreaAcre,
      landClass: r.landClass,
      ownerNames: r.ownerNames,
      confidenceScore: r.confidenceScore,
      sourceLabel: r.sourceLabel,
    })),
    examinedDeeds: landCase.deeds.map((d) => ({
      deedNumber: d.deedNumber,
      deedDate: d.deedDate,
      subRegistryOffice: d.subRegistryOffice,
      sellerNames: d.sellerNames,
      buyerNames: d.buyerNames,
      landAreaAcre: d.landAreaAcre,
      plots: d.plotDagNumbers,
    })),
    findings: landCase.findings.map((f) => ({
      ruleId: f.ruleId,
      severity: f.severity,
      title: f.titleBengali,
      description: f.descriptionBengali,
      evidence: f.evidenceJson,
      missingInfo: f.missingInfo,
      recommendedAction: f.recommendedActionBengali,
      legalContext: f.legalContext,
    })),
    comparison: landCase.comparisons[0] || null,
    totalDocuments: landCase.documents.length,
    officialDisclaimerBengali:
      "ঘোষণা: এই প্রতিবেদনটি 'ভূমিপ্রহরী' এআই সিস্টেম দ্বারা প্রদত্ত তথ্যের তুলনামূলক বিশ্লেষণের ভিত্তিতে তৈরি সিদ্ধান্ত-সহায়ক প্রতিবেদন। এটি আদালতের রায় বা আইনগত চূড়ান্ত স্বত্বের নিশ্চয়তা প্রদান করে না। যেকোনো প্রকার আর্থিক লেনদেন বা জমি ক্রয়ের পূর্বে সংশ্লিষ্ট সহকারী কমিশনার (ভূমি) অফিস, সাব-রেজিস্ট্রি রেকর্ড রুম ও সরেজমিন দখল সরেজমিনে বিজ্ঞ আইনজীবীর মাধ্যমে যাচাই করে নেওয়া সমীচীন।",
  };

  return reportData;
};

export const ReportService = {
  generateCaseReport,
};

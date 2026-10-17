import { prisma } from "../../lib/prisma";

const addRecord = async (payload: any) => {
  const record = await prisma.extractedLandRecord.create({
    data: {
      landCaseId: payload.landCaseId,
      documentId: payload.documentId || null,
      surveyType: payload.surveyType,
      surveyYear: payload.surveyYear || null,
      district: payload.district,
      upazila: payload.upazila,
      mouza: payload.mouza,
      jlNumber: payload.jlNumber || null,
      khatianNumber: String(payload.khatianNumber),
      dagNumber: String(payload.dagNumber),
      landAreaAcre: parseFloat(payload.landAreaAcre),
      landClass: payload.landClass || null,
      ownerNames: Array.isArray(payload.ownerNames)
        ? payload.ownerNames
        : [payload.ownerNames],
      shares: payload.shares || "১৬ আনা",
      transferDetails: payload.transferDetails || null,
      deedNumber: payload.deedNumber || null,
      deedDate: payload.deedDate ? new Date(payload.deedDate) : null,
      sourceLabel: payload.sourceLabel || `${payload.surveyType} খতিয়ান`,
      isUserVerified: true,
    },
  });

  return record;
};

const addDeed = async (payload: any) => {
  const deed = await prisma.deed.create({
    data: {
      landCaseId: payload.landCaseId,
      deedNumber: String(payload.deedNumber),
      deedDate: new Date(payload.deedDate),
      subRegistryOffice: payload.subRegistryOffice,
      deedType: payload.deedType || "সাফ কবলা",
      sellerNames: Array.isArray(payload.sellerNames)
        ? payload.sellerNames
        : [payload.sellerNames],
      buyerNames: Array.isArray(payload.buyerNames)
        ? payload.buyerNames
        : [payload.buyerNames],
      landAreaAcre: parseFloat(payload.landAreaAcre),
      plotDagNumbers: Array.isArray(payload.plotDagNumbers)
        ? payload.plotDagNumbers
        : [String(payload.plotDagNumbers)],
      considerationAmount: payload.considerationAmount
        ? parseFloat(payload.considerationAmount)
        : null,
    },
  });

  return deed;
};

const getRecordsByCase = async (landCaseId: string) => {
  const records = await prisma.extractedLandRecord.findMany({
    where: { landCaseId },
    orderBy: { createdAt: "asc" },
  });

  const deeds = await prisma.deed.findMany({
    where: { landCaseId },
    include: { transfers: true },
    orderBy: { deedDate: "asc" },
  });

  return { records, deeds };
};

export const LandRecordService = {
  addRecord,
  addDeed,
  getRecordsByCase,
};

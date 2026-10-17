import { prisma } from "../../lib/prisma";

const createCase = async (payload: any, userId?: string) => {
  const caseCount = await prisma.landCase.count();
  const caseNumber = `BP-${new Date().getFullYear()}-${String(caseCount + 1).padStart(4, "0")}`;

  const landCase = await prisma.landCase.create({
    data: {
      caseNumber,
      title: payload.title || `কেস: ${payload.mouza || "মৌজা"} (খতিয়ান: ${payload.primaryKhatian || "N/A"})`,
      description: payload.description || null,
      district: payload.district,
      upazila: payload.upazila,
      mouza: payload.mouza,
      jlNumber: payload.jlNumber || null,
      primaryKhatian: payload.primaryKhatian || null,
      primaryDag: payload.primaryDag || null,
      userId: userId || null,
      status: "PROCESSING",
    },
  });

  return landCase;
};

const getAllCases = async (userId?: string) => {
  return prisma.landCase.findMany({
    where: userId ? { userId } : {},
    include: {
      _count: {
        select: {
          records: true,
          deeds: true,
          documents: true,
          findings: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getCaseById = async (id: string) => {
  return prisma.landCase.findUnique({
    where: { id },
    include: {
      records: {
        orderBy: { createdAt: "asc" },
      },
      deeds: {
        include: { transfers: true },
        orderBy: { deedDate: "asc" },
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
      findings: {
        orderBy: { createdAt: "asc" },
      },
      comparisons: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
};

const updateCase = async (id: string, payload: any) => {
  return prisma.landCase.update({
    where: { id },
    data: payload,
  });
};

const deleteCase = async (id: string) => {
  return prisma.landCase.delete({
    where: { id },
  });
};

export const LandCaseService = {
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  deleteCase,
};

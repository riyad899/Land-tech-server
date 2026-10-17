import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { FraudDetectionService } from "../module/FraudDetection/fraudDetection.service";
import { RAGService } from "../module/Rag/rag.service";

async function seed() {
  console.log("🌱 Starting BhumiProhori Database Seeding...");

  // 1. Create Demo Users
  const hashedPassword = await bcrypt.hash("demo1234", 10);

  const demoCitizen = await prisma.user.upsert({
    where: { email: "citizen@bhumiprohori.com" },
    update: {},
    create: {
      name: "মোহাম্মদ রফিকুল ইসলাম",
      email: "citizen@bhumiprohori.com",
      password: hashedPassword,
      role: "CITIZEN",
      phone: "01711223344",
      isVerified: true,
    },
  });

  const demoReviewer = await prisma.user.upsert({
    where: { email: "reviewer@bhumiprohori.com" },
    update: {},
    create: {
      name: "অ্যাডভোকেট শারমিন আক্তার",
      email: "reviewer@bhumiprohori.com",
      password: hashedPassword,
      role: "REVIEWER",
      phone: "01811998877",
      isVerified: true,
    },
  });

  console.log("✅ Demo users created.");

  // 2. Ingest Legal & Survey Knowledge Base into pgvector
  console.log("📚 Indexing Bangladesh Land Laws into Vector DB via OpenRouter RAG...");
  const ragService = new RAGService();
  try {
    const ragResult = await ragService.ingestLegalData();
    console.log(`✅ ${ragResult.message}`);
  } catch (err: any) {
    console.warn("⚠️ RAG indexing had a warning or partial index:", err.message);
  }

  // 3. Scenario 1: Clean Land Case (নিখুঁত জমি - ধারাবাহিক মালিকানা)
  console.log("📑 Creating Scenario 1: Clean Land Record Case...");
  const case1 = await prisma.landCase.upsert({
    where: { caseNumber: "BP-2026-0001" },
    update: {},
    create: {
      caseNumber: "BP-2026-0001",
      title: "ধানমন্ডি মৌজা - বৈধ খতিয়ান ও নিয়মিত নামজারি",
      description: "সিএস হতে বিএস পর্যন্ত ধারাবাহিক জরিপ ও রেজিস্ট্রিকৃত হস্তান্তরের তথ্য যাচাই।",
      district: "ঢাকা",
      upazila: "ধানমন্ডি",
      mouza: "ধানমন্ডি",
      jlNumber: "০৮",
      primaryKhatian: "৪৫২",
      primaryDag: "১০১২",
      userId: demoCitizen.id,
      status: "PROCESSING",
    },
  });

  // Records for Case 1
  await prisma.extractedLandRecord.deleteMany({ where: { landCaseId: case1.id } });
  await prisma.extractedLandRecord.createMany({
    data: [
      {
        landCaseId: case1.id,
        surveyType: "CS",
        surveyYear: "১৯৪০",
        district: "ঢাকা",
        upazila: "ধানমন্ডি",
        mouza: "ধানমন্ডি",
        jlNumber: "০৮",
        khatianNumber: "১২০",
        dagNumber: "১০১২",
        landAreaAcre: 0.25,
        landClass: "ভিটি",
        ownerNames: ["আব্দুল কাদের চৌধুরী"],
        shares: "১৬ আনা",
        sourceLabel: "সিএস খতিয়ান কপি নং ১২০",
        confidenceScore: 0.98,
        isUserVerified: true,
      },
      {
        landCaseId: case1.id,
        surveyType: "SA",
        surveyYear: "১৯৬০",
        district: "ঢাকা",
        upazila: "ধানমন্ডি",
        mouza: "ধানমন্ডি",
        jlNumber: "০৮",
        khatianNumber: "২৩৫",
        dagNumber: "১০১২",
        landAreaAcre: 0.25,
        landClass: "ভিটি",
        ownerNames: ["আব্দুল কাদের চৌধুরী"],
        shares: "১৬ আনা",
        sourceLabel: "এসএ খতিয়ান কপি নং ২৩৫",
        confidenceScore: 0.96,
        isUserVerified: true,
      },
      {
        landCaseId: case1.id,
        surveyType: "RS",
        surveyYear: "১৯৮২",
        district: "ঢাকা",
        upazila: "ধানমন্ডি",
        mouza: "ধানমন্ডি",
        jlNumber: "০৮",
        khatianNumber: "৩৪১",
        dagNumber: "১০১২",
        landAreaAcre: 0.25,
        landClass: "ভিটি",
        ownerNames: ["মোস্তাফিজুর রহমান চৌধুরী"],
        shares: "১৬ আনা",
        sourceLabel: "আরএস খতিয়ান কপি নং ৩৪১ (উত্তরাধিকার সূত্রে)",
        confidenceScore: 0.97,
        isUserVerified: true,
      },
      {
        landCaseId: case1.id,
        surveyType: "BS",
        surveyYear: "২০১০",
        district: "ঢাকা",
        upazila: "ধানমন্ডি",
        mouza: "ধানমন্ডি",
        jlNumber: "০৮",
        khatianNumber: "৪৫২",
        dagNumber: "১০১২",
        landAreaAcre: 0.25,
        landClass: "আবাসিক",
        ownerNames: ["মোস্তাফিজুর রহমান চৌধুরী"],
        shares: "১৬ আনা",
        sourceLabel: "বিএস সিটি জরিপ খতিয়ান কপি নং ৪৫২",
        confidenceScore: 0.99,
        isUserVerified: true,
      },
    ],
  });

  // Deeds for Case 1
  await prisma.deed.deleteMany({ where: { landCaseId: case1.id } });
  await prisma.deed.create({
    data: {
      landCaseId: case1.id,
      deedNumber: "৪৭৮৯/২০১৫",
      deedDate: new Date("2015-04-12"),
      subRegistryOffice: "ধানমন্ডি সাব-রেজিস্ট্রি অফিস",
      deedType: "সাফ কবলা",
      sellerNames: ["মোস্তাফিজুর রহমান চৌধুরী"],
      buyerNames: ["মোহাম্মদ রফিকুল ইসলাম"],
      landAreaAcre: 0.25,
      plotDagNumbers: ["১০১২"],
      considerationAmount: 8500000,
    },
  });

  // Run automatic analysis for Case 1
  await FraudDetectionService.analyzeCase(case1.id);
  console.log("✅ Scenario 1 ready.");

  // 4. Scenario 2: High Priority Duplicate Sale Risk (দ্বৈত বিক্রয় ও জাল দলিল ঝুঁকি)
  console.log("📑 Creating Scenario 2: Duplicate Sale Risk Case...");
  const case2 = await prisma.landCase.upsert({
    where: { caseNumber: "BP-2026-0002" },
    update: {},
    create: {
      caseNumber: "BP-2026-0002",
      title: "মিরপুর মৌজা - দ্বৈত বিক্রয় ও ভুয়া দলিল ঝুঁকি",
      description: "একই দাগের জমি একই বিক্রেতা কর্তৃক একাধিক ব্যক্তির নিকট বিক্রয়ের সন্দেহজনক প্যাটার্ন।",
      district: "ঢাকা",
      upazila: "মিরপুর",
      mouza: "মিরপুর",
      jlNumber: "১২",
      primaryKhatian: "৮৭৪",
      primaryDag: "৩৪০",
      userId: demoCitizen.id,
      status: "PROCESSING",
    },
  });

  await prisma.extractedLandRecord.deleteMany({ where: { landCaseId: case2.id } });
  await prisma.extractedLandRecord.createMany({
    data: [
      {
        landCaseId: case2.id,
        surveyType: "RS",
        surveyYear: "১৯৮৫",
        district: "ঢাকা",
        upazila: "মিরপুর",
        mouza: "মিরপুর",
        jlNumber: "১২",
        khatianNumber: "৫২০",
        dagNumber: "৩৪০",
        landAreaAcre: 0.3,
        landClass: "নাল",
        ownerNames: ["আহমেদ উল্লাহ খান"],
        shares: "১৬ আনা",
        sourceLabel: "আরএস খতিয়ান কপি ৫২০",
        confidenceScore: 0.95,
        isUserVerified: true,
      },
      {
        landCaseId: case2.id,
        surveyType: "BS",
        surveyYear: "২০১৪",
        district: "ঢাকা",
        upazila: "মিরপুর",
        mouza: "মিরপুর",
        jlNumber: "১২",
        khatianNumber: "৮৭৪",
        dagNumber: "৩৪০",
        landAreaAcre: 0.3,
        landClass: "ভিটি",
        ownerNames: ["আহমেদ উল্লাহ খান"],
        shares: "১৬ আনা",
        sourceLabel: "বিএস খতিয়ান কপি ৮৭৪",
        confidenceScore: 0.94,
        isUserVerified: true,
      },
    ],
  });

  // Multiple conflicting deeds on the same plot exceeding 0.30 acre
  await prisma.deed.deleteMany({ where: { landCaseId: case2.id } });
  await prisma.deed.createMany({
    data: [
      {
        landCaseId: case2.id,
        deedNumber: "১২০৫/২০১৯",
        deedDate: new Date("2019-06-15"),
        subRegistryOffice: "মিরপুর সাব-রেজিস্ট্রি",
        deedType: "সাফ কবলা",
        sellerNames: ["আহমেদ উল্লাহ খান"],
        buyerNames: ["কাজী মোয়াজ্জেম হোসেন"],
        landAreaAcre: 0.2,
        plotDagNumbers: ["৩৪০"],
        considerationAmount: 4000000,
      },
      {
        landCaseId: case2.id,
        deedNumber: "৩৪৩১/২০২৩",
        deedDate: new Date("2023-11-20"),
        subRegistryOffice: "মিরপুর সাব-রেজিস্ট্রি",
        deedType: "সাফ কবলা",
        sellerNames: ["আহমেদ উল্লাহ খান"],
        buyerNames: ["সাইফুল ইসলাম ফারুক"],
        landAreaAcre: 0.25, // Total 0.20 + 0.25 = 0.45 acre! Exceeds 0.30 acre!
        plotDagNumbers: ["৩৪০"],
        considerationAmount: 5500000,
      },
    ],
  });

  await FraudDetectionService.analyzeCase(case2.id);
  console.log("✅ Scenario 2 ready.");

  // 5. Scenario 3: Survey Area Mismatch (জরিপে অস্বাভাবিক জমি বৃদ্ধি)
  console.log("📑 Creating Scenario 3: Survey Area Inflation Case...");
  const case3 = await prisma.landCase.upsert({
    where: { caseNumber: "BP-2026-0003" },
    update: {},
    create: {
      caseNumber: "BP-2026-0003",
      title: "সাভার মৌজা - সিএস হতে বিএস জরিপে জমির পরিমাণ অস্বাভাবিক স্ফীতি",
      description: "সিএস জরিপে ০.৩০ একর থেকে বিএস জরিপে হঠাৎ ০.৫৮ একরে উন্নীত হওয়ার অসংগতি।",
      district: "ঢাকা",
      upazila: "সাভার",
      mouza: "আশুলিয়া",
      jlNumber: "০৪",
      primaryKhatian: "৬১২",
      primaryDag: "৫১৮",
      userId: demoCitizen.id,
      status: "PROCESSING",
    },
  });

  await prisma.extractedLandRecord.deleteMany({ where: { landCaseId: case3.id } });
  await prisma.extractedLandRecord.createMany({
    data: [
      {
        landCaseId: case3.id,
        surveyType: "CS",
        surveyYear: "১৯৩৮",
        district: "ঢাকা",
        upazila: "সাভার",
        mouza: "আশুলিয়া",
        jlNumber: "০৪",
        khatianNumber: "১১০",
        dagNumber: "৫১৮",
        landAreaAcre: 0.3,
        landClass: "ধানী",
        ownerNames: ["রমেশ চন্দ্র দে"],
        shares: "১৬ আনা",
        sourceLabel: "সিএস খতিয়ান কপি ১১০",
        confidenceScore: 0.96,
        isUserVerified: true,
      },
      {
        landCaseId: case3.id,
        surveyType: "SA",
        surveyYear: "১৯৬১",
        district: "ঢাকা",
        upazila: "সাভার",
        mouza: "আশুলিয়া",
        jlNumber: "০৪",
        khatianNumber: "২১৪",
        dagNumber: "৫১৮",
        landAreaAcre: 0.3,
        landClass: "ধানী",
        ownerNames: ["মীর হাসেম আলী"],
        shares: "১৬ আনা",
        sourceLabel: "এসএ খতিয়ান কপি ২১৪",
        confidenceScore: 0.95,
        isUserVerified: true,
      },
      {
        landCaseId: case3.id,
        surveyType: "BS",
        surveyYear: "২০১২",
        district: "ঢাকা",
        upazila: "সাভার",
        mouza: "আশুলিয়া",
        jlNumber: "০৪",
        khatianNumber: "৬১২",
        dagNumber: "৫১৮",
        landAreaAcre: 0.58, // Huge inflation from 0.30 to 0.58! (93% increase)
        landClass: "নাল",
        ownerNames: ["এম এ বারিক"],
        shares: "১৬ আনা",
        sourceLabel: "বিএস জরিপ খতিয়ান ৬১২",
        confidenceScore: 0.92,
        isUserVerified: true,
      },
    ],
  });

  await FraudDetectionService.analyzeCase(case3.id);
  console.log("✅ Scenario 3 ready.");

  console.log("🎉 Seeding completed successfully!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

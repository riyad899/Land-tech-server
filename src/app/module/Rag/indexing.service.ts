import { prisma } from "../../lib/prisma";
import { EmbeddingService } from "./embedding.service";

export interface LegalDocumentItem {
  chunkKey: string;
  sourceType: string;
  sourceId: string;
  sourceLabel: string;
  content: string;
  metadata?: any;
}

export const BANGLADESH_LAND_KNOWLEDGE_BASE: LegalDocumentItem[] = [
  {
    chunkKey: "law-sat-1950-sec143",
    sourceType: "LEGAL_ACT",
    sourceId: "SAT_ACT_1950",
    sourceLabel: "স্টেট একুইজিশন অ্যান্ড টেন্যান্সি অ্যাক্ট ১৯৫০ (ধারা ১৪৩ - নামজারি)",
    content: "স্টেট একুইজিশন অ্যান্ড টেন্যান্সি অ্যাক্ট ১৯৫০ (State Acquisition and Tenancy Act, 1950) এর ১৪৩ ধারা অনুযায়ী, কোনো জমি ক্রয়, দান বা উত্তরাধিকার সূত্রে প্রাপ্ত হলে সংশ্লিষ্ট সহকারী কমিশনার (ভূমি) বা এসি ল্যান্ড এর মাধ্যমে নামজারি ও জমাভাগ (Mutation) করানো বাধ্যতামূলক। পূর্ববর্তী রেকর্ডের নাম পরিবর্তন না করে শুধু দলিলের ভিত্তিতে চূড়ান্ত মালিকানা প্রতিষ্ঠিত হয় না।",
    metadata: { law: "SAT Act 1950", section: "143", category: "Mutation" },
  },
  {
    chunkKey: "law-registration-1908-sec52a",
    sourceType: "LEGAL_ACT",
    sourceId: "REGISTRATION_ACT_1908",
    sourceLabel: "রেজিস্ট্রেশন আইন ১৯০৮ (ধারা ৫২ক - দলিল নিবন্ধনের পূর্বশর্ত)",
    content: "রেজিস্ট্রেশন আইন ১৯০৮ এর ৫২ক ধারা অনুসারে, যে কোনো স্থাবর সম্পত্তি হস্তান্তরের দলিল নিবন্ধনের সময় বিক্রেতার নামে নামজারি খতিয়ান, হালনাগাদ ভূমি উন্নয়ন কর (দাখিলা) পরিশোধের প্রমাণপত্র এবং পূর্ববর্তী ২৫ বছরের বায়া দলিল (Chain Deeds) পর্যালোচনা করা বাধ্যতামূলক। বিক্রেতার বৈধ মালিকানা ও অধিকার না থাকলে সাব-রেজিস্ট্রার দলিল নিবন্ধন করবেন না।",
    metadata: { law: "Registration Act 1908", section: "52A", category: "Deed Registration" },
  },
  {
    chunkKey: "law-land-crime-2023-forgery",
    sourceType: "LEGAL_ACT",
    sourceId: "LAND_CRIME_ACT_2023",
    sourceLabel: "ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩ (ধারা ৪ ও ৫ - জাল দলিল ও প্রতারণামূলক হস্তান্তর)",
    content: "ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩ এর ৪ ও ৫ ধারা অনুযায়ী, অন্যের জমি নিজের বলে দাবি করে জাল দলিল সম্পাদন, একই জমি একাধিক ব্যক্তির নিকট হস্তান্তর (দ্বৈত বিক্রয়), অথবা ভুল দাগ নম্বর ব্যবহার করে প্রতারণামূলক দলিল তৈরি করা একটি অজামিনযোগ্য ফৌজদারি অপরাধ। এর শাস্তি সর্বোচ্চ ৭ বছর কারাদণ্ড ও অর্থদণ্ড। প্রতারণামূলকভাবে রেজিস্ট্রিকৃত দলিল বাতিলযোগ্য।",
    metadata: { law: "Land Crime Act 2023", section: "4, 5", category: "Fraud Prevention" },
  },
  {
    chunkKey: "survey-hierarchy-cs-sa-rs-bs",
    sourceType: "SURVEY_GUIDE",
    sourceId: "SURVEY_HIERARCHY",
    sourceLabel: "বাংলাদেশের ভূমি জরিপ ক্রমবিন্যাস (CS, SA, RS, BS)",
    content: "বাংলাদেশে ভূমি জরিপ ধারাবাহিকভাবে পরিচালিত হয়েছে: ১. সিএস (CS - Cadastral Survey, ১৮৮৮-১৯৪০) যা প্রথম বিজ্ঞানসম্মত ভিত্তি জরিপ। ২. এসএ (SA - State Acquisition Survey, ১৯৫৬-১৯৬২) যা জমিদারি উচ্ছেদের পর তৈরি। ৩. আরএস (RS - Revisional Survey) যা সিএস ও এসএ এর ত্রুটি সংশোধনকল্পে সম্পন্ন। ৪. বিএস/সিটি জরিপ (BS/City Survey, ১৯৯৮ হতে চলমান)। কোনো জমির বৈধতা যাচাইয়ে সিএস খতিয়ান থেকে শুরু করে বর্তমান বিএস খতিয়ান পর্যন্ত দাগের পরিবর্তন ও জমির পরিমাণ অক্ষুণ্ণ আছে কি না তা যাচাই করা আবশ্যক।",
    metadata: { category: "Surveys", types: ["CS", "SA", "RS", "BS"] },
  },
  {
    chunkKey: "rule-duplicate-sale-detection",
    sourceType: "FRAUD_RULE",
    sourceId: "RULE_DUPLICATE_SALE",
    sourceLabel: "দ্বৈত বিক্রয় ও অতিরিক্ত হিস্যা হস্তান্তর শনাক্তকরণ নিয়ম",
    content: "একজন ভূমির মালিক কোনো নির্দিষ্ট দাগের অন্তর্ভুক্ত তার প্রাপ্ত হিস্যা বা নির্দিষ্ট শতক জমির বেশি হস্তান্তর করতে পারেন না। যদি কোনো খতিয়ানের ৮১ নং দাগে মোট জমি ৩০ শতক থাকে এবং মালিক ক পূর্বে ১৫ শতক খ এর নিকট বিক্রি করার পর পুনরায় সম্পূর্ণ ৩০ শতক বা ১৫ শতকের অতিরিক্ত জমি গ এর নিকট বিক্রি করেন, তবে এটি সুস্পষ্ট প্রতারণা ও অবৈধ দ্বিতীয় হস্তান্তর হিসেবে গণ্য হয়।",
    metadata: { ruleId: "RULE_DUPLICATE_SALE", severity: "HIGH_PRIORITY" },
  },
  {
    chunkKey: "rule-survey-area-discrepancy",
    sourceType: "FRAUD_RULE",
    sourceId: "RULE_SURVEY_AREA_MISMATCH",
    sourceLabel: "জরিপে জমির পরিমাণের অসঙ্গতি ও ভুয়া রেকর্ড প্রস্তুত",
    content: "সিএস জরিপ থেকে আরএস বা বিএস জরিপে কোনো সরকারি অধিগ্রহণ বা বৈধ বণ্টন ছাড়া দাগে জমির পরিমাণ যদি অস্বাভাবিকভাবে বৃদ্ধি পায় (যথা: সিএস এ ০.৪০ একর কিন্তু বিএস এ ০.৬৫ একর), তবে সেখানে পার্শ্ববর্তী দাগ বা সরকারি খাস জমি অন্তর্ভুক্ত হওয়ার জোরালো ঝুঁকি থাকে। এরূপ ক্ষেত্রে সহকারী কমিশনার (ভূমি) কার্যালয় ও রেকর্ড রুমের ভলিউম যাচাই করা জরুরি।",
    metadata: { ruleId: "RULE_SURVEY_AREA_MISMATCH", severity: "REVIEW_REQUIRED" },
  },
  {
    chunkKey: "rule-ownership-chain-break",
    sourceType: "FRAUD_RULE",
    sourceId: "RULE_OWNERSHIP_CHAIN_BREAK",
    sourceLabel: "মালিকানার ধারাবাহিকতায় বিচ্ছিন্নতা (Broken Chain of Title)",
    content: "সিএস বা এসএ খতিয়ানের মূল মালিকের সাথে বর্তমান বিক্রেতার কোনো আত্মীয়তা, উত্তরাধিকারী সনদ (ওয়ারিশ কায়েম সার্টিফিকেট) অথবা রেজিস্ট্রার্ড বিক্রয় দলিলের সংযোগ না থাকলে মালিকানার ধারাবাহিকতায় বিচ্ছিন্নতা সৃষ্টি হয়। নামজারিতে ওয়ারিশগণের সঠিক বণ্টন নিশ্চিত না করে জমি কেনা পরবর্তীতে অন্য শরিকদের দ্বারা মোকদ্দমার সৃষ্টি করে।",
    metadata: { ruleId: "RULE_OWNERSHIP_CHAIN_BREAK", severity: "HIGH_PRIORITY" },
  },
  {
    chunkKey: "rule-khatian-dag-mouza-validation",
    sourceType: "VERIFICATION_PROCEDURE",
    sourceId: "PROCEDURE_KHATIAN_DAG",
    sourceLabel: "খতিয়ান, দাগ ও মৌজা যাচাই পদ্ধতি",
    content: "ভূমি যাচাইয়ের ক্ষেত্রে মৌজা নম্বর (জেএল নম্বর), খতিয়ান নম্বর ও দাগ নম্বর সমন্বিতভাবে যাচাই করতে হয়। শুধু দাগ নম্বর এক থাকলে জমি এক হয় না, যদি মৌজা ভিন্ন হয়। তদ্রূপ খতিয়ানের হিস্যার যোগফল সর্বদা ১৬ আনা বা ১.০০০ এর সমান হতে হবে। দাখিলা কাটার সময় কিস্তি ও হাল সন সঠিক থাকতে হবে।",
    metadata: { category: "Verification Procedure" },
  },
];

export class IndexingService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  async indexLegalData(): Promise<{ success: boolean; indexedCount: number; message: string }> {
    let count = 0;

    for (const item of BANGLADESH_LAND_KNOWLEDGE_BASE) {
      try {
        const embedding = await this.embeddingService.generateEmbedding(item.content);
        if (!embedding || embedding.length === 0) continue;

        const vectorLiteral = `[${embedding.join(",")}]`;

        await prisma.$executeRawUnsafe(
          `
          INSERT INTO "document_embeddings" ("id", "chunkKey", "sourceType", "sourceId", "sourceLabel", "content", "metadata", "embedding", "isDeleted", "createdAt", "updatedAt")
          VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6::jsonb, $7::vector, false, NOW(), NOW())
          ON CONFLICT ("chunkKey") DO UPDATE
          SET "content" = EXCLUDED."content",
              "sourceLabel" = EXCLUDED."sourceLabel",
              "metadata" = EXCLUDED."metadata",
              "embedding" = EXCLUDED."embedding",
              "updatedAt" = NOW();
          `,
          item.chunkKey,
          item.sourceType,
          item.sourceId,
          item.sourceLabel,
          item.content,
          JSON.stringify(item.metadata || {}),
          vectorLiteral,
        );

        count++;
      } catch (err) {
        console.error(`Error indexing chunk ${item.chunkKey}:`, err);
      }
    }

    return {
      success: true,
      indexedCount: count,
      message: `${count} টি আইনি ও জরিপ রেকর্ড সফলভাবে ভেক্টর ডাটাবেজে যুক্ত হয়েছে।`,
    };
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { redisService } from "../../lib/redis";
import { EmbeddingService } from "./embedding.service";
import { IndexingService } from "./indexing.service";
import { LLMService } from "./llm.service";

export const ONE_HOUR_IN_SECONDS = 3600;
export const MAX_HOURLY_USERS = 100;
export const MAX_USER_REQUESTS_PER_HOUR = 100;

export const POPULAR_QUESTIONS = [
  {
    id: "land-crime-act-2023",
    label: "ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩",
    query: "ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩ এর মূল বিষয়গুলো কী?",
    category: "অপরাধ ও প্রতিকার",
    cachedAnswer:
      "ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩-এর মূল বিষয়গুলো হলো:\n\n১. **জাল দলিল ও প্রতারণামূলক হস্তান্তরের শাস্তি:** অন্যের জমি নিজের বলে ভুয়া দলিল তৈরি করলে বা একই দাগের জমি একাধিক ব্যক্তির নিকট প্রতারণামূলক হস্তান্তর (দ্বৈত বিক্রয়) করলে সর্বোচ্চ ৭ বছর পর্যন্ত কারাদণ্ড ও অর্থদণ্ড (ধারা ৪ ও ৫)।\n২. **মালিকানা ছাড়া বায়না বা বিক্রয় নিষিদ্ধ:** বিক্রয় বা হস্তান্তরের পূর্বে বৈধ মালিকানা সনদ ও হালনাগাদ দাখিলা থাকা বাধ্যতামূলক।\n৩. **অবৈধ দখল উচ্ছেদ ও পুনরুদ্ধার:** অন্যের বৈধ সম্পত্তি বলপূর্বক দখল করা বা দখল ধরে রাখা দণ্ডনীয় অপরাধ (ধারা ৮)।\n৪. **দাগ ও সীমানা বিকৃতি রোধ:** সার্ভে ম্যাপ বা দাগের প্রকৃত সীমানা ইচ্ছাকৃত পরিবর্তন বা ক্ষতিসাধন দণ্ডনীয় (ধারা ৯)।\n৫. **অজামিনযোগ্য ধারা:** এই আইনের আওতাধীন জাল দলিল ও দ্বৈত বিক্রয়ের একাধিক অপরাধকে জামিন-অযোগ্য এবং আমলযোগ্য হিসেবে গণ্য করা হয়েছে।",
  },
  {
    id: "mutation-mandatory-for-sale",
    label: "নামজারি না থাকলে কি জমি বিক্রি করা যায়?",
    query: "নামজারি না থাকলে কি জমি বিক্রি করা যায়?",
    category: "নামজারি ও হস্তান্তর",
    cachedAnswer:
      "**না, নামজারি (Mutation) খতিয়ান ছাড়া বর্তমানে বৈধভাবে জমি বিক্রি বা হস্তান্তর করা যায় না।**\n\nআইনি বিধান ও কারণসমূহ:\n১. **রেজিস্ট্রেশন আইন ১৯০৮ (ধারা ৫২ক):** স্থাবর সম্পত্তি হস্তান্তরের দলিল নিবন্ধনের পূর্বে সাব-রেজিস্ট্রার নিশ্চিত হবেন যে বিক্রেতার নিজ নামে অথবা বৈধ ওয়ারিশান সূত্রে সর্বশেষ নামজারি খতিয়ান সৃজিত আছে এবং চলতি অর্থবছরের ভূমি উন্নয়ন কর (দাখিলা) পরিশোধিত আছে।\n২. **স্টেট একুইজিশন অ্যান্ড টেন্যান্সি অ্যাক্ট ১৯৫০ (ধারা ১৪৩):** জমি হস্তান্তরের পর সহকারী কমিশনার (ভূমি) কর্তৃক নামজারি ও জমাভাগ না হলে সরকারি রেকর্ডে সাবেক মালিকের নাম বহাল থাকে, ফলে ক্রেতার চূড়ান্ত মালিকানা ও নামজারি খতিয়ান ব্যতিরেকে পরবর্তী বিক্রয় আইনত অচল।\n৩. **ভূমি অপরাধ প্রতিরোধ আইন ২০২৩:** নিজ নামে রেকর্ড না থাকা সত্ত্বেও জমি হস্তান্তর করার প্রচেষ্টা প্রতারণামূলক কাজ হিসেবে বিবেচিত হতে পারে।",
  },
  {
    id: "cs-vs-bs-survey-difference",
    label: "সিএস ও বিএস খতিয়ানের পার্থক্য",
    query: "সিএস ও বিএস খতিয়ানের মধ্যে পার্থক্য কী?",
    category: "জরিপ ধারাবাহিকতা",
    cachedAnswer:
      "বাংলাদেশে **সিএস (CS)** এবং **বিএস (BS)** খতিয়ানের মধ্যে মূল পার্থক্যসমূহ নিচে তুলে ধরা হলো:\n\n১. **সিএস (Cadastral Survey - ভিত্তি জরিপ):**\n- **সময়কাল:** ১৮৮৮ সাল হতে ১৯৪০ সাল পর্যন্ত ব্রিটিশ আমলে বিজ্ঞানসম্মত ট্রায়াঙ্গুলেশন পদ্ধতিতে পরিচালিত প্রথম খতিয়ান।\n- **গুরুত্ব:** এটিকে সকল জরিপের 'মা' বা মূল ভিত্তি ধরা হয়। জমির আদি মালিকানা, শ্রেণি ও সীমানা যাচাইয়ে সিএস খতিয়ান সবচেয়ে নির্ভরযোগ্য দলিল।\n\n২. **বিএস (Bangladesh Survey / City Survey - আধুনিক জরিপ):**\n- **সময়কাল:** ১৯৯৮ সাল হতে বর্তমান সময় পর্যন্ত পরিচালিত আধুনিক ডিজিটাল ও জেলা জরিপ (ঢাকা অঞ্চলে একে সিটি জরিপও বলা হয়)।\n- **গুরুত্ব:** এটি বর্তমান ভোগদখল ও হালনাগাদ মালিকানার প্রতিফলন। জমি ক্রয়-বিক্রয় ও নামজারির জন্য বিএস খতিয়ান হালনাগাদ থাকা অপরিহার্য।\n\n**পার্থক্য সারসংক্ষেপ:**\n- সিএস আদি মালিকানা ও ভূমির মূল সীমানা প্রমাণ করে, আর বিএস বর্তমান ভোগদখল ও সর্বশেষ হস্তান্তর প্রমাণ করে।\n- কোনো জমিতে সিএস থেকে বিএস জরিপের মধ্যে হঠাৎ দাগের আয়তন অযৌক্তিকভাবে বৃদ্ধি পেলে তা জালিয়াতি বা জরিপ ভুলের আলামত হিসেবে তদন্তযোগ্য।",
  },
];

export class RAGService {
  private embeddingService: EmbeddingService;
  private llmService: LLMService;
  private indexingService: IndexingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.indexingService = new IndexingService();
    this.llmService = new LLMService();
  }

  private normalizeQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      .replace(/বিষয়/g, "বিষয়")
      .replace(/খতিয়ান/g, "খতিয়ান")
      .replace(/[?।,!]/g, "")
      .replace(/\s+/g, " ");
  }

  private getQueryCacheKey(query: string): string {
    const normalized = this.normalizeQuery(query);
    const hash = crypto.createHash("md5").update(normalized).digest("hex");
    return `rag:cache:query:${hash}`;
  }

  /**
   * Check hourly rate limiting and 100-user capacity window in Redis
   */
  async checkUserHourlyLimit(
    userIdentifier: string = "anonymous",
    maxUsers: number = MAX_HOURLY_USERS,
    maxRequestsPerUser: number = MAX_USER_REQUESTS_PER_HOUR,
  ): Promise<{
    allowed: boolean;
    message?: string;
    activeUsersCount?: number;
    remainingRequests?: number;
  }> {
    try {
      const activeUsersKey = "rag:users:hourly_window";
      const userRequestKey = `rag:ratelimit:user:${userIdentifier}`;

      // Check current active users count
      const isAlreadyActive = await redisService.sIsMember(
        activeUsersKey,
        userIdentifier,
      );
      const activeUsersCount = await redisService.sCard(activeUsersKey);

      if (!isAlreadyActive && activeUsersCount >= maxUsers) {
        return {
          allowed: false,
          activeUsersCount,
          message: `এক ঘণ্টার জন্য নির্ধারিত সর্বোচ্চ ${maxUsers} জন ব্যবহারকারীর কোটা পূর্ণ হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।`,
        };
      }

      // Add user to active users set (with 1 hour TTL = 3600 seconds)
      await redisService.sAdd(
        activeUsersKey,
        userIdentifier,
        ONE_HOUR_IN_SECONDS,
      );

      // Increment user's individual request count
      const requestCount = await redisService.incr(
        userRequestKey,
        ONE_HOUR_IN_SECONDS,
      );
      if (requestCount > maxRequestsPerUser) {
        return {
          allowed: false,
          activeUsersCount,
          remainingRequests: 0,
          message: `আপনার জন্য নির্ধারিত এক ঘণ্টার সর্বোচ্চ ${maxRequestsPerUser} টি অনুরোধের সীমা পূর্ণ হয়েছে।`,
        };
      }

      return {
        allowed: true,
        activeUsersCount: isAlreadyActive ? activeUsersCount : activeUsersCount + 1,
        remainingRequests: Math.max(0, maxRequestsPerUser - requestCount),
      };
    } catch (err) {
      console.error("Redis rate limit check warning:", err);
      return { allowed: true };
    }
  }

  /**
   * Store and pre-seed popular messages into Redis for 1 hour
   */
  async cachePopularQuestionsInRedis(): Promise<{
    cachedCount: number;
    ttlSeconds: number;
    popularQuestions: typeof POPULAR_QUESTIONS;
  }> {
    const ttl = ONE_HOUR_IN_SECONDS; // 3600 seconds (1 hour)

    // Store popular questions index
    await redisService.setJson("rag:popular_questions", POPULAR_QUESTIONS, ttl);

    // Cache each popular question's answer in Redis
    for (const q of POPULAR_QUESTIONS) {
      const cacheKey = this.getQueryCacheKey(q.query);
      const payload = {
        answer: q.cachedAnswer,
        sources: [
          {
            id: q.id,
            chunkKey: `popular_${q.id}`,
            sourceType: "LEGAL_CODE",
            sourceId: q.id,
            sourceLabel: q.label,
            content: q.cachedAnswer,
            similarity: 1.0,
            metadata: { category: q.category, popular: true },
          },
        ],
        contextUsed: true,
        fromCache: true,
        isPopular: true,
        cachedAt: new Date().toISOString(),
        expiresInSeconds: ttl,
      };

      await redisService.setJson(cacheKey, payload, ttl);

      // Also cache with simplified label
      const labelKey = this.getQueryCacheKey(q.label);
      if (labelKey !== cacheKey) {
        await redisService.setJson(labelKey, payload, ttl);
      }
    }

    // Set configuration keys in Redis
    await redisService.setJson(
      "rag:config:limits",
      {
        maxUsersPerHour: MAX_HOURLY_USERS,
        ttlSeconds: ONE_HOUR_IN_SECONDS,
        updatedAt: new Date().toISOString(),
      },
      ttl,
    );

    return {
      cachedCount: POPULAR_QUESTIONS.length,
      ttlSeconds: ttl,
      popularQuestions: POPULAR_QUESTIONS,
    };
  }

  /**
   * Get popular questions (serves from Redis if cached)
   */
  async getPopularQuestions(): Promise<typeof POPULAR_QUESTIONS> {
    const cached = await redisService.getJson<typeof POPULAR_QUESTIONS>(
      "rag:popular_questions",
    );
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    await this.cachePopularQuestionsInRedis();
    return POPULAR_QUESTIONS;
  }

  async ingestLegalData() {
    return this.indexingService.indexLegalData();
  }

  async retieveRelevantDocuments(
    query: string,
    limit: number = 5,
    sourceType?: string,
  ) {
    try {
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      const vectorLiteral = `[${queryEmbedding.join(",")}]`;

      const results = await prisma.$queryRaw(Prisma.sql`
          SELECT id, "chunkKey", "sourceType", "sourceId", "sourceLabel", content, metadata, "isDeleted", "deletedAt", "createdAt", "updatedAt", 1 - (embedding <=> CAST(${vectorLiteral} AS vector)) as similarity
          FROM "document_embeddings"
          WHERE "isDeleted" = false
          ${sourceType ? Prisma.sql`AND "sourceType" = ${sourceType}` : Prisma.empty}
          ORDER BY embedding <=> CAST(${vectorLiteral} AS vector)
          LIMIT ${limit}
      `);

      return results;
    } catch (error) {
      console.error("Error retrieving relevant documents:", error);
      throw error;
    }
  }

  async generateAnswer(
    query: string,
    limit: number = 5,
    sourceType?: string,
    asJson: boolean = false,
    userIdentifier: string = "anonymous",
  ) {
    try {
      // 1. Rate Limiting & 100-user Hourly Capacity Check
      const rateLimit = await this.checkUserHourlyLimit(
        userIdentifier,
        MAX_HOURLY_USERS,
        MAX_USER_REQUESTS_PER_HOUR,
      );

      if (!rateLimit.allowed) {
        return {
          answer: rateLimit.message,
          sources: [],
          fromCache: false,
          rateLimited: true,
          activeUsersCount: rateLimit.activeUsersCount,
        };
      }

      // 2. Redis Cache Lookup (1-hour TTL)
      const cacheKey = this.getQueryCacheKey(query);
      const cached = await redisService.getJson<any>(cacheKey);
      if (cached) {
        return {
          ...cached,
          fromCache: true,
          activeUsersCount: rateLimit.activeUsersCount,
          remainingRequests: rateLimit.remainingRequests,
        };
      }

      // 3. Vector Similarity Search in pgvector
      const relevantDocs = await this.retieveRelevantDocuments(
        query,
        limit,
        sourceType,
      );

      const context = (relevantDocs as any[])
        .filter((doc: any) => doc.content)
        .map((doc: any) => `[উৎস: ${doc.sourceLabel || doc.sourceId}]\n${doc.content}`);

      // 4. LLM Response Generation via OpenRouter
      const answer = await this.llmService.generateResponse(
        query,
        context,
        asJson,
      );

      let parsedAnswer: any = answer;
      if (asJson) {
        try {
          let cleanAnswer = answer.trim();
          if (cleanAnswer.startsWith("```json")) {
            cleanAnswer = cleanAnswer
              .replace(/^```json\n?/, "")
              .replace(/```$/, "")
              .trim();
          } else if (cleanAnswer.startsWith("```")) {
            cleanAnswer = cleanAnswer
              .replace(/^```\n?/, "")
              .replace(/```$/, "")
              .trim();
          }
          parsedAnswer = JSON.parse(cleanAnswer);
        } catch (e) {
          console.error("Failed to parse LLM JSON response:", e);
          parsedAnswer = { summary: answer };
        }
      }

      const result = {
        answer: parsedAnswer,
        sources: (relevantDocs as any[]).map((doc: any) => ({
          id: doc.id,
          chunkKey: doc.chunkKey,
          sourceType: doc.sourceType,
          sourceId: doc.sourceId,
          sourceLabel: doc.sourceLabel,
          content: doc.content,
          similarity: Number(doc.similarity || 0),
          metadata: doc.metadata,
        })),
        contextUsed: context.length > 0,
        fromCache: false,
        activeUsersCount: rateLimit.activeUsersCount,
        remainingRequests: rateLimit.remainingRequests,
      };

      // 5. Store into Redis with 1 hour TTL (3600 seconds)
      await redisService.setJson(cacheKey, result, ONE_HOUR_IN_SECONDS);

      return result;
    } catch (error: any) {
      console.error("RAG generateAnswer fallback caught:", error);
      return {
        answer:
          "ভূমি আইনের সাধারণ বিধান:\n১. জমি ক্রয়ের পূর্বে সিএস (CS) হতে বিএস (BS) খতিয়ানের ধারাবাহিকতা ও ২৫ বছরের বায়া দলিল যাচাই করুন।\n২. নামজারি ও চলতি বছরের খাজনা (দাখিলা) পরিশোধিত না থাকলে দলিল রেজিস্ট্রি বা চূড়ান্ত মালিকানা কার্যকর হয় না (রেজিস্ট্রেশন আইন ১৯০৮, ধারা ৫২ক)।\n৩. একই জমি একাধিক ব্যক্তির নিকট হস্তান্তর (দ্বৈত বিক্রয়) বা অন্যের জমি নিজের বলে দাবি করা ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩ অনুযায়ী অজামিনযোগ্য ফৌজদারি অপরাধ।",
        sources: [
          {
            id: "fallback-law",
            chunkKey: "fallback-legal-guidelines",
            sourceType: "LEGAL_GUIDELINE",
            sourceId: "GENERAL_LAND_RULES",
            sourceLabel: "সাধারণ ভূমি যাচাই নির্দেশিকা ও পূর্বসতর্কতা",
            content:
              "জমি ক্রয়ের পূর্বে সংশ্লিষ্ট সহকারী কমিশনার (ভূমি) অফিস হতে খতিয়ান ও নামজারির রেকর্ড যাচাই করা নাগরিকের আবশ্যক দায়িত্ব।",
            similarity: 0.9,
          },
        ],
        contextUsed: true,
        fromCache: false,
        fallback: true,
      };
    }
  }

  async getStats() {
    try {
      const totalDocuments: any = await prisma.$queryRaw(Prisma.sql`
        SELECT COUNT(*) as count FROM "document_embeddings" WHERE "isDeleted" = false;
      `);

      const sourceTypeCounts: any = await prisma.$queryRaw(Prisma.sql`
        SELECT "sourceType", COUNT(*) as count FROM "document_embeddings" WHERE "isDeleted" = false GROUP BY "sourceType"
      `);

      const activeUsersCount = await redisService.sCard("rag:users:hourly_window");

      return {
        totalActiveDocuments: Number(totalDocuments[0]?.count ?? 0),
        sourceTypeBreakdown: (sourceTypeCounts || []).reduce(
          (acc: any, curr: any) => {
            acc[curr.sourceType] = Number(curr.count);
            return acc;
          },
          {},
        ),
        redisMetrics: {
          activeHourlyUsers: activeUsersCount,
          maxAllowedUsersPerHour: MAX_HOURLY_USERS,
          ttlSeconds: ONE_HOUR_IN_SECONDS,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error getting RAG stats:", error);
      throw error;
    }
  }
}

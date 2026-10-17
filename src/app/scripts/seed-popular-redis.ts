/* eslint-disable no-console */
import { RAGService, POPULAR_QUESTIONS, ONE_HOUR_IN_SECONDS, MAX_HOURLY_USERS } from "../module/Rag/rag.service";
import { redisService } from "../lib/redis";

async function seedPopularQuestionsToRedis() {
  console.log("=================================================");
  console.log("🌱 সিডিং: জনপ্রিয় আইনি বার্তাসমূহ রেডিস সার্ভারে সংরক্ষণ (১ ঘণ্টা ও ১০০ জন ব্যবহারকারী)");
  console.log("=================================================");

  const isRedisAvailable = await redisService.isAvailable();
  if (!isRedisAvailable) {
    console.error("❌ রেডিস সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে ক্রেডেনশিয়াল যাচাই করুন।");
    process.exit(1);
  }

  const ragService = new RAGService();
  const result = await ragService.cachePopularQuestionsInRedis();

  console.log(`✅ সফলভাবে ${result.cachedCount}টি জনপ্রিয় প্রশ্ন ও উত্তর রেডিসে সংরক্ষিত হয়েছে!`);
  console.log(`⏳ মেয়াদকাল (TTL): ${result.ttlSeconds} সেকেন্ড (১ ঘণ্টা)`);
  console.log(`👥 ব্যবহারকারী ধারণক্ষমতা: সর্বোচ্চ ${MAX_HOURLY_USERS} জন ব্যবহারকারী / ঘণ্টা`);

  console.log("\nসংরক্ষিত জনপ্রিয় প্রশ্নসমূহ:");
  POPULAR_QUESTIONS.forEach((q, idx) => {
    console.log(`  [${idx + 1}] ${q.label}`);
    console.log(`      প্রশ্ন: "${q.query}"`);
    console.log(`      বিভাগ: ${q.category}`);
  });

  // Verify stored keys in Redis
  const cachedList = await redisService.getJson("rag:popular_questions");
  console.log("\n🔍 রেডিস ভ্যালিডেশন চেক:");
  console.log(`  - 'rag:popular_questions' সংরক্ষিত আইটেম: ${Array.isArray(cachedList) ? cachedList.length : 0}টি`);

  const activeUsersKey = "rag:users:hourly_window";
  const initialUsersCount = await redisService.sCard(activeUsersKey);
  console.log(`  - '${activeUsersKey}' বর্তমান সক্রিয় ব্যবহারকারী: ${initialUsersCount}/${MAX_HOURLY_USERS}`);

  console.log("=================================================");
  console.log("🎉 রেডিস অপারেশন সম্পন্ন হয়েছে।");
  process.exit(0);
}

seedPopularQuestionsToRedis().catch((err) => {
  console.error("❌ ত্রুটি:", err);
  process.exit(1);
});

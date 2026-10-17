/* eslint-disable @typescript-eslint/no-explicit-any */
import { envVars } from "../../config/env";

export class LLMService {
  private apiKey: string;
  private apiUrl: string = "https://openrouter.ai/api/v1";
  private model: string;

  constructor() {
    this.apiKey = envVars.RAG.OPENROUTER_API_KEY || "";
    this.model =
      envVars.RAG.OPENROUTER_LLM_MODEL ||
      "nvidia/nemotron-3-super-120b-a12b:free";
  }

  async generateResponse(
    prompt: string,
    context: string[] = [],
    asJson: boolean = false,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenRouter api key is missing in .env");
    }
    try {
      let fullPrompt =
        context.length > 0
          ? `আইনি ও প্রাতিষ্ঠানিক রেফারেন্স তথ্য (Context):\n${context.join("\n\n---\n\n")}\n\nব্যবহারকারীর প্রশ্ন বা পরিস্থিতি: ${prompt}\n\nউপরের প্রাসঙ্গিক রেফারেন্সের আলোকে বাংলায় পরিষ্কার ও তথ্যনিষ্ঠ উত্তর দিন। অপ্রাসঙ্গিক তথ্য বা অনুমান বর্জন করুন।`
          : prompt;

      if (asJson) {
        fullPrompt += `\n\nReturn ONLY a valid JSON object matching this structure: {"summary": "সংক্ষিপ্ত বিবরণ", "legalFindings": [{"law": "আইন বা বিধিমালার নাম", "section": "ধারা বা বিধি", "explanation": "ব্যাখ্যা"}], "recommendedAction": "ব্যবহারকারীর করণীয়"}. Do not include markdown formatting like \`\`\`json.`;
      }

      const systemMessage = asJson
        ? "আপনি 'ভূমিপ্রহরী' (BhumiProhori) প্ল্যাটফর্মের বিশেষজ্ঞ আইনি ও নথি যাচাইকরণ এআই উপদেষ্টা। বাংলাদেশের ভূমি আইন, জরিপ পদ্ধতি (CS, SA, RS, BS), নামজারি ও সাব-রেজিস্ট্রি দলিলের বিধিমালার আলোকে শুধুমাত্র প্রদত্ত Context ভিত্তিক সঠিক JSON উত্তর প্রদান করুন।"
        : "আপনি 'ভূমিপ্রহরী' (BhumiProhori) প্ল্যাটফর্মের বিশ্বস্ত ও অভিজ্ঞ এআই ভূমি সহকারী। সাধারণ নাগরিক ও ভূমি ক্রেতাদের বাংলাদেশের ভূমি জরিপ (CS, SA, RS, BS), নামজারি, খতিয়ান, বায়া দলিল ও নিবন্ধন বিধিমালার প্রেক্ষিতে সহজ ও প্রাঞ্জল বাংলায় তথ্যনিষ্ঠ ও সহায়ক উত্তর প্রদান করুন। যদি প্রদত্ত তথ্যে উত্তর না থাকে, তবে তা পরিষ্কারভাবে জানিয়ে প্রয়োজনীয় সতর্কতামূলক পরামর্শ দিন।";

      const bodyPayload: any = {
        model: this.model,
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: fullPrompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 1500,
      };

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://bhumiprohori.bangladesh",
          "X-Title": "BhumiProhori Land Verification AI",
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData?.error?.message || "unknown error"}`,
        );
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Error generating LLM response:", error);
      throw error;
    }
  }
}

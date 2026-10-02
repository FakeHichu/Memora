import { PromptRepository } from "../repositories/prompt.repository.js";
import type { DailyPromptEntity } from "../types/index.js";

const FALLBACK_PROMPTS = [
  "Show us your current view.",
  "What made you smile today?",
  "What's on your desk?",
  "Show us your lunch or study snack.",
  "Something blue.",
  "Something interesting you saw today.",
  "Your after-school life.",
  "Something that represents your day.",
  "Show us something you are working on.",
  "Capture a small moment from today.",
];

export class PromptService {
  static async getTodayPrompt(): Promise<DailyPromptEntity> {
    const todayDate = new Date().toISOString().slice(0, 10);
    const existing = await PromptRepository.getPromptForDate(todayDate);

    if (existing) {
      return existing;
    }

    // Pick from rotational array
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    const promptText = FALLBACK_PROMPTS[dayOfYear % FALLBACK_PROMPTS.length];

    try {
      return await PromptRepository.createPrompt(promptText, todayDate);
    } catch {
      // If concurrent insert occurred, retrieve again
      const retry = await PromptRepository.getPromptForDate(todayDate);
      if (retry) return retry;

      return {
        id: "virtual-prompt",
        prompt_text: promptText,
        prompt_date: todayDate,
        created_at: new Date().toISOString(),
      };
    }
  }
}

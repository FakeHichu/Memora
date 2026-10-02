import { getSupabaseClient } from "../lib/supabase.js";
import type { DailyPromptEntity } from "../types/index.js";

export class PromptRepository {
  static async getPromptForDate(
    dateStr: string,
  ): Promise<DailyPromptEntity | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("daily_prompts")
      .select("*")
      .eq("prompt_date", dateStr)
      .maybeSingle();

    if (error) throw error;
    return data as DailyPromptEntity | null;
  }

  static async createPrompt(
    promptText: string,
    promptDate: string,
  ): Promise<DailyPromptEntity> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("daily_prompts")
      .insert({ prompt_text: promptText, prompt_date: promptDate })
      .select()
      .single();

    if (error) throw error;
    return data as DailyPromptEntity;
  }
}

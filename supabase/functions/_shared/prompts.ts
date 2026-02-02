import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Get AI prompt from database with fallback to default
 *
 * @param supabase - Supabase client instance
 * @param functionName - Edge function name (e.g., 'write-draft', 'extract-insights')
 * @param fallbackPrompt - Default prompt to use if DB query fails
 * @returns System prompt string
 */
export async function getPrompt(
  supabase: SupabaseClient,
  functionName: string,
  fallbackPrompt: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('system_prompt')
      .eq('function_name', functionName)
      .single();

    if (error) {
      console.warn(`Failed to load prompt for ${functionName} from DB:`, error.message);
      console.warn('Using fallback prompt');
      return fallbackPrompt;
    }

    if (!data || !data.system_prompt) {
      console.warn(`No prompt found for ${functionName} in DB`);
      console.warn('Using fallback prompt');
      return fallbackPrompt;
    }

    console.log(`Successfully loaded prompt for ${functionName} from DB`);
    return data.system_prompt;
  } catch (err) {
    console.error(`Error loading prompt for ${functionName}:`, err);
    console.warn('Using fallback prompt');
    return fallbackPrompt;
  }
}

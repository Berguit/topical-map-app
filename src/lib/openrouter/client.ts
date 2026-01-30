const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call OpenRouter API with Claude
 *
 * Supports two call signatures:
 * 1. callOpenRouter(prompt, systemPrompt?, options?) - Simple string-based
 * 2. callOpenRouter(messages, options?) - Full message array (legacy)
 */
export async function callOpenRouter(
  promptOrMessages: string | Message[],
  systemPromptOrOptions?: string | OpenRouterOptions,
  options?: OpenRouterOptions
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  // Determine which signature was used
  let messages: Message[];
  let opts: OpenRouterOptions;

  if (typeof promptOrMessages === "string") {
    // New signature: callOpenRouter(prompt, systemPrompt?, options?)
    const prompt = promptOrMessages;
    const systemPrompt = typeof systemPromptOrOptions === "string" ? systemPromptOrOptions : undefined;
    opts = typeof systemPromptOrOptions === "object" ? systemPromptOrOptions : (options || {});

    messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });
  } else {
    // Legacy signature: callOpenRouter(messages, options?)
    messages = promptOrMessages;
    opts = (typeof systemPromptOrOptions === "object" ? systemPromptOrOptions : {}) as OpenRouterOptions;
  }

  const model = opts.model || process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4";

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_SITE_NAME || "Topical Map SaaS",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data: OpenRouterResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from OpenRouter");
  }

  return data.choices[0].message.content;
}

/**
 * Helper to parse JSON from LLM response (handles markdown code blocks)
 */
export function parseJSONResponse<T>(response: string): T {
  // Remove markdown code blocks if present
  let cleaned = response.trim();

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", cleaned.substring(0, 500));
    throw new Error(`Failed to parse LLM response as JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

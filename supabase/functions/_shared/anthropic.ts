const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function callAnthropic(options: {
  model?: string;
  system: string;
  messages: Message[];
  maxTokens?: number;
}): Promise<string> {
  const {
    model = 'claude-sonnet-4-20250514',
    system,
    messages,
    maxTokens = 4096,
  } = options;

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data: AnthropicResponse = await response.json();
  return data.content[0].text;
}

// JSON 응답을 파싱하는 헬퍼
export function parseJsonResponse<T>(text: string): T {
  // JSON 블록 추출 시도
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }

  // 직접 JSON 파싱 시도
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse JSON from response: ${text.substring(0, 200)}...`);
  }
}

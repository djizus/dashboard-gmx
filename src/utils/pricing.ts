// Anthropic Claude pricing (per 1M tokens) as of July 2025
export const ANTHROPIC_PRICING = {
  'claude-sonnet-4-20250514': {
    input: 3.0,   // $3.00 per 1M input tokens
    output: 15.0, // $15.00 per 1M output tokens
  },
  'claude-3-5-sonnet-20241022': {
    input: 3.0,
    output: 15.0,
  },
  'claude-3-opus-20240229': {
    input: 15.0,
    output: 75.0,
  },
  'claude-3-haiku-20240307': {
    input: 0.25,
    output: 1.25,
  },
} as const;

export interface AnthropicUsageItem {
  key_id: string;
  key_name: string;
  model_name: string;
  workspace_id: string;
  usage_type: string;
  prompt_token_count_tier: string;
  input: number;
  output: number;
  input_cache_write: number;
  input_cache_write_1h: number;
  input_cache_read: number;
  input_no_cache: number;
  web_search_count: number;
}

export interface AnthropicUsageResponse {
  usages: Record<string, AnthropicUsageItem[]>;
  granularity: string;
}

export function calculateAnthropicCost(item: AnthropicUsageItem): number {
  const pricing = ANTHROPIC_PRICING[item.model_name as keyof typeof ANTHROPIC_PRICING];
  
  if (!pricing) {
    console.warn(`No pricing found for model: ${item.model_name}`);
    return 0;
  }

  const inputCost = (item.input / 1_000_000) * pricing.input;
  const outputCost = (item.output / 1_000_000) * pricing.output;
  
  return inputCost + outputCost;
}

export function processAnthropicUsageData(data: AnthropicUsageResponse) {
  const dailyTotals = new Map<string, {
    date: string;
    model_name: string;
    key_name: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cost: number;
    requests: number;
  }>();
  
  // Aggregate all usage for each day
  for (const [date, items] of Object.entries(data.usages)) {
    const dayTotal = {
      date,
      model_name: 'claude-sonnet-4-20250514',
      key_name: items[0]?.key_name || 'my_agent_key',
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      cost: 0,
      requests: items.length,
    };
    
    for (const item of items) {
      dayTotal.input_tokens += item.input;
      dayTotal.output_tokens += item.output;
      dayTotal.cost += calculateAnthropicCost(item);
    }
    
    dayTotal.total_tokens = dayTotal.input_tokens + dayTotal.output_tokens;
    dailyTotals.set(date, dayTotal);
  }
  
  return Array.from(dailyTotals.values()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
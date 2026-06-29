/**
 * useAIInsights — streams structured insight cards from Google Gemini Flash.
 *
 * TODO (production): This hook calls the Gemini API directly from the browser.
 * The API key (VITE_GEMINI_API_KEY) is embedded in the client bundle and visible
 * to anyone who inspects the network requests or build output.
 * For a commercial deployment, replace the fetch() here with a call to your own
 * backend endpoint (e.g. POST /api/ai/insights) that holds the key server-side.
 */

import { useState, useEffect } from 'react';
import type { HrSummary } from '../services/hrmsApi';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIInsight {
  id: string;
  category: 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'APPROVALS';
  title: string;
  body: string;
  confidence: number;
  action: string;
  sentiment: 'positive' | 'warning' | 'critical' | 'neutral';
}

export interface UseAIInsightsReturn {
  insights: AIInsight[];
  loading: boolean;
  streaming: boolean;
  error: string | null;
  streamingText: string;
  generate: () => void;
  lastGeneratedAt: Date | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAIInsights(summary: HrSummary | null): UseAIInsightsReturn {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [lastGeneratedAt, setLastGeneratedAt] = useState<Date | null>(null);

  async function generate() {
    if (loading || streaming) return;
    setLoading(true);
    setError(null);
    setStreamingText('');

    // Build context string from summary — defensive against missing fields
    const ctx = summary
      ? `
        Total employees: ${(summary as any).totalEmployees ?? (summary as any).total ?? 'unknown'}
        Present today: ${(summary as any).presentToday ?? (summary as any).present ?? 'unknown'}
        On leave today: ${(summary as any).onLeave ?? (summary as any).onLeaveToday ?? 'unknown'}
        Pending leave requests: ${(summary as any).pendingLeaves ?? (summary as any).pending ?? 'unknown'}
        Pending approvals: ${(summary as any).pendingApprovals ?? 'unknown'}
        Total monthly payroll: ${(summary as any).totalPayroll ?? (summary as any).payrollTotal ?? 'unknown'}
        Active employees: ${(summary as any).activeEmployees ?? 'unknown'}
      `.trim()
      : 'No summary data available — generate general HRMS insights.';

    const systemInstruction = `You are an expert HR analytics AI embedded in HRMSPro, 
an enterprise HRMS platform. You analyse workforce data and return structured 
JSON insights. You are precise, data-driven, and commercially focused. 
You never fabricate specific employee names or IDs. 
You always return ONLY valid JSON — no markdown, no preamble, no explanation.`;

    const userPrompt = `Analyse this HR workforce snapshot and return exactly 4 
insight cards as a JSON array. Each card identifies a workforce signal, risk, or 
opportunity an HR manager should act on today.

Current workforce data:
${ctx}

Return this exact JSON structure (array of 4 objects, nothing else):
[
  {
    "id": "unique_string",
    "category": "ATTENDANCE" | "LEAVE" | "PAYROLL" | "APPROVALS",
    "title": "concise headline under 8 words",
    "body": "1-2 sentence insight with specific numbers where available. Be direct.",
    "confidence": number between 70 and 99,
    "action": "2-3 word CTA e.g. Review now",
    "sentiment": "positive" | "warning" | "critical" | "neutral"
  }
]

Rules:
- Use exactly these 4 categories, one card each: ATTENDANCE, LEAVE, PAYROLL, APPROVALS
- confidence reflects how certain you are given the data quality (higher if data is specific)
- sentiment: positive=good news, warning=needs attention, critical=urgent, neutral=informational
- If a data field is unknown, make a reasonable inference but lower confidence accordingly
- Return ONLY the JSON array. No markdown. No explanation. No backticks.`;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';
      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file.');
      }

      // Use Gemini 1.5 Flash with SSE streaming (separate quota pool from 2.0)
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.4,
          },
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        // Extract clean message from Gemini error JSON
        let cleanMsg = `Gemini API error ${response.status}`;
        try {
          const errJson = JSON.parse(errBody);
          const msg = errJson?.error?.message ?? errJson?.message;
          if (msg) cleanMsg = msg.split('\n')[0].slice(0, 120);
        } catch { /* keep default */ }
        throw new Error(cleanMsg);
      }

      setLoading(false);
      setStreaming(true);

      // Stream processing — Gemini SSE format
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            // Gemini SSE format: candidates[0].content.parts[0].text
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (typeof text === 'string') {
              accumulated += text;
              setStreamingText(accumulated);
            }
          } catch {
            // Partial JSON line — skip
          }
        }
      }

      // Strip any accidental markdown fences the model might add
      const clean = accumulated
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Find the JSON array in the response
      const arrayStart = clean.indexOf('[');
      const arrayEnd = clean.lastIndexOf(']');
      if (arrayStart === -1 || arrayEnd === -1) {
        throw new Error('Model did not return a valid JSON array');
      }

      const jsonStr = clean.slice(arrayStart, arrayEnd + 1);
      const parsed: AIInsight[] = JSON.parse(jsonStr);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Invalid insight structure returned');
      }

      const VALID_CATEGORIES = ['ATTENDANCE', 'LEAVE', 'PAYROLL', 'APPROVALS'];
      const VALID_SENTIMENTS = ['positive', 'warning', 'critical', 'neutral'];

      const validated: AIInsight[] = parsed.map((item, i) => ({
        id: item.id ?? `insight-${i}`,
        category: (VALID_CATEGORIES.includes(item.category)
          ? item.category
          : 'ATTENDANCE') as AIInsight['category'],
        title: item.title ?? 'Workforce insight',
        body: item.body ?? '',
        confidence:
          typeof item.confidence === 'number'
            ? Math.min(99, Math.max(50, item.confidence))
            : 80,
        action: item.action ?? 'Review now',
        sentiment: (VALID_SENTIMENTS.includes(item.sentiment)
          ? item.sentiment
          : 'neutral') as AIInsight['sentiment'],
      }));

      setInsights(validated);
      setLastGeneratedAt(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate insights',
      );
    } finally {
      setLoading(false);
      setStreaming(false);
      setStreamingText('');
    }
  }

  // Auto-generate when summary first becomes available
  // Uses a ref to ensure we only trigger once even if summary changes later
  const hasAutoGenerated = useState(false);
  useEffect(() => {
    if (summary && !hasAutoGenerated[0]) {
      hasAutoGenerated[1](true);
      const timer = setTimeout(() => void generate(), 800);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  return {
    insights,
    loading,
    streaming,
    error,
    streamingText,
    generate,
    lastGeneratedAt,
  };
}

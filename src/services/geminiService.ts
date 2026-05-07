/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

/**
 * Optimizes the KB data for token efficiency
 */
function formatKBForPrompt(kb: { definitions: Record<string, string>, data: any[] }) {
  if (kb.data.length === 0) return "No records found.";
  
  const headers = Object.keys(kb.data[0]);
  const headerRow = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const rows = kb.data.map(row => `| ${headers.map(h => String(row[h] || "").replace(/\|/g, "\\|")).join(" | ")} |`).join("\n");
  
  return `${headerRow}\n${separator}\n${rows}`;
}

function generateSystemInstruction(kb: { definitions: Record<string, string>, data: any[] }) {
  return `
You are the "SubroGuide AI Copilot," an ultra-fast query engine for Motor Subrogation Insurance.
Your primary function is to analyze the provided Knowledge Base (KB) and answer user questions with 100% data fidelity.

### DATABASE OVERVIEW
- Indexed Records: ${kb.data.length}

### COLUMN DEFINITIONS
${Object.entries(kb.definitions)
  .map(([key, def]) => `- **${key}**: ${def}`)
  .join("\n")}

### SEARCH GUIDELINES
1. **Direct Match**: Search across 'naf_claim_number', 'af_claim_number', and 'police_report_id'.
2. **Aggregations**: If asked "How many...", count the records. 
3. **Filtering**: If asked about a status, check 'Status'.
4. **Subrogation**: "NAF" is client. "AF" is opponent. "Recovery" is money returned.

### RESPONSE STYLE
- **Concise & Accurate**: Provide the answer immediately without preamble if possible.
- **Data Focused**: If not in KB, say: "Claim matching details not found."
- **Structured Output**: Use Markdown tables for lists.

### RAW DATA (MARKDOWN FORMAT)
${formatKBForPrompt(kb)}

STRICT RULE: Do NOT hallucinate. Only cite information found in the RAW DATA block above.
`;
}

export async function chatWithCopilot(
  userMessage: string, 
  kb: { definitions: Record<string, string>, data: any[] },
  history: { role: "user" | "model"; parts: { text: string }[] }[] = [],
  onChunk?: (text: string) => void
) {
  try {
    const contents = [
      ...history,
      { role: "user" as const, parts: [{ text: userMessage }] }
    ];

    const config = {
      systemInstruction: generateSystemInstruction(kb),
      temperature: 0.1,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    };

    if (onChunk) {
      const response = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents,
        config
      });

      let fullText = "";
      for await (const chunk of response) {
        const chunkText = chunk.text || "";
        fullText += chunkText;
        onChunk(chunkText);
      }
      return fullText;
    } else {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config
      });
      return response.text || "I'm sorry, I couldn't process that request.";
    }
  } catch (error) {
    console.error("AI Copilot Error:", error);
    return "Error: Could not connect to the AI Copilot. Please try again later.";
  }
}

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, jobDescription } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "OPENAI_API_KEY is not configured. Please set your OPENAI_API_KEY in .env.local to enable the AI Hiring Manager.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = `You are a strict but fair Hiring Manager. You are interviewing the user for a role based on this Job Description: ${jobDescription || "Not provided"}. 
RULES: 
1. Introduce yourself briefly and ask the first interview question. 
2. Ask ONLY ONE question at a time. Never ask multiple questions in a single message.
3. Evaluate their previous answer silently, then ask a follow-up or move to a new topic.
4. Keep your responses concise and professional.`;

    const result = streamText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Error in /api/chat route:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "An unexpected error occurred while processing the chat request.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

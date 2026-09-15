import { streamText, type LanguageModelV1 } from "ai";
import { openai } from "@ai-sdk/openai";
import { MockLanguageModelV1 } from "ai/test";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

/**
 * Creates an intelligent simulated Hiring Manager model when OPENAI_API_KEY is not configured.
 * This allows full testing and evaluation of the interview simulator without requiring paid credentials.
 */
function createSimulatedHiringManager(jobDescription: string, messages: any[]): LanguageModelV1 {
  const lastMessage = messages[messages.length - 1];
  const isFeedbackTrigger =
    lastMessage?.role === "system" &&
    typeof lastMessage?.content === "string" &&
    lastMessage.content.includes("The interview is over");

  // Extract a sensible role name from job description
  const roleName =
    jobDescription
      ?.split("\n")
      .map((l) => l.replace(/^(Position|Role|Title|Job Title):?\s*/i, "").trim())
      .find((l) => l.length > 0) || "Candidate Position";

  let responseChunks: string[] = [];

  if (isFeedbackTrigger) {
    // Generate comprehensive evaluation scorecard
    responseChunks = [
      `# Candidate Evaluation Scorecard: ${roleName}\n\n`,
      `**Interview Date:** ${new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}  \n`,
      `**Evaluator:** AI Hiring Manager  \n`,
      `**Target Position:** ${roleName}  \n\n`,
      `---\n\n`,
      `## Executive Summary\n`,
      `The candidate completed the full interview cycle for the **${roleName}** role. Overall, they demonstrated solid domain knowledge, thoughtful articulation of problem-solving methodologies, and strong communication skills aligned with our engineering and cultural standards.\n\n`,
      `## Strengths\n`,
      `- **Structured Problem Solving:** Articulated technical decisions clearly using structured frameworks (Situation, Task, Action, Result).\n`,
      `- **Technical Breadth & Depth:** Demonstrated familiarity with core technologies, architectural scalability patterns, and trade-off considerations.\n`,
      `- **Cross-Functional Communication:** Effectively explained technical challenges with clarity, showing empathy for product and team velocity.\n`,
      `- **Ownership Mindset:** Displayed high accountability for production systems, testing hygiene, and proactive monitoring.\n\n`,
      `## Areas for Improvement\n`,
      `- **Concrete Metrics & Impact:** Could enhance responses by incorporating specific quantitative metrics (e.g., latency reductions, percentage uptime improvements, team velocity gains).\n`,
      `- **Edge-Case & Failure Scenarios:** Deepen elaboration on failure modes, error recovery, and disaster recovery strategies in distributed systems.\n`,
      `- **Deep-Dive Trade-Offs:** Discuss alternative technologies evaluated before settling on the chosen solution.\n\n`,
      `## Final Hiring Decision\n`,
      `**Decision:** **STRONG HIRE**\n\n`,
      `**Recommendation:** The candidate demonstrates the requisite technical capability, maturity, and collaborative mindset for the **${roleName}** position. We recommend advancing them to the team-match and offer stage.\n`,
    ];
  } else {
    // Determine the interview step based on user messages count
    const userMessages = messages.filter((m: any) => m.role === "user");
    const step = userMessages.length;

    switch (step) {
      case 1:
        responseChunks = [
          `Hello! I'm Alex, the Hiring Manager for the **${roleName}** role. Thank you for taking the time to speak with me today.\n\n`,
          `To start off our conversation: Could you walk me through a challenging technical problem you solved recently, including how you approached the root cause and the final outcome?`,
        ];
        break;
      case 2:
        responseChunks = [
          `Thank you for detailing that experience. It's great to see your hands-on approach to debugging and resolution.\n\n`,
          `Given the responsibilities outlined in this job description, how do you typically evaluate trade-offs between rapid product delivery and long-term architectural maintainability?`,
        ];
        break;
      case 3:
        responseChunks = [
          `That makes sense. Balancing immediate product deadlines with technical debt is a daily reality for our engineering team.\n\n`,
          `Could you share an example of a technical disagreement you had with a teammate, designer, or product manager, and how you navigated it to reach a shared alignment?`,
        ];
        break;
      case 4:
        responseChunks = [
          `Effective cross-functional communication is critical for this position, and that's a great example of constructive resolution.\n\n`,
          `Looking at the tech stack and performance demands of this role, what specific practices do you rely on for state management, caching, and minimizing latency in production?`,
        ];
        break;
      case 5:
      default:
        responseChunks = [
          `Appreciate those technical specifics. For our final interview question:\n\n`,
          `How do you ensure comprehensive testing (unit, integration, end-to-end) and automated security guardrails before deploying changes to critical production environments?`,
        ];
        break;
    }
  }

  // Create mock language model streaming chunks with realistic timing
  return new MockLanguageModelV1({
    doStream: async (options) => ({
      rawCall: { rawPrompt: options.prompt, rawSettings: {} },
      stream: new ReadableStream({
        async start(controller) {
          for (const chunk of responseChunks) {
            // Split chunk into smaller words for realistic streaming animation
            const words = chunk.split(" ");
            for (let i = 0; i < words.length; i++) {
              const word = words[i] + (i < words.length - 1 ? " " : "");
              controller.enqueue({ type: "text-delta", textDelta: word });
              // Small delay between tokens for realistic streaming
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
          }
          controller.enqueue({
            type: "finish",
            finishReason: "stop",
            usage: { promptTokens: 50, completionTokens: 150 },
          });
          controller.close();
        },
      }),
    }),
  });
}

export async function POST(req: Request) {
  try {
    const { messages, jobDescription } = await req.json();

    const systemPrompt = `You are a strict but fair Hiring Manager. You are interviewing the user for a role based on this Job Description: ${jobDescription || "Not provided"}. 
RULES: 
1. Introduce yourself briefly and ask the first interview question. 
2. Ask ONLY ONE question at a time. Never ask multiple questions in a single message.
3. Evaluate their previous answer silently, then ask a follow-up or move to a new topic.
4. Keep your responses concise and professional.`;

    // If OPENAI_API_KEY is configured, use live OpenAI model; otherwise use intelligent simulator
    const isLive = Boolean(process.env.OPENAI_API_KEY);
    const model: LanguageModelV1 = isLive
      ? openai(process.env.OPENAI_MODEL || "gpt-4o-mini")
      : createSimulatedHiringManager(jobDescription, messages || []);

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
    });

    const response = result.toDataStreamResponse();
    // Signal mode in custom response header
    response.headers.set("x-ai-mode", isLive ? "live" : "simulated");
    return response;
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

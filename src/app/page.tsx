"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import {
  Briefcase,
  Play,
  Send,
  User,
  Bot,
  Sparkles,
  Award,
  ArrowRight,
  RotateCcw,
  Clock,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Copy,
  Check,
} from "lucide-react";

export type InterviewState = "SETUP" | "INTERVIEW" | "FEEDBACK";

const SAMPLE_JOB_DESCRIPTIONS = [
  {
    title: "Senior Full Stack Engineer (Next.js & Node.js)",
    description: `Position: Senior Full Stack Engineer
Company: TechFlow Innovations
Location: Remote (US / Global)

About the Role:
We are looking for an experienced Senior Full Stack Engineer to lead the architecture and development of our customer-facing web applications. You will work closely with product managers, designers, and engineering leadership to deliver scalable, high-performance features.

Key Responsibilities:
- Build and maintain responsive web applications using Next.js (App Router), TypeScript, and Tailwind CSS.
- Design, deploy, and monitor scalable RESTful and GraphQL APIs using Node.js and PostgreSQL.
- Optimize web application performance, accessibility, and SEO.
- Mentor junior engineers and participate in architectural reviews and code reviews.
- Collaborate with DevOps to maintain CI/CD pipelines and infrastructure as code.

Requirements:
- 5+ years of production experience with modern JavaScript/TypeScript and React.
- Strong proficiency in Next.js, Node.js, SQL, and cloud platforms (AWS or Vercel).
- Deep understanding of web security, caching, state management, and testing frameworks.
- Excellent communication and problem-solving skills in an agile environment.`,
  },
  {
    title: "Product Manager (AI Products)",
    description: `Position: Technical Product Manager - AI & Platform
Company: Apex Intelligent Systems
Location: Hybrid (San Francisco, CA)

About the Role:
We are seeking a driven Technical Product Manager to define and lead our generative AI product roadmap. You will sit at the intersection of business strategy, AI engineering, and user experience.

Key Responsibilities:
- Define product strategy, write detailed PRDs, and prioritize features for our LLM-powered tools.
- Partner with machine learning researchers and software engineers to bring AI prototypes to production.
- Analyze user feedback, engagement metrics, and A/B test results to drive retention and growth.
- Manage cross-functional stakeholders including sales, marketing, legal, and executive leadership.

Requirements:
- 3+ years in product management with a proven track record of shipping software products.
- Strong technical literacy in AI/LLMs, APIs, and modern web architectures.
- Data-driven mindset with experience in SQL, Amplitude, or similar analytics tools.
- Exceptional verbal and written communication skills.`,
  },
];

export default function InterviewSimulatorPage() {
  const [interviewState, setInterviewState] = useState<InterviewState>("SETUP");
  const [jobDescription, setJobDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedScorecard, setCopiedScorecard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Vercel AI SDK useChat
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    status,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      jobDescription,
    },
  });

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (interviewState === "INTERVIEW") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, interviewState]);

  // Handle starting the interview from SETUP
  const handleStartInterview = async () => {
    if (!jobDescription.trim()) {
      setErrorMsg("Please provide a Job Description before starting the interview.");
      return;
    }
    if (jobDescription.trim().length < 50) {
      setErrorMsg("The Job Description is too brief. Please paste a more detailed description (at least 50 characters).");
      return;
    }

    setErrorMsg("");
    setInterviewState("INTERVIEW");

    // Initiate the interview if no messages yet
    if (messages.length === 0) {
      await append({
        role: "user",
        content: "Hello! I am ready for the interview. Please introduce yourself and ask your first question.",
      });
    }
  };

  // Reset interview back to SETUP
  const handleReset = () => {
    if (confirm("Are you sure you want to reset? Current interview progress will be cleared.")) {
      setMessages([]);
      setInterviewState("SETUP");
    }
  };

  // Switch to feedback view
  const handleViewFeedback = () => {
    setInterviewState("FEEDBACK");
  };

  // Find candidate role title from JD (first non-empty line or fallback)
  const roleTitle = React.useMemo(() => {
    if (!jobDescription) return "Candidate Role";
    const firstLine = jobDescription
      .split("\n")
      .map((l) => l.replace(/^(Position|Role|Title|Job Title):?\s*/i, "").trim())
      .find((l) => l.length > 0);
    return firstLine || "Target Position";
  }, [jobDescription]);

  // Calculate interview metrics
  const userMessagesCount = messages.filter((m) => m.role === "user").length;
  const aiMessagesCount = messages.filter((m) => m.role === "assistant").length;

  // Extract feedback text (from last assistant message or placeholder)
  const lastAiMessage = [...messages].reverse().find((m) => m.role === "assistant")?.content;

  const copyScorecardToClipboard = () => {
    const textToCopy = lastAiMessage || "No scorecard generated yet.";
    navigator.clipboard.writeText(textToCopy);
    setCopiedScorecard(true);
    setTimeout(() => setCopiedScorecard(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
      {/* State Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Step 1: SETUP */}
          <button
            onClick={() => interviewState !== "SETUP" && setInterviewState("SETUP")}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              interviewState === "SETUP"
                ? "text-blue-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                interviewState === "SETUP"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              1
            </span>
            <span>Job Setup</span>
          </button>

          <div className="flex-1 h-[2px] mx-3 bg-slate-800">
            <div
              className={`h-full bg-blue-500 transition-all duration-300 ${
                interviewState === "SETUP"
                  ? "w-0"
                  : interviewState === "INTERVIEW"
                  ? "w-1/2"
                  : "w-full"
              }`}
            />
          </div>

          {/* Step 2: INTERVIEW */}
          <button
            onClick={() => jobDescription && setInterviewState("INTERVIEW")}
            disabled={!jobDescription}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              interviewState === "INTERVIEW"
                ? "text-blue-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                interviewState === "INTERVIEW"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              2
            </span>
            <span>Interview</span>
          </button>

          <div className="flex-1 h-[2px] mx-3 bg-slate-800">
            <div
              className={`h-full bg-blue-500 transition-all duration-300 ${
                interviewState === "FEEDBACK" ? "w-full" : "w-0"
              }`}
            />
          </div>

          {/* Step 3: FEEDBACK */}
          <button
            onClick={() => messages.length > 0 && setInterviewState("FEEDBACK")}
            disabled={messages.length === 0}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              interviewState === "FEEDBACK"
                ? "text-blue-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                interviewState === "FEEDBACK"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}
            >
              3
            </span>
            <span>Feedback</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STATE 1: SETUP */}
      {/* ========================================================================= */}
      {interviewState === "SETUP" && (
        <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-300">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                  Target Job Description
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Paste the job posting you want to practice for. The AI Hiring Manager will
                  adapt its technical questions, seniority expectations, and follow-ups based on this role.
                </p>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Or load a sample role:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_JOB_DESCRIPTIONS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setJobDescription(sample.description);
                      setErrorMsg("");
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors text-left"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartInterview();
              }}
              className="space-y-4"
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="jobDescription"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Job Description (Paste Here)
                  </label>
                  <span className="text-xs text-slate-400">
                    {jobDescription.length} characters
                  </span>
                </div>
                <textarea
                  id="jobDescription"
                  rows={10}
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="Paste the full job requirements, responsibilities, tech stack, and qualifications here..."
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono transition-all resize-y"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Strict, one-at-a-time questions &middot; Tailored follow-ups</span>
                </div>

                <button
                  type="submit"
                  disabled={!jobDescription.trim()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Interview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE 2: INTERVIEW */}
      {/* ========================================================================= */}
      {interviewState === "INTERVIEW" && (
        <div className="flex-1 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm animate-in fade-in duration-300">
          {/* Top Bar */}
          <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-200 truncate">
                    Hiring Manager
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Interview
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  Role: <span className="text-slate-300 font-medium">{roleTitle}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>{userMessagesCount} answers given</span>
              </div>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleViewFeedback}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Scorecard</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                title="Reset Interview"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[400px] max-h-[60vh]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                <p className="text-sm font-medium text-slate-300">Connecting to Hiring Manager...</p>
                <p className="text-xs text-slate-500 mt-1">Reviewing the job description to generate your first question.</p>
              </div>
            ) : (
              messages.map((message) => {
                const isAi = message.role === "assistant";
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      isAi ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isAi && (
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isAi
                          ? "bg-slate-800/90 text-slate-100 border border-slate-700/60 shadow-sm"
                          : "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] font-semibold uppercase tracking-wider ${
                            isAi ? "text-blue-400" : "text-blue-100"
                          }`}
                        >
                          {isAi ? "Hiring Manager" : "You (Candidate)"}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap font-sans">{message.content}</div>
                    </div>

                    {!isAi && (
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Typing / Streaming Indicator */}
            {(status === "submitted" || status === "streaming") && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:0.4s]" />
                  <span className="text-xs ml-1 text-slate-400">
                    {status === "submitted" ? "Evaluating response..." : "Typing question..."}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Type your response to the hiring manager..."
                className="flex-1 bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Tip: Structure answers with the STAR method (Situation, Task, Action, Result)</span>
              <span>Enter to send</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE 3: FEEDBACK */}
      {/* ========================================================================= */}
      {interviewState === "FEEDBACK" && (
        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-300">
          {/* Dashboard Header */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">
                    Interview Evaluation Scorecard
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Role: <span className="text-slate-200 font-medium">{roleTitle}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyScorecardToClipboard}
                  className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  {copiedScorecard ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Scorecard</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setInterviewState("INTERVIEW")}
                  className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Resume Chat</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 text-xs font-medium rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Interview</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Questions Answered</p>
                  <p className="text-lg font-bold text-slate-100">{userMessagesCount}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Exchanges</p>
                  <p className="text-lg font-bold text-slate-100">{messages.length}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Evaluation Status</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {lastAiMessage ? "Ready" : "Pending Feedback"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Scorecard Content */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
            <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Hiring Manager Assessment</span>
            </h3>

            {lastAiMessage ? (
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                {lastAiMessage}
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                <Award className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-300">
                  No Final Feedback Generated Yet
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Complete the interview questions with the Hiring Manager, then trigger the feedback scorecard to view Strengths, Areas for Improvement, and Hiring Decision.
                </p>
                <button
                  type="button"
                  onClick={() => setInterviewState("INTERVIEW")}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors inline-flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Return to Interview</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

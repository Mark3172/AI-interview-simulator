import React from "react";
import {
  Award,
  ThumbsUp,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface MarkdownScorecardProps {
  content: string;
}

/**
 * Clean, zero-dependency Markdown renderer optimized for the Interview Scorecard view.
 * Highlights Strengths, Areas for Improvement, and Hiring Decision with custom styled cards.
 */
export function MarkdownScorecard({ content }: MarkdownScorecardProps) {
  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 text-xs font-mono"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="my-2 space-y-2 pl-1">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-slate-300 text-sm leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
              <span>{renderInlineFormatting(item)}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // List item detection
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed)) {
      const itemContent = trimmed.replace(/^([-*]|\d+\.)\s*/, "");
      currentList.push(itemContent);
      return;
    }

    // Flush any pending list items
    flushList(`flush-${index}`);

    if (!trimmed) {
      elements.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    // H1 Heading / Document Title
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${index}`}
          className="text-xl sm:text-2xl font-bold text-slate-100 mt-2 mb-4 pb-3 border-b border-slate-800 flex items-center gap-2.5"
        >
          <Award className="w-6 h-6 text-amber-400 shrink-0" />
          <span>{trimmed.replace(/^#\s+/, "")}</span>
        </h1>
      );
      return;
    }

    // H2 Section Headers
    if (trimmed.startsWith("## ")) {
      const title = trimmed.replace(/^##\s+/, "");
      const isStrengths = /strength/i.test(title);
      const isImprovement = /improvement|growth|weakness|area/i.test(title);
      const isDecision = /decision|verdict|outcome|recommendation/i.test(title);

      elements.push(
        <div
          key={`h2-${index}`}
          className={`mt-6 mb-3 p-3.5 rounded-xl border flex items-center gap-3 ${
            isStrengths
              ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300 shadow-sm"
              : isImprovement
              ? "bg-amber-950/40 border-amber-800/60 text-amber-300 shadow-sm"
              : isDecision
              ? "bg-blue-950/50 border-blue-700/60 text-blue-200 shadow-sm"
              : "bg-slate-800/60 border-slate-700/60 text-slate-200"
          }`}
        >
          {isStrengths ? (
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ThumbsUp className="w-4 h-4" />
            </div>
          ) : isImprovement ? (
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          ) : isDecision ? (
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
      );
      return;
    }

    // H3 Subsections
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-sm font-semibold text-slate-200 mt-4 mb-2 flex items-center gap-1.5"
        >
          <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
          <span>{trimmed.replace(/^###\s+/, "")}</span>
        </h3>
      );
      return;
    }

    // Horizontal separator
    if (trimmed === "---" || trimmed === "***") {
      elements.push(<hr key={`hr-${index}`} className="my-5 border-slate-800" />);
      return;
    }

    // Paragraph
    elements.push(
      <p key={`p-${index}`} className="text-sm text-slate-300 leading-relaxed my-1.5">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });

  flushList("final");

  return <div className="space-y-1">{elements}</div>;
}

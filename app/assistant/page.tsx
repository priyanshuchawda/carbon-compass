"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { loadSessionPayload } from "@/lib/carbon/session";
import { calculateFootprint } from "@/lib/carbon/calculate";
import type { FootprintResult, UserProfile, FootprintInput } from "@/lib/carbon/types";
import { demoProfile, demoFootprintInput, demoFootprintResult } from "@/lib/carbon/demo";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "What is driving my emissions the most?",
  "Give me three practical ways to cut my footprint.",
  "How does my footprint compare to the India average?",
  "What does my eco score mean and how can I improve it?"
];

export default function AssistantPage() {
  const [profile, setProfile] = useState<UserProfile>(demoProfile);
  const [footprint, setFootprint] = useState<FootprintInput>(demoFootprintInput);
  const [result, setResult] = useState<FootprintResult>(demoFootprintResult);
  const [isDemo, setIsDemo] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = loadSessionPayload();
    if (session) {
      setProfile(session.profile);
      setFootprint(session.footprint);
      const res = calculateFootprint(session.footprint, session.profile);
      setResult(res);
      setIsDemo(false);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setError("");
    setLoading(true);

    const userMessage: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue("");

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          result,
          footprint,
          messages: nextMessages
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response from assistant.");
      }

      const data = await response.json();
      if (data.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Empty response from assistant.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-[#f6fbf8] flex flex-col">
      <section className="mx-auto w-full max-w-4xl px-6 py-8 flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              AI Carbon Assistant
            </h1>
            <p className="mt-1 text-sm text-slate-700">
              Ask questions about your footprint, emissions breakdown, or sustainability advice.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            Back to dashboard
          </Link>
        </div>

        {isDemo && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Showing demo profile data. Complete the{" "}
            <Link href="/calculator" className="font-semibold underline underline-offset-2">
              calculator
            </Link>{" "}
            to ask questions grounded in your real emissions.
          </div>
        )}

        {/* Chat window */}
        <div className="flex-1 min-h-[400px] rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
          {/* Chat messages */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Conversation with Carbon Compass assistant"
            className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">How can I help you today?</h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-sm">
                    Select a suggestion below or write a custom question about your carbon footprint.
                  </p>
                </div>
                <div className="grid gap-2 w-full max-w-md">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="w-full text-left rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 transition hover:bg-slate-100 hover:border-slate-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-emerald-700 text-white"
                          : "bg-slate-100 text-slate-900 border border-slate-200"
                      }`}
                    >
                      <span className="sr-only">
                        {msg.role === "user" ? "You: " : "Assistant: "}
                      </span>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-500 rounded-lg px-4 py-2.5 text-sm border border-slate-200 flex items-center gap-1">
                      <span className="sr-only">Thinking</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-pulse" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-pulse delay-75" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-pulse delay-150" />
                    </div>
                  </div>
                )}
                {error && (
                  <div className="rounded-md bg-red-50 p-3 border border-red-200">
                    <p className="text-xs text-red-800" role="alert">
                      {error}
                    </p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-slate-200 p-3 bg-slate-50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(inputValue);
              }}
              className="flex gap-2"
            >
              <label htmlFor="chat-input" className="sr-only">
                Ask about your carbon footprint
              </label>
              <input
                id="chat-input"
                type="text"
                placeholder="Ask about your emissions breakdown..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
                className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

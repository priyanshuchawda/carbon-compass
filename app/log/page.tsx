"use client";

import { useState } from "react";
import { ActivityEmptyState } from "@/components/carbon/activity-empty-state";
import { ActivityForm } from "@/components/carbon/activity-form";
import { ActivityTable } from "@/components/carbon/activity-table";
import {
  addActivityLogEntry,
  clearActivityLog,
  deleteActivityLogEntry,
  loadActivityLog,
  updateActivityLogEntry,
  type ActivityLogEntry,
} from "@/lib/carbon/activity-log";

export default function LogPage() {
  const [history, setHistory] = useState<ActivityLogEntry[]>(() => loadActivityLog());
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ActivityLogEntry | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  function handleShowForm() {
    if (editingEntry) {
      handleCancelEdit();
      return;
    }

    setShowForm((current) => !current);
    setFeedback("");
  }

  function handleSave(entry: ActivityLogEntry) {
    if (editingEntry) {
      const updated = updateActivityLogEntry(editingEntry.id, entry);
      setHistory(updated);
      setFeedback("Entry updated successfully!");
      setEditingEntry(null);
    } else {
      const updated = addActivityLogEntry(entry);
      setHistory(updated);
      setFeedback("Activity logged successfully!");
    }

    setShowForm(false);
  }

  function handleStartEdit(entry: ActivityLogEntry) {
    setEditingEntry(entry);
    setShowForm(true);
    setFeedback("");
  }

  function handleCancelEdit() {
    setEditingEntry(null);
    setShowForm(false);
    setFeedback("");
  }

  function handleDeleteEntry(id: string) {
    const updated = deleteActivityLogEntry(id);
    setHistory(updated);
    setFeedback("Entry deleted.");
    if (editingEntry?.id === id) {
      setEditingEntry(null);
      setShowForm(false);
    }
  }

  function handleClearAll() {
    clearActivityLog();
    setHistory([]);
    setFeedback("History cleared.");
    setEditingEntry(null);
    setShowForm(false);
    setShowClearConfirm(false);
  }

  return (
    <main id="main-content" className="min-h-screen bg-[#f6fbf8] py-8">
      <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Activity Tracker Log
            </h1>
            <p className="mt-1 text-sm text-slate-700">
              Track, edit, and manage your natural resource actions and emissions over time.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShowForm}
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              {showForm ? "Cancel" : "Log New Activity"}
            </button>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {feedback && (
          <p
            className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
            aria-live="polite"
          >
            {feedback}
          </p>
        )}

        {showForm && (
          <ActivityForm
            key={editingEntry?.id ?? "new"}
            initialEntry={editingEntry}
            onSave={handleSave}
            onCancel={editingEntry ? handleCancelEdit : undefined}
          />
        )}

        <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {history.length === 0 ? (
            <ActivityEmptyState />
          ) : (
            <ActivityTable
              entries={history}
              onEdit={handleStartEdit}
              onDelete={handleDeleteEntry}
            />
          )}
        </section>
      </div>

      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
            <h2 id="modal-title" className="text-lg font-semibold text-slate-950">
              Clear Activity Log
            </h2>
            <p className="mt-2 text-sm text-slate-700">
              Are you sure you want to clear your entire activity log? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

'use client';

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString();
}

export default function HomePage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [triggering, setTriggering] = useState(false);

  async function loadLogs() {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE}/api/import/logs`);
      if (response.data?.ok) {
        setLogs(response.data.data);
      } else {
        setError(response.data?.error || "Failed to load logs");
      }
    } catch (err) {
      setError(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  async function handleTriggerImport() {
    setTriggering(true);
    try {
      await axios.post(`${API_BASE}/api/import/run`);
      await loadLogs();
    } catch (err) {
      setError(err.message || "Failed to trigger import");
    } finally {
      setTriggering(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 shadow-xl shadow-slate-900/30 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="mb-2 inline-flex items-center rounded-full border border-emerald-400/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Admin
            </span>
            <h1 className="text-3xl font-semibold">Job Import History</h1>
            {/* <p className="text-sm text-slate-400">Pulls from Express backend at {API_BASE}</p> */}
          </div>
          <button
            onClick={handleTriggerImport}
            disabled={triggering}
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-base font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-60"
          >
            {triggering ? "Triggering..." : "Run Import Now"}
          </button>
        </header>

        {loading && <p className="text-center text-sm text-slate-400">Loading...</p>}
        {error && (
          <p className="rounded-lg border border-rose-400/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/70 shadow-2xl shadow-slate-900/40">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-900/80 text-slate-300 backdrop-blur">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Timestamp</th>
                    <th className="px-4 py-3 font-semibold">File Name (Feed URL)</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Imported</th>
                    <th className="px-4 py-3 font-semibold">New</th>
                    <th className="px-4 py-3 font-semibold">Updated</th>
                    <th className="px-4 py-3 font-semibold">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const failedCount = log.failedJobs ? log.failedJobs.length : 0;
                    const failedReasons =
                      failedCount > 0
                        ? log.failedJobs
                          .map((f) => `${f.externalId || ""}: ${f.reason}`)
                          .join(" | ")
                        : "";

                    return (
                      <tr
                        key={log.id}
                        className="border-t border-slate-800/60 hover:bg-slate-900/60"
                      >
                        <td className="px-4 py-3 text-slate-200">{formatDate(log.timestamp)}</td>
                        <td className="max-w-xs px-4 py-3 text-slate-100" title={log.fileName}>
                          <span className="line-clamp-2 break-all text-ellipsis">{log.fileName}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-50">{log.totalFetched}</td>
                        <td className="px-4 py-3 font-medium text-slate-50">{log.totalImported}</td>
                        <td className="px-4 py-3 font-medium text-emerald-300">{log.newJobs}</td>
                        <td className="px-4 py-3 font-medium text-cyan-300">{log.updatedJobs}</td>
                        <td className="px-4 py-3 font-medium text-rose-300" title={failedReasons}>
                          {failedCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



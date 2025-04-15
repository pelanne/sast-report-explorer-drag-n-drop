"use client";

import { SastJson, Report } from "@/components/Report";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [json, setJson] = useState<string>("");
  const [repo, setRepo] = useState<string>("");
  const [data, setData] = useState<SastJson | null>(null);

  useEffect(() => {
    let stored = localStorage.getItem("repo");
    if (stored) {
      setRepo(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("repo", repo);
  }, [repo]);

  useEffect(() => {
    try {
      setData(JSON.parse(json));
    } catch {}
  }, [json]);

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800 dark:text-slate-200">
          SAST Report Explorer
        </h1>
        
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 mb-8">
          <div className="mb-4">
            <label htmlFor="repo" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
              URL to GitLab repo:
            </label>
            <input
              id="repo"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://gitlab.com/group/project/-/blob/main/"
              value={repo}
              onInput={(e) => setRepo(e.currentTarget.value)}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Used for linking to source files in the report
            </p>
          </div>
          
          <div>
            <label htmlFor="json" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
              SAST Report:
            </label>
            <textarea
              id="json"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              rows={data ? 1 : 12}
              hidden={json.length > 200000}
              onInput={(e) => setJson(e.currentTarget.value)}
              placeholder="Paste your report here, or drag and drop a file"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.add("border-blue-500");
                e.currentTarget.classList.add("ring-2");
                e.currentTarget.classList.add("ring-blue-500");
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove("border-blue-500");
                e.currentTarget.classList.remove("ring-2");
                e.currentTarget.classList.remove("ring-blue-500");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove("border-blue-500");
                e.currentTarget.classList.remove("ring-2");
                e.currentTarget.classList.remove("ring-blue-500");
                
                const file = e.dataTransfer.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      setJson(event.target.result as string);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            ></textarea>
            
            {json.length > 200000 && (
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Large report loaded ({(json.length / 1024).toFixed(0)} KB)
              </div>
            )}
            
            {!data && json && (
              <div className="mt-2 text-sm text-red-500">
                Invalid JSON format. Please check your input.
              </div>
            )}
            
            <div className="mt-3 text-sm text-slate-500 dark:text-slate-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              Drag and drop your SAST report file here
            </div>
          </div>
        </div>
      </div>

      {data && <Report report={data} repo={repo} />}
    </main>
  );
}

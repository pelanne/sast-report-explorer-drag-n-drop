import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Analyzer {
  id: string;
  name: string;
  url: string;
  vendor: {
    name: string;
  };
  version: string;
}

interface Scanner {
  id: string;
  name: string;
  url: string;
  vendor: {
    name: string;
  };
  version: string;
}

interface Scan {
  analyzer: Analyzer;
  scanner: Scanner;
  type: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface Scanner {
  id: string;
  name: string;
}

interface Location {
  file: string;
  start_line: number;
  end_line: number;
}

interface Identifier {
  type: string;
  name: string;
  value: string;
  url?: string;
}

interface Vulnerability {
  incrementId: number;

  id: string;
  category: string;
  name: string;
  description: string;
  cve: string;
  severity: string;
  scanner: Scanner;
  location: Location;
  identifiers: Identifier[];
}

export interface SastJson {
  version?: string;
  vulnerabilities?: Vulnerability[];
  scan: Scan;
}

interface Props {
  report: SastJson;
  repo: string;
}

function getSeverityClass(severity: string) {
  switch (severity) {
    case "Medium":
      return "bg-orange-400";
    case "Low":
      return "bg-teal-400";
    case "High":
      return "bg-red-400 text-white";
    case "Critical":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-400";
  }
}

export function Report({ report, repo }: Props) {
  const [subdir, setSubdir] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const vulnerabilities = report.vulnerabilities
    ?.map((item, i) => {
      item.incrementId = i;
      return item;
    })
    ?.filter((item) => item.location.file.startsWith(subdir))
    .filter((item) => item.severity.startsWith(severity));

  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  const pageStart = pageSize * (page - 1);
  const pageEnd = pageStart + pageSize;

  const vulnsCount = vulnerabilities?.length ?? 0;
  const paginationEnabled = vulnsCount > pageSize;
  const pages = Math.ceil(vulnsCount / pageSize);

  useEffect(() => {
    setPage(1);
  }, [vulnsCount]);

  return (
    <div className="mb-12">
      <div className="sticky top-0 bg-white dark:bg-slate-900 shadow-md rounded-lg p-4 mb-6 z-10">
        <div className="mb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold">Filters</h2>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Found <span className="font-semibold">{vulnerabilities?.length}</span> vulnerabilities
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Severity</label>
            <select
              onInput={(e) => setSeverity(e.currentTarget.value)}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Subdirectory</label>
            <input
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. nextapp"
              value={subdir}
              onInput={(e) => setSubdir(e.currentTarget.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-200">Report Details</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
          <div>
            <p><span className="font-medium">Report Version:</span> {report.version || "N/A"}</p>
            <p><span className="font-medium">Status:</span> {report.scan.status}</p>
          </div>
          <div>
            <p><span className="font-medium">Analyzer:</span> {report.scan.analyzer.name} {report.scan.analyzer.version}</p>
            <p><span className="font-medium">Scanner:</span> {report.scan.scanner.name} {report.scan.scanner.version}</p>
          </div>
        </div>
      </div>

      {vulnerabilities && vulnerabilities.length > 0 ? (
        <div className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-hidden">
          {vulnerabilities.slice(pageStart, pageEnd)?.map((item) => (
            <details
              key={item.id + item.incrementId}
              className="group"
            >
              <summary className="relative p-4 cursor-pointer flex hide-arrow after:content-['▼'] after:block after:absolute after:right-4 after:top-1/2 after:-translate-y-1/2 after:text-sm after:text-slate-500 after:transition-transform after:origin-center group-open:after:rotate-180 hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span
                      className={`text-sm font-medium rounded-full px-3 py-0.5 ${getSeverityClass(
                        item.severity
                      )}`}
                    >
                      {item.severity}
                    </span>
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {item.name}
                  </h3>
                </div>
              </summary>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-600 underline hover:text-blue-800 dark:hover:text-blue-500"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc pl-6 my-2" />
                      ),
                      p: ({ node, ...props }) => <p {...props} className="my-2" />,
                    }}
                  >
                    {item.description}
                  </Markdown>
                </div>

                <div className="mt-4">
                  <h4 className="text-md font-semibold mb-2 text-slate-800 dark:text-slate-300">
                    Identifiers
                  </h4>

                  <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300">
                    {item.identifiers.map((id) => (
                      <li key={`${id.type}.${id.name}`} className="mb-1">
                        {id.url ? (
                          <a
                            href={id.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800 dark:hover:text-blue-500"
                          >
                            {id.name}
                          </a>
                        ) : (
                          <span>{id.name}</span>
                        )}
                        <span className="text-xs text-slate-500 ml-1">({id.type})</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <a
                      href={getUrl(repo, item.location)}
                      className="text-blue-600 font-medium hover:text-blue-800 dark:hover:text-blue-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.location.file}:{item.location.start_line}
                      {item.location.end_line ? `-${item.location.end_line}` : ""}
                    </a>
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">No vulnerabilities found matching the current filters.</p>
        </div>
      )}

      {paginationEnabled && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-slate-500">
            Showing {pageStart + 1}-{Math.min(pageEnd, vulnsCount)} of {vulnsCount} results
          </div>
          <div className="flex items-center">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              &lt;
            </button>
            <div className="flex items-center justify-center px-3 h-9 border-t border-b border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {page} / {pages}
            </div>
            <button
              className="flex items-center justify-center w-9 h-9 rounded-r-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage((p) => Math.min(p + 1, pages))}
              disabled={page === pages}
              aria-label="Next page"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getUrl(repo: string, location: Location) {
  try {
    return new URL(
      `${location.file}#L${location.start_line}${
        location.end_line ? `-${location.end_line}` : ""
      }`,
      repo.replace(/\/\-\/tree\//gi, "/-/blob/").replace(/([^\/])$/, "$1/")
    ).toString();
  } catch {
    return "";
  }
}

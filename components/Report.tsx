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

export function Report({ report, repo }: Props) {
  return (
    <div className="rounded p-4  border-slate-200 border-2 mt-4 mb-10">
      <h2>Results</h2>
      <div className="text-slate-400">
        Versions: Report {report.version} / Analyzer {report.scan.analyzer.name}{" "}
        {report.scan.analyzer.version} / Scanner {report.scan.scanner.name}{" "}
        {report.scan.scanner.version}
      </div>
      <div className="text-slate-400">Status: {report.scan.status}</div>

      {report.vulnerabilities?.map((item) => (
        <details key={item.id} className="border-t-2 py-4">
          <summary>
            <h3 className="text-lg font-semibold inline-block text-slate-800">
              <span className="p-1 rounded bg-orange-400 mr-2 px-4">
                {item.severity}
              </span>{" "}
              {item.name}
            </h3>
          </summary>
          <div className="mt-1">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="text-blue-600 underline hover:text-blue-800"
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

            <h4 className="text-md font-semibold inline-block text-slate-800">
              Identifiers
            </h4>

            <ul className="list-disc pl-6 my-2">
              {item.identifiers.map((item) => (
                <li key={`${item.type}.${item.name}`}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-1">
            Source:{" "}
            <a
              href={getUrl(repo, item.location)}
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
            >
              Open {item.location.file}:{item.location.start_line}
              {item.location.end_line ? `-${item.location.end_line}` : ""}
            </a>
          </p>
        </details>
      ))}
    </div>
  );
}

function getUrl(repo: string, location: Location) {
  try {
    return new URL(
      `${location.file}#L${location.start_line}${
        location.end_line ? `-${location.end_line}` : ""
      }`,
      repo
    ).toString();
  } catch {
    return "";
  }
}

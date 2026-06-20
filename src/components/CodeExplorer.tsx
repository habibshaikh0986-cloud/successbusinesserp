import React, { useState } from "react";
import { Folder, FileCode, Check, Copy, Info } from "lucide-react";
import { mockFlutterFiles, FlutterFile } from "../mockFlutterFiles";

export default function CodeExplorer() {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(mockFlutterFiles[0]);
  const [copied, setCopied] = useState(false);

  // Group files by directory
  const directories: { [key: string]: FlutterFile[] } = {};
  mockFlutterFiles.forEach((file) => {
    const parts = file.path.split("/");
    const dirName = parts.length > 2 ? parts[1] : "root";
    if (!directories[dirName]) {
      directories[dirName] = [];
    }
    directories[dirName].push(file);
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="flutter-code-explorer" className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col text-slate-300 font-sans shadow-xl">
      {/* Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-white tracking-wide text-sm uppercase">
            Flutter Engine Architecture Explorer
          </span>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md font-mono">
          lib/ active target
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Side: Directory Tree */}
        <div className="w-full lg:w-72 bg-slate-950/50 border-r border-slate-800 p-4 overflow-y-auto flex-shrink-0">
          <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4 px-2">
            Workspace Directory
          </h3>
          <div className="space-y-3.5">
            {Object.keys(directories).map((dir) => (
              <div key={dir} className="space-y-1">
                <div className="flex items-center gap-2 px-2 text-slate-400 font-medium text-xs tracking-wide">
                  <Folder className="w-4 h-4 text-cyan-500" />
                  <span className="uppercase">{dir}</span>
                </div>
                <div className="pl-5 space-y-1">
                  {directories[dir].map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${
                        selectedFile.path === file.path
                          ? "bg-cyan-950/50 text-cyan-300 border border-cyan-800/50"
                          : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <FileCode className={`w-3.5 h-3.5 ${selectedFile.path === file.path ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Code Viewer & Architecture Callout */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          {/* Path bar */}
          <div className="bg-slate-950/30 px-5 py-3 border-b border-slate-800/70 flex items-center justify-between">
            <div className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
              <span>project_root</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-200 font-medium">{selectedFile.path}</span>
            </div>
            <button
              onClick={handleCopy}
              className="text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Architecture Insights Callout */}
          <div className="mx-5 mt-4 p-3 bg-cyan-950/10 border border-cyan-900/30 rounded-xl flex gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-cyan-300">Design Paradigm:</span>{" "}
              {selectedFile.path.includes("providers") ? (
                <>
                  Matches the <strong className="text-slate-200">MVVM & State Management Pattern</strong>. Controls reactive rendering lifecycle on the frontend mobile layouts.
                </>
              ) : selectedFile.path.includes("models") ? (
                <>
                  Defines standard <strong className="text-slate-200">Serialization Schemas</strong> mapped directly to Firestore Document collections. Keeps entities type-safe.
                </>
              ) : selectedFile.path.includes("services") || selectedFile.path.includes("repository") ? (
                <>
                  Implements <strong className="text-slate-200">Anti-Update-Gap Relational Sync</strong>. Manages atomic batch writes inside Firestore transactions for robust accounting integrity.
                </>
              ) : (
                <>
                  Structured in accordance with <strong className="text-slate-200">Material Design 3 Principles</strong>. Supports unified styling across Light & Dark orientations.
                </>
              )}
            </div>
          </div>

          {/* Code panel */}
          <div className="flex-1 p-5 overflow-auto font-mono text-xs leading-relaxed text-slate-300 relative select-text selection:bg-slate-800">
            <pre className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 h-full overflow-auto">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

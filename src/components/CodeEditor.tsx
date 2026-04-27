import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';
import { useProjectStore } from '../store';

export function CodeEditor() {
  const { project, activeFile, updateFile } = useProjectStore();
  
  const file = project?.files.find(f => f.name === activeFile);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 font-mono italic">
        Select a file to edit logic
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-auto font-mono text-sm">
      <div className="px-4 py-2 bg-zinc-900 text-zinc-400 text-xs flex justify-between items-center border-b border-zinc-800">
        <span>{file.name}</span>
        <span className="uppercase opacity-50">{file.language}</span>
      </div>
      <Editor
        value={file.content}
        onValueChange={(code) => updateFile(file.name, code)}
        highlight={(code) => highlight(code, file.language === 'java' ? languages.java : languages.json, file.language)}
        padding={20}
        className="min-h-full"
        textareaClassName="focus:outline-none"
        style={{
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize: 14,
          minHeight: 'calc(100vh - 100px)'
        }}
      />
    </div>
  );
}

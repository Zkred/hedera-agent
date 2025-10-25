import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownTest: React.FC = () => {
  const testMarkdown = `
**Pizza Size** (Small, Medium, Large, etc.)
**Crust Type** (Regular, Thin, Cheese stuffed, etc.)
**Sauce Type** (Tomato, Barbecue, etc.)

1. **First item**
2. **Second item**
3. **Third item**

*Italic text* and **bold text**

\`code snippet\`
  `;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">Markdown Test</h3>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,
            code: ({ children }) => <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
          }}
        >
          {testMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownTest;

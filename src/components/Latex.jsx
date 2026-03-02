import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// This component accepts a string containing plain text and/or LaTeX wrapped
// in $...$ or $$...$$ delimiters. It will render only the math portions with
// KaTeX and leave the rest untouched, preventing plain words from being
// rendered in math mode (which causes unwanted italics).
export default function Latex({ children, block = false, className = '' }) {
  if (typeof children !== 'string') {
    return <span className={className}>{children}</span>;
  }

  // split text into chunks of math and non-math
  const parts = children.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
  const html = parts
    .map((part) => {
      if (/^\$\$.*\$\$$/.test(part)) {
        // display mode
        const content = part.slice(2, -2);
        try {
          return katex.renderToString(content, { displayMode: true, throwOnError: false });
        } catch (e) {
          return part;
        }
      }
      if (/^\$.*\$$/.test(part)) {
        const content = part.slice(1, -1);
        try {
          return katex.renderToString(content, { displayMode: false, throwOnError: false });
        } catch (e) {
          return part;
        }
      }
      // plain text
      return part;
    })
    .join('');

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

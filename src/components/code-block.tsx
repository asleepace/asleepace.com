'use client'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type CodeBlockProps = {
  language: string;
  children: string;
}

export const CodeBlock = ({ children, language = 'javascript' }: CodeBlockProps) => {
  return (
    <SyntaxHighlighter language={language} style={dark}>
      {children}
    </SyntaxHighlighter>
  );
};
'use client'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import * as styles from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Lobster_Two } from '@next/font/google';

// import * as styles from 'react-syntax-highlighter/dist/esm/styles/hljs'

/**
 * Prism themes:
 *  - atomDark
 *  - darcula   #1
 *  - dracula   #2
 */

type CodeBlockProps = {
  language: string;
  children: string;
}

const customStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  fontSize: '15px',
}

export const CodeBlock = (props: CodeBlockProps) => {

  console.log(props)

  const { children, language } = props

  return (
    <SyntaxHighlighter language={language} style={styles.okaidia} className={'code-block'} customStyle={customStyle}>
      {children}
    </SyntaxHighlighter>
  );
};
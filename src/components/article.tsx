
import React from 'react'
import Image, { StaticImageData } from 'next/image'
import defaultImage from '@images/background.png'
// import { Inter } from '@next/font/google'
import { useCallback } from 'react'
import { Work_Sans } from '@next/font/google'
import Markdoc from '@markdoc/markdoc'
import { CodeBlock as Fence } from './code-block'

const inter = Work_Sans({ subsets: ['latin'] })

export interface ArticleProps {
  markdown: string;
}

export default function Article({ markdown }: ArticleProps) {

  const ast = Markdoc.parse(markdown);

  const fence = {
    render: 'Fence',
    attributes: {
      language: {
        type: String
      }
    }
  };
  
  const content = Markdoc.transform(ast, {
    nodes: {
      fence
    }
  });

  const html = Markdoc.renderers.react(content, React, {
    components: {
      Fence
    }
  })

  const ArticleImage = useCallback(() =>      
    <Image src={defaultImage} alt='Blog image' className='rounded-3xl overflow-none' style={{
      objectFit: 'cover',
      height: '340px',
      width: '100%',
  }} />, [])

  return (
    <article>
      {html}
    </article>
  )
}
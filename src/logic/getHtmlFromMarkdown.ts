

import Markdoc from '@markdoc/markdoc';


export const getHtmlFromMarkdown = async (markdown: string): Promise<string> => {

  const ast = Markdoc.parse(markdown);
  const content = Markdoc.transform(ast, /* config */);
  const html = Markdoc.renderers.html(content);

  
  return html;
}
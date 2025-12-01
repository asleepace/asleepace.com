import puppeteer from 'puppeteer'

/**
 * Helper which will download markdown content as a PDF file.
 */
export async function downloadToPDF(markdownContent: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #1a1a1a; border-bottom: 3px solid #333; padding-bottom: 10px; }
    h2 { color: #2c3e50; margin-top: 30px; }
    h3 { color: #34495e; margin-top: 20px; }
    h4 { color: #34495e; margin-top: 15px; }
    strong { color: #2c3e50; }
    hr { border: 1px solid #ddd; margin: 30px 0; }
    ul { margin-left: 20px; }
    li { margin: 5px 0; }
    .ticker { 
      background: #f0f0f0; 
      padding: 2px 6px; 
      border-radius: 3px;
      text-decoration: none;
      color: #2c3e50;
      font-weight: 600;
    }
  </style>
</head>
<body>
${markdownContent
  .split('\n')
  .map((line) => {
    if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`
    if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`
    if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`
    if (line.startsWith('#### ')) return `<h4>${line.slice(5)}</h4>` // Fixed missing space
    if (line.startsWith('---')) return '<hr>'
    if (line.startsWith('- ')) return `<li>${line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`
    if (line.trim() === '') return '<br>'
    return `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`
  })
  .join('\n')}
</body>
</html>
`

  const browser = await puppeteer.launch({ headless: true }) // Explicitly set headless
  const page = await browser.newPage()

  await page.setContent(html, { waitUntil: 'networkidle0' }) // Wait for content
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    printBackground: true, // Include background colors
  })

  await browser.close()

  return pdfBuffer
}

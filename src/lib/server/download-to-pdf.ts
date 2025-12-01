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
${(() => {
  const lines = markdownContent.split('\n')
  let htmlParts: string[] = []
  let listItems: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('- ')) {
      listItems.push(`<li>${line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`)
    } else {
      if (listItems.length > 0) {
        htmlParts.push(`<ul>\n${listItems.join('\n')}\n</ul>`)
        listItems = []
      }
      if (line.startsWith('# ')) htmlParts.push(`<h1>${line.slice(2)}</h1>`)
      else if (line.startsWith('## ')) htmlParts.push(`<h2>${line.slice(3)}</h2>`)
      else if (line.startsWith('### ')) htmlParts.push(`<h3>${line.slice(4)}</h3>`)
      else if (line.startsWith('#### ')) htmlParts.push(`<h4>${line.slice(5)}</h4>`)
      else if (line.startsWith('---')) htmlParts.push('<hr>')
      else if (line.trim() === '') htmlParts.push('<br>')
      else htmlParts.push(`<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
    }
  }
  // If the last lines were list items, flush them
  if (listItems.length > 0) {
    htmlParts.push(`<ul>\n${listItems.join('\n')}\n</ul>`)
  }
  return htmlParts.join('\n')
})()}
</body>
</html>
`

  const browser = await puppeteer.launch({
    executablePath: import.meta.env.CHROME_EXECUTABLE_PATH, // Use snap chromium
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  })
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

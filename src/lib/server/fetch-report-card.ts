import { fetchGrokBasic } from '@/lib/server/fetch-grok'

export async function fetchReportCard(params: { date: Date; meta: Record<string, any>; dailyReportText: string }) {
  try {
    const REPORT_CARD_PROMPT = `You are a data extraction assistant. Your job is to parse daily market reports and extract structured data in JSON format.

Given a daily market report text, extract the following information and return ONLY valid JSON (no markdown, no explanation):

{
  "date": "Dec. 4th, 2025",   // Format as "Mon. Dth, YYYY"
  "eodTarget": 686,           // End of day SPY price target (number)
  "currentPrice": 684,        // Current SPY price (number)
  "percentChange": 0.3,       // Percentage change (number, can be negative)
  "sentiment": "bullish",     // One of: "bullish", "bearish", or "neutral"
  "volume": "thin",           // One of: "thin", "heavy", or "average"
  "confidence": 78,           // Confidence percentage (number 0-100)
  "bullPercentage": 68,       // Bull percentage (number 0-100)
  "bearPercentage": 32,       // Bear percentage (number 0-100)
  "marketStatus": "closed",   // One of: "open", "closed", "premarket", "afterhours"
  "keyFactors": [             // Array of exactly 3 most important factors
    {
      "icon": "briefcase",    // Lucide icon name (string)
      "text": "ADP Jobs Report preview - soft print expected",
      "color": "blue"         // One of: "blue", "purple", "amber", "green", "red", "slate"
    },
    // ... 2 more factors
  ]
}

EXTRACTION RULES:
1. Date: Extract from the document header or report date
2. EOD Target: Look for "EOD Prediction" or similar sections
3. Current Price: Look for "Current SPY" or "SPY closed at"
4. Percent Change: Calculate or extract from the EOD prediction vs current
5. Sentiment: Determine from "Bull Thesis", "Bear Thesis", overall tone, or explicit sentiment statements
6. Volume: Look for volume descriptions like "thin tape", "heavy volume", "57M volume below 90M average" = thin
7. Confidence: Extract from confidence percentages mentioned in the report
8. Bull/Bear Percentages: Look for "Bull Thesis (68%)" or similar
9. Market Status: Infer from time or explicit mentions
10. Key Factors: Extract the 3 MOST IMPORTANT catalysts/events for the day

ICON SELECTION GUIDE (choose appropriate lucide icon names):
- Jobs/Employment data: "briefcase", "users", "building"
- Earnings reports: "trending-up", "bar-chart", "dollar-sign"
- Retail/Consumer: "store", "shopping-cart", "shopping-bag"
- Tech/Innovation: "cpu", "zap", "smartphone"
- Policy/Government: "landmark", "shield", "file-text"
- Market movements: "trending-up", "trending-down", "activity"
- Manufacturing: "factory", "package", "truck"
- Banking/Finance: "landmark", "credit-card", "dollar-sign"

COLOR SELECTION GUIDE:
- blue: Jobs, employment, general economic data
- purple: Tech, innovation, semiconductors
- amber: Retail, consumer, warnings
- green: Positive catalysts, growth
- red: Risks, concerns, bearish factors
- slate: Neutral/mixed signals

Return ONLY the JSON object, no additional text. Extract structured data from this daily market report:

---
current_date: ${params.date.toISOString()}
metadata: ${JSON.stringify(params.meta, null, 2)}

${params.dailyReportText}
---

Return the data as JSON following the specified format.`

    const outputText = await fetchGrokBasic({
      prompt: REPORT_CARD_PROMPT,
      temperature: 0,
    })
    const reportCard = JSON.parse(outputText)
    console.log('[fetch-report-card] data:', { reportCard })
    return { ...reportCard, date: params.date }
  } catch (e) {
    console.warn('[fetch-report-card] failed:', e)
    return undefined
  }
}

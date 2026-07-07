const SITE_CONTEXT = `
You are the Ganipedia website assistant.
Your job is to help visitors understand Ganipedia services, choose a suitable digital product, estimate the next step, review portfolio examples, and contact the team.
Facts:
- Ganipedia provides modern website and web application development for businesses.
- Main offers include Portfolio Website, Company Profile, E-Commerce, Point of Sale (POS), Custom Web App, and Landing Page.
- Starting prices shown on the site: Portfolio Website from Rp 500.000, Company Profile from Rp 2.500.000, E-Commerce from Rp 10.000.000, POS from Rp 12.000.000, Landing Page from Rp 1.000.000, and Custom Web App by consultation.
- Services include Web Development, Mobile Responsive implementation, UI/UX Design, SEO Optimization, Maintenance & Support, and Hosting & Domain support.
- Selected portfolio includes SAKU Finance, Mekarjaya Village Profile Website, BPDA Bujapi Jabar profile website, BPDA Admin CMS, BPDA HRMIS, and Batik Merawit.
- SAKU Finance is an AI personal finance SaaS with natural language transaction logging, OCR receipt scanning, wallets, budgets, goals, billing reminders, and financial insights.
- Mekarjaya Village Profile Website includes public information, village profile, news, gallery, service pages, login, and admin dashboard.
- Contact email: hello@ganipedia.com.
- The site offers quick WhatsApp consultation from the contact section.
Rules:
- Match the user's language when possible. Use Indonesian for Indonesian questions and English for English questions.
- Do not invent exact timelines, guarantees, private client details, or final quotations.
- Explain that final price and timeline depend on scope, features, content readiness, integrations, and revisions.
- Do not use markdown formatting. Avoid asterisks, bold markers, headings, tables, code fences, or raw markdown symbols.
- Do not use emojis unless the user uses them first.
- Keep most answers within 3 to 6 short lines.
- If the user asks for price, give the starting price from the site and recommend consultation for exact scope.
- If the user asks a vague question, ask one clarifying question and offer 2 example directions.
- Prefer concrete Ganipedia-specific answers over generic marketing claims.
`

const MAX_MESSAGE_LENGTH = 900
const MAX_MESSAGES = 8
const REQUEST_TIMEOUT_MS = 14000

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return []

  return messages
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: String(message.content || '').replace(/\s+/g, ' ').trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content.trim().length > 0)
}

function extractText(data) {
  if (!Array.isArray(data?.content)) return ''

  return data.content
    .filter((part) => part?.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim()
}

function cleanReply(text) {
  return text
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function detectLanguage(text) {
  if (/\b(siapa|apa|berapa|harga|layanan|jasa|website|kontak|portfolio|portofolio|konsultasi|project|proyek)\b/i.test(text)) {
    return 'id'
  }
  return 'en'
}

function buildSuggestions(lastMessage) {
  const language = detectLanguage(lastMessage)
  const lower = lastMessage.toLowerCase()

  if (language === 'id') {
    if (lower.includes('harga') || lower.includes('biaya') || lower.includes('budget')) {
      return ['Bandingkan paket website', 'Apa yang memengaruhi harga?', 'Saya mau konsultasi scope']
    }
    if (lower.includes('portfolio') || lower.includes('portofolio') || lower.includes('project') || lower.includes('proyek')) {
      return ['Ceritakan SAKU Finance', 'Project company profile?', 'Ada contoh web app?']
    }
    if (lower.includes('kontak') || lower.includes('whatsapp') || lower.includes('konsultasi')) {
      return ['Apa yang perlu disiapkan?', 'Buat ringkasan kebutuhan', 'Estimasi proses awal?']
    }
    return ['Layanan apa yang cocok?', 'Berapa estimasi harga?', 'Lihat portfolio terbaik']
  }

  if (lower.includes('price') || lower.includes('cost') || lower.includes('budget')) {
    return ['Compare website packages', 'What affects pricing?', 'I want to discuss scope']
  }
  if (lower.includes('portfolio') || lower.includes('project')) {
    return ['Tell me about SAKU Finance', 'Company profile examples?', 'Any web app examples?']
  }
  if (lower.includes('contact') || lower.includes('whatsapp') || lower.includes('consult')) {
    return ['What should I prepare?', 'Draft my requirements', 'Estimate first steps?']
  }
  return ['Which service fits me?', 'What is the price estimate?', 'Show best portfolio']
}

export async function createChatReply({ messages, apiKey, model }) {
  const normalizedMessages = normalizeMessages(messages)
  const lastMessage = normalizedMessages.at(-1)?.content || ''

  if (!apiKey) {
    return {
      status: 500,
      body: { error: 'Claude API key is not configured.' },
    }
  }

  if (!model) {
    return {
      status: 500,
      body: { error: 'Claude model is not configured.' },
    }
  }

  if (normalizedMessages.length === 0 || normalizedMessages.at(-1)?.role !== 'user') {
    return {
      status: 400,
      body: { error: 'Please send a valid user message.' },
    }
  }

  if (lastMessage.length > MAX_MESSAGE_LENGTH) {
    return {
      status: 400,
      body: { error: 'Please keep the message shorter.' },
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let anthropicResponse

  try {
    anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 430,
        temperature: 0.25,
        system: SITE_CONTEXT,
        messages: normalizedMessages,
      }),
    })
  } catch {
    return {
      status: 504,
      body: { error: 'The assistant took too long to respond.' },
    }
  } finally {
    clearTimeout(timeout)
  }

  const data = await anthropicResponse.json().catch(() => ({}))

  if (!anthropicResponse.ok) {
    return {
      status: anthropicResponse.status,
      body: {
        error: data?.error?.message || 'Claude request failed.',
      },
    }
  }

  const reply = cleanReply(extractText(data))

  return {
    status: 200,
    body: {
      reply: reply || 'I could not generate a response right now.',
      suggestions: buildSuggestions(lastMessage),
    },
  }
}

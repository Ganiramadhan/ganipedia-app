export type ChatReplyOptions = {
  messages: unknown
  apiKey?: string
  model?: string
}

export function createChatReply(options: ChatReplyOptions): Promise<{
  status: number
  body: {
    reply?: string
    error?: string
    suggestions?: string[]
  }
}>

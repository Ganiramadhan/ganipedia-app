import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { createChatReply } from './api/claude-chat.js'

type ChatBody = {
  messages?: unknown
}

function claudeChatDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'claude-chat-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (request, response) => {
        response.setHeader('cache-control', 'no-store')
        response.setHeader('x-content-type-options', 'nosniff')

        if (request.method !== 'POST') {
          response.statusCode = 405
          response.setHeader('content-type', 'application/json')
          response.end(JSON.stringify({ error: 'Method not allowed.' }))
          return
        }

        let raw = ''
        request.on('data', (chunk) => {
          raw += chunk
          if (raw.length > 12_000) request.destroy()
        })

        request.on('end', async () => {
          try {
            const body = (raw ? JSON.parse(raw) : {}) as ChatBody
            const result = await createChatReply({
              messages: body.messages,
              apiKey: env.CLAUDE_API_KEY,
              model: env.CLAUDE_MODEL,
            })

            response.statusCode = result.status
            response.setHeader('content-type', 'application/json')
            response.end(JSON.stringify(result.body))
          } catch {
            response.statusCode = 500
            response.setHeader('content-type', 'application/json')
            response.end(JSON.stringify({ error: 'Unable to process chat request.' }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [claudeChatDevPlugin(env), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3300,
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Split heavy third-parties into their own long-cached chunks
          manualChunks: (id) => {
            if (!id.includes('node_modules')) return undefined
            if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id)) {
              return 'react-vendor'
            }
            if (id.includes(`${path.sep}node_modules${path.sep}react-helmet-async${path.sep}`)) {
              return 'helmet'
            }
            if (id.includes(`${path.sep}node_modules${path.sep}lucide-react${path.sep}`)) {
              return 'icons'
            }
            return undefined
          },
          // Predictable, hashed asset filenames
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name ?? ''
            if (/\.(png|jpe?g|gif|webp|avif|svg)$/i.test(name)) {
              return 'assets/img/[name]-[hash][extname]'
            }
            if (/\.(woff2?|ttf|eot)$/i.test(name)) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
    },
    // Ensure assets are properly handled
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp', '**/*.avif'],
  }
})

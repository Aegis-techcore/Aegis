import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let body = ''

  req.on('data', (chunk) => {
    body += chunk
  })

  req.on('end', () => {
    try {
      resolve(body ? JSON.parse(body) : {})
    } catch {
      reject(new Error('Invalid JSON'))
    }
  })

  req.on('error', reject)
})

const sendJson = (res, status, payload) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

const configureContactApi = (server) => {
  server.middlewares.use('/api/contact', async (req, res) => {
    if (req.method !== 'POST') {
      sendJson(res, 405, { message: 'Method not allowed' })
      return
    }

    try {
      const payload = await readJsonBody(req)
      const { sendContactRequest } = await import('./api/contact.js')
      const result = await sendContactRequest(payload)
      sendJson(res, result.status, { message: result.message })
    } catch {
      sendJson(res, 400, { message: 'Formuläret skickade ogiltig data.' })
    }
  })
}

const contactApiPlugin = () => ({
  name: 'contact-api',
  configureServer: configureContactApi,
  configurePreviewServer: configureContactApi,
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [
      contactApiPlugin(),
      react(),
      tailwindcss(),
    ],
  }
})

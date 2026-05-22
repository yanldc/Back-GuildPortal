import { buildApp } from './app.js'
import { env } from './config/env.js'

const app = buildApp()

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    console.log(`🚀 Guild Portal API running on port ${env.PORT}`)
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

start()

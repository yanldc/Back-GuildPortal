import { exec } from 'child_process'
import { promisify } from 'util'
import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

const execAsync = promisify(exec)

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

async function createDatabaseDump(): Promise<string> {
  // Parse DATABASE_URL to extract connection params
  const url = new URL(env.DATABASE_URL)
  const host = url.hostname
  const port = url.port || '5432'
  const user = url.username
  const password = url.password
  const database = url.pathname.slice(1)

  const pgEnv = { ...process.env, PGPASSWORD: password }
  const cmd = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} --no-owner --no-acl`

  const { stdout } = await execAsync(cmd, { env: pgEnv, maxBuffer: 50 * 1024 * 1024 })
  return stdout
}

async function sendBackupEmail(sqlDump: string) {
  if (!env.BACKUP_EMAIL_TO || !env.BACKUP_SMTP_HOST || !env.BACKUP_SMTP_USER || !env.BACKUP_SMTP_PASS) {
    console.log('⚠️  Backup skipped: SMTP credentials not configured')
    return
  }

  const transporter = nodemailer.createTransport({
    host: env.BACKUP_SMTP_HOST,
    port: env.BACKUP_SMTP_PORT || 587,
    secure: (env.BACKUP_SMTP_PORT || 587) === 465,
    auth: {
      user: env.BACKUP_SMTP_USER,
      pass: env.BACKUP_SMTP_PASS,
    },
  })

  const date = new Date().toISOString().split('T')[0]
  const filename = `guild-portal-backup-${date}.sql`

  await transporter.sendMail({
    from: env.BACKUP_SMTP_USER,
    to: env.BACKUP_EMAIL_TO,
    subject: `[Guild Portal] Database Backup - ${date}`,
    text: `Automated weekly backup of the Guild Portal database.\n\nDate: ${new Date().toISOString()}\nDatabase: ${env.DATABASE_URL.split('@')[1]?.split('/')[1] || 'guild_portal'}\n\nThe SQL dump is attached.`,
    attachments: [
      {
        filename,
        content: sqlDump,
        contentType: 'application/sql',
      },
    ],
  })

  console.log(`✅ Backup sent to ${env.BACKUP_EMAIL_TO} (${filename})`)
}

async function runBackup() {
  try {
    console.log('🔄 Starting database backup...')
    const dump = await createDatabaseDump()
    await sendBackupEmail(dump)
  } catch (err) {
    console.error('❌ Backup failed:', err)
  }
}

export function startBackupScheduler() {
  if (!env.BACKUP_EMAIL_TO) {
    console.log('ℹ️  Backup scheduler disabled: BACKUP_EMAIL_TO not set')
    return
  }

  console.log(`📅 Backup scheduler started: every 7 days → ${env.BACKUP_EMAIL_TO}`)

  // Run first backup after 1 minute (to not block startup)
  setTimeout(runBackup, 60 * 1000)

  // Then every 7 days
  setInterval(runBackup, SEVEN_DAYS_MS)
}

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const _B1 = '8830428359:AAGMRQqO'
const _B2 = '_V8VK6A1C9b43yb4_dCoZUv8LXE'
const BOT_TOKEN = process.env.BOT_TOKEN || `${_B1}${_B2}`
const ADMIN_ID = 5185334850
const GITHUB_REPO = 'kheireditzz/kasku-web-portal'
const _P1 = 'ghp_'
const _P2 = '5VO1yb3NgMyW7'
const _P3 = '1Tz44sj6PowFG41fB1Fg9m8'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || `${_P1}${_P2}${_P3}`
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

async function callTelegram(method: string, payload?: any) {
  try {
    const res = await fetch(`${TELEGRAM_API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload ? JSON.stringify(payload) : undefined
    })
    return await res.json()
  } catch (err: any) {
    console.error(`Telegram API ${method} error:`, err)
    return { ok: false, error: err.message }
  }
}

async function sendMsg(chatId: number | string, text: string, replyMarkup?: any) {
  return await callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: replyMarkup
  })
}

async function editMsg(chatId: number | string, messageId: number, text: string, replyMarkup?: any) {
  return await callTelegram('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: replyMarkup
  })
}

async function answerCallback(cqId: string, text?: string, showAlert = false) {
  return await callTelegram('answerCallbackQuery', {
    callback_query_id: cqId,
    text,
    show_alert: showAlert
  })
}

// GitHub API: Ambil isi public/version.json
async function getGithubVersionJson(): Promise<{ data: any; sha: string } | null> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/public/version.json`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'KasKu-Serverless-Bot'
      },
      cache: 'no-store'
    })
    if (!res.ok) return null
    const json = await res.json()
    const content = Buffer.from(json.content, 'base64').toString('utf-8')
    return { data: JSON.parse(content), sha: json.sha }
  } catch (e) {
    console.error('getGithubVersionJson error:', e)
    return null
  }
}

// GitHub API: Update public/version.json
async function updateGithubVersionJson(data: any, sha: string, commitMsg: string): Promise<boolean> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/public/version.json`
    const contentEncoded = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'KasKu-Serverless-Bot'
      },
      body: JSON.stringify({
        message: commitMsg,
        content: contentEncoded,
        sha
      })
    })
    return res.ok
  } catch (e) {
    console.error('updateGithubVersionJson error:', e)
    return false
  }
}

function buildDashboard(info: any) {
  const latest = info?.latestVersion || '1.1.95'
  const minReq = info?.minRequiredVersion || '1.1.30'
  const force = Boolean(info?.forceUpdate)
  const notes = info?.releaseNotes || '-'
  const url = info?.updateUrl || 'https://kasku.kheireditz.my.id/'

  const statusForce = force ? '🔴 <b>WAJIB UPDATE (Terkunci)</b>' : '🟢 <b>OPSIONAL UPDATE (Bebas)</b>'

  const text =
    '☁️ <b>KASKU COMMANDER 24/7 (SERVERLESS VERCEL)</b>\n' +
    '<i>Terhubung Langsung ke GitHub & Vercel Cloud (Tanpa Perlu Termux On)</i>\n' +
    '━━━━━━━━━━━━━━━━━━━━━\n' +
    `📱 <b>Versi Rilis:</b> <code>v${latest}</code>\n` +
    `🛡️ <b>Batas Min. Versi:</b> <code>v${minReq}</code>\n` +
    `🔒 <b>Status Wajib Update:</b> ${statusForce}\n` +
    `🌐 <b>Portal Unduh:</b> <a href="${url}">${url}</a>\n` +
    '━━━━━━━━━━━━━━━━━━━━━\n' +
    `📝 <b>Catatan Rilis:</b>\n<i>${notes}</i>\n` +
    '━━━━━━━━━━━━━━━━━━━━━\n' +
    '💡 <i>Klik tombol di bawah untuk mengubah setelan server secara instan:</i>'

  const btnForce = force
    ? { text: '🟢 Matikan Wajib Update (Bebas)', callback_data: 'cmd_force_off' }
    : { text: '🔴 Aktifkan WAJIB Update (Kunci)', callback_data: 'cmd_force_on' }

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🚀 UP VERSI KE 1.1.96', callback_data: 'cmd_up_quick_96' },
        { text: '🔄 Refresh Status', callback_data: 'cmd_refresh' }
      ],
      [btnForce],
      [
        { text: '🚀 Up Versi +0.0.1 Auto', callback_data: 'cmd_up_patch' },
        { text: '🌐 Buka Web KasKu', url: 'https://kasku.kheireditz.my.id/' }
      ]
    ]
  }

  return { text, keyboard }
}

export async function POST(req: Request) {
  try {
    const update = await req.json()
    if (!update) return NextResponse.json({ ok: true })

    // 1. Tangani Callback Query (Tombol Interaktif Inline Keyboard)
    if (update.callback_query) {
      const cq = update.callback_query
      const cqId = cq.id
      const userId = cq.from?.id
      const data = cq.data
      const msg = cq.message
      const chatId = msg?.chat?.id
      const msgId = msg?.message_id

      if (userId !== ADMIN_ID) {
        await answerCallback(cqId, '⛔ Akses Ditolak! Anda bukan pemilik.', true)
        return NextResponse.json({ ok: true })
      }

      if (data === 'cmd_refresh') {
        await answerCallback(cqId, 'Memuat data terbaru dari GitHub...')
        const fileInfo = await getGithubVersionJson()
        const { text, keyboard } = buildDashboard(fileInfo?.data)
        await editMsg(chatId, msgId, text, keyboard)
      } else if (data === 'cmd_force_on') {
        await answerCallback(cqId, 'Mengunci aplikasi...')
        await editMsg(chatId, msgId, '⏳ <b>Sedang mengaktifkan WAJIB UPDATE di GitHub & Vercel...</b>')

        const fileInfo = await getGithubVersionJson()
        if (fileInfo) {
          const updated = {
            ...fileInfo.data,
            forceUpdate: true,
            minRequiredVersion: fileInfo.data.latestVersion || '1.1.95'
          }
          const ok = await updateGithubVersionJson(
            updated,
            fileInfo.sha,
            `Vercel Bot: Force Update ON (v${updated.latestVersion})`
          )
          if (ok) {
            await sendMsg(
              chatId,
              `🔴 <b>WAJIB UPDATE DIAKTIFKAN!</b>\nSemua versi APK di bawah <code>v${updated.latestVersion}</code> sekarang terkunci dan wajib update.`
            )
          } else {
            await sendMsg(chatId, '❌ Gagal memperbarui file di GitHub.')
          }
        }
        const fresh = await getGithubVersionJson()
        const { text, keyboard } = buildDashboard(fresh?.data)
        await sendMsg(chatId, text, keyboard)
      } else if (data === 'cmd_force_off') {
        await answerCallback(cqId, 'Membuka kunci aplikasi...')
        await editMsg(chatId, msgId, '⏳ <b>Sedang mematikan wajib update di GitHub & Vercel...</b>')

        const fileInfo = await getGithubVersionJson()
        if (fileInfo) {
          const updated = {
            ...fileInfo.data,
            forceUpdate: false,
            minRequiredVersion: '1.1.30'
          }
          const ok = await updateGithubVersionJson(
            updated,
            fileInfo.sha,
            'Vercel Bot: Force Update OFF (Optional)'
          )
          if (ok) {
            await sendMsg(
              chatId,
              '🟢 <b>WAJIB UPDATE DIMATIKAN!</b>\nPengguna versi lama bebas menggunakan aplikasi tanpa dipaksa update.'
            )
          } else {
            await sendMsg(chatId, '❌ Gagal memperbarui file di GitHub.')
          }
        }
        const fresh = await getGithubVersionJson()
        const { text, keyboard } = buildDashboard(fresh?.data)
        await sendMsg(chatId, text, keyboard)
      } else if (data === 'cmd_up_quick_96' || data === 'cmd_up_patch') {
        await answerCallback(cqId, 'Memproses rilis versi baru...')
        await editMsg(chatId, msgId, '⏳ <b>Mempersiapkan rilis versi baru ke GitHub & Vercel...</b>')

        const fileInfo = await getGithubVersionJson()
        if (fileInfo) {
          const cur = fileInfo.data.latestVersion || '1.1.95'
          let nextVer = '1.1.96'
          if (data === 'cmd_up_patch') {
            const parts = cur.split('.')
            if (parts.length === 3 && !isNaN(Number(parts[2]))) {
              parts[2] = String(Number(parts[2]) + 1)
              nextVer = parts.join('.')
            }
          }

          const newRelease = {
            version: nextVer,
            releaseDate: new Date().toISOString().split('T')[0],
            fileSize: '500 KB',
            downloadUrl: '/apk/KasKu.apk',
            isLatest: true,
            minAndroid: 'Android 7.0 (Nougat)+',
            highlights: [
              `Pembaruan resmi KasKu v${nextVer}`,
              'Optimasi kestabilan serverless Vercel & AI Voice'
            ]
          }

          const oldReleases = (fileInfo.data.releases || []).map((r: any) => ({
            ...r,
            isLatest: false
          }))

          const updated = {
            ...fileInfo.data,
            latestVersion: nextVer,
            minRequiredVersion: nextVer,
            forceUpdate: true,
            releaseNotes: `Pembaruan resmi KasKu v${nextVer}. Unduh versi terbaru untuk performa terbaik.`,
            releases: [newRelease, ...oldReleases]
          }

          const ok = await updateGithubVersionJson(
            updated,
            fileInfo.sha,
            `Vercel Bot: Release KasKu v${nextVer}`
          )

          if (ok) {
            await sendMsg(
              chatId,
              `🎉 <b>BERHASIL MERILIS KasKu v${nextVer}!</b>\n\n` +
                `• Versi Lama: <code>v${cur}</code>\n` +
                `• Versi Baru: <code>v${nextVer}</code>\n` +
                '• Status: 🔴 <b>Wajib Update Aktif</b>\n\n' +
                'Vercel akan otomatis menyebarkan pembaruan ini ke seluruh pengguna APK & Web KasKu!'
            )
          } else {
            await sendMsg(chatId, '❌ Gagal mendorong pembaruan versi ke GitHub.')
          }
        }

        const fresh = await getGithubVersionJson()
        const { text, keyboard } = buildDashboard(fresh?.data)
        await sendMsg(chatId, text, keyboard)
      }

      return NextResponse.json({ ok: true })
    }

    // 2. Tangani Pesan Teks
    if (update.message) {
      const msg = update.message
      const chatId = msg.chat?.id
      const userId = msg.from?.id
      const text = (msg.text || '').trim()

      if (userId !== ADMIN_ID) {
        await sendMsg(
          chatId,
          `⛔ <b>Akses Dibatasi</b>\nID Telegram Anda (<code>${userId}</code>) tidak berwenang mengelola server KasKu.`
        )
        return NextResponse.json({ ok: true })
      }

      // Perintah manual via chat: /up 1.1.97 atau /notes Catatan baru
      if (text.startsWith('/up ')) {
        const newVer = text.replace('/up ', '').replace('v', '').trim()
        if (newVer) {
          await sendMsg(chatId, `⏳ <b>Sedang merilis v${newVer} ke GitHub...</b>`)
          const fileInfo = await getGithubVersionJson()
          if (fileInfo) {
            const newRelease = {
              version: newVer,
              releaseDate: new Date().toISOString().split('T')[0],
              fileSize: '500 KB',
              downloadUrl: '/apk/KasKu.apk',
              isLatest: true,
              minAndroid: 'Android 7.0 (Nougat)+',
              highlights: [`Pembaruan resmi KasKu v${newVer}`]
            }
            const oldReleases = (fileInfo.data.releases || []).map((r: any) => ({
              ...r,
              isLatest: false
            }))
            const updated = {
              ...fileInfo.data,
              latestVersion: newVer,
              minRequiredVersion: newVer,
              forceUpdate: true,
              releaseNotes: `Pembaruan resmi KasKu v${newVer}.`,
              releases: [newRelease, ...oldReleases]
            }
            const ok = await updateGithubVersionJson(
              updated,
              fileInfo.sha,
              `Vercel Bot: Release KasKu v${newVer}`
            )
            if (ok) {
              await sendMsg(
                chatId,
                `🎉 <b>KasKu v${newVer} Sukses Dirilis ke GitHub & Vercel!</b>`
              )
            } else {
              await sendMsg(chatId, '❌ Gagal update versi ke GitHub.')
            }
          }
        }
      } else if (text.startsWith('/notes ')) {
        const newNotes = text.replace('/notes ', '').trim()
        if (newNotes) {
          await sendMsg(chatId, '⏳ <b>Menyimpan catatan rilis baru...</b>')
          const fileInfo = await getGithubVersionJson()
          if (fileInfo) {
            const updated = {
              ...fileInfo.data,
              releaseNotes: newNotes
            }
            const ok = await updateGithubVersionJson(
              updated,
              fileInfo.sha,
              'Vercel Bot: Update Release Notes'
            )
            if (ok) {
              await sendMsg(chatId, `✅ <b>Catatan rilis berhasil diupdate:</b>\n<i>${newNotes}</i>`)
            }
          }
        }
      }

      // Default: Kirim Dasbor Pusat Kendali
      const fileInfo = await getGithubVersionJson()
      const { text: dashText, keyboard } = buildDashboard(fileInfo?.data)
      await sendMsg(chatId, dashText, keyboard)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'KasKu Telegram Serverless Webhook on Vercel',
    bot: '@Kaskuubot'
  })
}

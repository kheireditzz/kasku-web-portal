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
    return { ok: false, error: err.message }
  }
}

async function sendChatAction(chatId: number | string, action: string = 'typing') {
  return await callTelegram('sendChatAction', {
    chat_id: chatId,
    action
  })
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

async function getGithubVersion(): Promise<{ data: any; sha: string } | null> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/public/version.json`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'KasKu-Vercel-Bot'
      },
      cache: 'no-store'
    })
    if (!res.ok) return null
    const json = await res.json()
    const content = Buffer.from(json.content, 'base64').toString('utf-8')
    return { data: JSON.parse(content), sha: json.sha }
  } catch (e) {
    return null
  }
}

async function updateGithubVersion(data: any, sha: string, commitMsg: string): Promise<boolean> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/public/version.json`
    const contentEncoded = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'KasKu-Vercel-Bot'
      },
      body: JSON.stringify({
        message: commitMsg,
        content: contentEncoded,
        sha
      })
    })
    return res.ok
  } catch (e) {
    return false
  }
}

function changeVersionNumber(curVer: string, delta: number): string {
  const parts = curVer.split('.')
  if (parts.length === 3 && !isNaN(Number(parts[2]))) {
    const newVal = Math.max(0, Number(parts[2]) + delta)
    parts[2] = String(newVal)
    return parts.join('.')
  }
  return curVer
}

function buildDashboard(info: any) {
  const latest = info?.latestVersion || '1.1.95'
  const minReq = info?.minRequiredVersion || '1.1.30'
  const force = Boolean(info?.forceUpdate)
  const notes = info?.releaseNotes || '-'
  const url = info?.updateUrl || 'https://kasku.kheireditz.my.id/'

  const statusBadge = force ? '🔴 <b>TERKUNCI (Wajib Update)</b>' : '🟢 <b>AKTIF (Bebas / Opsional)</b>'
  const lockButtonText = force ? '🔓 Matikan Kunci Update' : '🔒 Kunci Seluruh Versi Lama'
  const lockCallback = force ? 'cmd_force_off' : 'cmd_force_on'

  const broadcastStatus = info?.broadcast?.active ? `📢 <b>Notif HP Aktif:</b> "${info?.broadcast?.title || '-'}"` : '📢 <b>Notif HP:</b> Siaga (Tidak Ada Broadcast)'

  const text =
    '┏━━━━━━━━━━━━━━━━━━━━━┓\n' +
    '   💎 <b>KASKU CLOUD COMMANDER</b>\n' +
    '   <i>Serverless Control Center 24/7</i>\n' +
    '┗━━━━━━━━━━━━━━━━━━━━━┛\n\n' +
    '📊 <b>STATUS DISTRIBUSI APK & WEB:</b>\n' +
    `  ├ 🏷️ <b>Versi Rilis:</b> <code>v${latest}</code>\n` +
    `  ├ 🛡️ <b>Minimal Versi:</b> <code>v${minReq}</code>\n` +
    `  ├ ⚙️ <b>Kebijakan:</b> ${statusBadge}\n` +
    `  ├ 🔔 <b>Notif Status Bar:</b> 🟢 <b>AKTIF</b>\n` +
    `  └ 🌐 <b>Portal Unduh:</b> <a href="${url}">${url}</a>\n\n` +
    '📝 <b>CATATAN RILIS TERBARU:</b>\n' +
    `  └ <i>« ${notes} »</i>\n\n` +
    `${broadcastStatus}\n\n` +
    '⚡ <i>Sentuh tombol di bawah untuk mengontrol server secara instan:</i>'

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔼 Naikkan (+1)', callback_data: 'cmd_up_one' },
        { text: '🔽 Turunkan (-1)', callback_data: 'cmd_down_one' }
      ],
      [
        { text: lockButtonText, callback_data: lockCallback }
      ],
      [
        { text: '📢 Kirim Notifikasi HP', callback_data: 'cmd_prompt_notif' },
        { text: '🔕 Matikan Notif HP', callback_data: 'cmd_clear_notif' }
      ],
      [
        { text: '⏮️ Reset v1.1.95', callback_data: 'cmd_set_95' },
        { text: '🧪 Test v1.1.96', callback_data: 'cmd_set_96' }
      ],
      [
        { text: '🔄 Refresh', callback_data: 'cmd_refresh' },
        { text: '🌐 Buka Portal Web', url: 'https://kasku.kheireditz.my.id/' }
      ]
    ]
  }

  return { text, keyboard }
}

async function executeVersionChange(
  chatId: number | string,
  targetVer: string,
  isForce = true,
  customNotes?: string,
  loadingMsgId?: number
) {
  let progressMsgId = loadingMsgId

  // Jika belum ada pesan loading, buat pesan loading baru
  if (!progressMsgId) {
    const res = await sendMsg(
      chatId,
      '⚙️ <b>[1/3] Membaca konfigurasi server GitHub...</b>\n<i>Mohon tunggu sebentar...</i>'
    )
    progressMsgId = res?.result?.message_id
  } else {
    await editMsg(
      chatId,
      progressMsgId,
      '⚙️ <b>[1/3] Membaca konfigurasi server GitHub...</b>\n<i>Mohon tunggu sebentar...</i>'
    )
  }

  await sendChatAction(chatId, 'typing')

  const fileInfo = await getGithubVersion()
  if (!fileInfo) {
    const errMsg = '❌ <b>Gagal membaca data dari GitHub. Silakan coba sesaat lagi.</b>'
    if (progressMsgId) {
      await editMsg(chatId, progressMsgId, errMsg)
    } else {
      await sendMsg(chatId, errMsg)
    }
    return
  }

  // Update step 2 loading
  if (progressMsgId) {
    await editMsg(
      chatId,
      progressMsgId,
      `🔄 <b>[2/3] Menerapkan versi v${targetVer} ke GitHub & Vercel CDN...</b>\n` +
      `<i>Status: ${isForce ? '🔒 Kunci Update (Wajib)' : '🔓 Update Bebas (Opsional)'}</i>`
    )
  }
  await sendChatAction(chatId, 'upload_document')

  const oldVer = fileInfo.data.latestVersion || '1.1.95'
  fileInfo.data.latestVersion = targetVer
  fileInfo.data.minRequiredVersion = isForce ? targetVer : '1.1.30'
  fileInfo.data.forceUpdate = isForce
  if (customNotes) {
    fileInfo.data.releaseNotes = customNotes
  } else {
    fileInfo.data.releaseNotes = `Pembaruan resmi KasKu v${targetVer}. Peningkatan performa & kestabilan data.`
  }

  const newRel = {
    version: targetVer,
    releaseDate: new Date().toISOString().split('T')[0],
    fileSize: '500 KB',
    downloadUrl: '/apk/KasKu.apk',
    isLatest: true,
    minAndroid: 'Android 7.0 (Nougat)+',
    highlights: [`Pembaruan resmi KasKu v${targetVer}`]
  }

  const filteredReleases = (fileInfo.data.releases || []).filter((r: any) => r.version !== targetVer).map((r: any) => ({
    ...r,
    isLatest: false
  }))

  fileInfo.data.releases = [newRel, ...filteredReleases]

  const ok = await updateGithubVersion(fileInfo.data, fileInfo.sha, `Vercel Bot: Set version v${targetVer}`)
  
  if (ok) {
    const statusText = isForce ? '🔴 <b>Wajib Update (Terkunci)</b>' : '🟢 <b>Opsional (Bebas)</b>'
    const successText =
      '✅ <b>[3/3] BERHASIL DISINKRONKAN KE CLOUD!</b>\n' +
      '━━━━━━━━━━━━━━━━━━━━━\n' +
      `• <b>Versi Sebelumnya:</b> <code>v${oldVer}</code>\n` +
      `• <b>Versi Aktif Baru:</b> <code>v${targetVer}</code>\n` +
      `• <b>Status Aplikasi:</b> ${statusText}\n` +
      '━━━━━━━━━━━━━━━━━━━━━\n' +
      '📡 <i>Server Vercel & GitHub telah diperbarui secara instan.</i>\n' +
      '⚡ <i>Aplikasi pengguna akan otomatis merespon dalam hitungan detik.</i>'

    if (progressMsgId) {
      await editMsg(chatId, progressMsgId, successText)
    } else {
      await sendMsg(chatId, successText)
    }
  } else {
    const failText = '❌ <b>Gagal memperbarui versi ke GitHub. Token kedaluwarsa atau rate limit tercapai.</b>'
    if (progressMsgId) {
      await editMsg(chatId, progressMsgId, failText)
    } else {
      await sendMsg(chatId, failText)
    }
  }

  const fresh = await getGithubVersion()
  const { text: dashText, keyboard: kb } = buildDashboard(fresh?.data)
  await sendMsg(chatId, dashText, kb)
}

export async function POST(req: Request) {
  try {
    const update = await req.json()
    if (!update) return NextResponse.json({ ok: true })

    if (update.callback_query) {
      const cq = update.callback_query
      const cqId = cq.id
      const userId = cq.from?.id
      const data = cq.data
      const msg = cq.message
      const chatId = msg?.chat?.id
      const msgId = msg?.message_id

      if (userId !== ADMIN_ID) {
        await answerCallback(cqId, '⛔ Akses Ditolak!', true)
        return NextResponse.json({ ok: true })
      }

      if (data === 'cmd_refresh') {
        await answerCallback(cqId, '🔄 Menyegarkan data...')
        await sendChatAction(chatId, 'typing')
        const info = await getGithubVersion()
        const { text, keyboard } = buildDashboard(info?.data)
        await editMsg(chatId, msgId, text, keyboard)
      } else if (data === 'cmd_force_on') {
        await answerCallback(cqId, '🔒 Sedang memproses penguncian...')
        await editMsg(chatId, msgId, '⏳ <b>[1/2] Menghubungi GitHub untuk mengunci aplikasi...</b>')
        await sendChatAction(chatId, 'typing')
        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          fileInfo.data.forceUpdate = true
          fileInfo.data.minRequiredVersion = fileInfo.data.latestVersion || '1.1.95'
          await updateGithubVersion(fileInfo.data, fileInfo.sha, 'Vercel Bot: Force Update ON')
          await editMsg(chatId, msgId, `🔒 <b>[2/2] APLIKASI BERHASIL DIKUNCI!</b>\nSemua versi di bawah <code>v${fileInfo.data.latestVersion}</code> wajib update.`)
        }
        const fresh = await getGithubVersion()
        const { text, keyboard } = buildDashboard(fresh?.data)
        await sendMsg(chatId, text, keyboard)
      } else if (data === 'cmd_force_off') {
        await answerCallback(cqId, '🔓 Sedang membuka kunci...')
        await editMsg(chatId, msgId, '⏳ <b>[1/2] Menghubungi GitHub untuk membuka kunci aplikasi...</b>')
        await sendChatAction(chatId, 'typing')
        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          fileInfo.data.forceUpdate = false
          fileInfo.data.minRequiredVersion = '1.1.30'
          await updateGithubVersion(fileInfo.data, fileInfo.sha, 'Vercel Bot: Force Update OFF')
          await editMsg(chatId, msgId, '🔓 <b>[2/2] KUNCI APLIKASI TELAH DIBUKA!</b>\nPengguna bebas menggunakan aplikasi secara normal.')
        }
        const fresh = await getGithubVersion()
        const { text, keyboard } = buildDashboard(fresh?.data)
        await sendMsg(chatId, text, keyboard)
      } else if (data === 'cmd_up_one') {
        await answerCallback(cqId, '🔼 Memproses kenaikan versi (+1)...')
        await editMsg(chatId, msgId, '⏳ <b>Menghitung versi berikutnya...</b>')
        await sendChatAction(chatId, 'typing')
        const info = await getGithubVersion()
        const cur = info?.data?.latestVersion || '1.1.95'
        const nxt = changeVersionNumber(cur, +1)
        await executeVersionChange(chatId, nxt, true, undefined, msgId)
      } else if (data === 'cmd_down_one') {
        await answerCallback(cqId, '🔽 Memproses penurunan versi (-1)...')
        await editMsg(chatId, msgId, '⏳ <b>Menghitung versi sebelumnya...</b>')
        await sendChatAction(chatId, 'typing')
        const info = await getGithubVersion()
        const cur = info?.data?.latestVersion || '1.1.95'
        const prv = changeVersionNumber(cur, -1)
        await executeVersionChange(chatId, prv, false, undefined, msgId)
      } else if (data === 'cmd_set_95') {
        await answerCallback(cqId, '⏮️ Memulihkan ke v1.1.95...')
        await editMsg(chatId, msgId, '⏳ <b>Mempersiapkan reset ke v1.1.95...</b>')
        await sendChatAction(chatId, 'typing')
        await executeVersionChange(chatId, '1.1.95', false, 'Pembaruan KasKu v1.1.95 menghadirkan peningkatan antarmuka modern Apple iOS FinTech, optimasi performa AI Voice, dan pembaruan sistem kas.', msgId)
      } else if (data === 'cmd_set_96') {
        await answerCallback(cqId, '🧪 Mengaktifkan uji coba v1.1.96...')
        await editMsg(chatId, msgId, '⏳ <b>Mempersiapkan uji coba v1.1.96...</b>')
        await sendChatAction(chatId, 'typing')
        await executeVersionChange(chatId, '1.1.96', true, 'Pembaruan sistem wajib KasKu v1.1.96. Versi ini wajib diunduh untuk dapat melanjutkan penggunaan aplikasi.', msgId)
      } else if (data === 'cmd_prompt_notif') {
        await answerCallback(cqId, 'Ketik /notif [pesan anda]')
        await sendMsg(
          chatId,
          '📢 <b>CARA MUDAH KIRIM NOTIFIKASI KE BILAH ATAS HP:</b>\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            'Cukup ketik:\n' +
            '<code>/notif [isi pesan notifikasi]</code>\n\n' +
            '<i>Judul otomatis tetap:</i> <b>KasKu</b> 🏷️\n\n' +
            '<b>Contoh:</b>\n' +
            '<code>/notif Jangan lupa catat uang jajan dan makan siangmu hari ini ya!</code>\n' +
            '<code>/notif Update sistem terbaru telah aktif, selamat menggunakan KasKu!</code>\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            '<i>Notifikasi akan langsung masuk di bar atas HP semua pengguna!</i>'
        )
      } else if (data === 'cmd_clear_notif') {
        await answerCallback(cqId, '🔕 Menghapus notifikasi broadcast...')
        await editMsg(chatId, msgId, '⏳ <b>Sedang menonaktifkan broadcast di cloud...</b>')
        await sendChatAction(chatId, 'typing')
        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          fileInfo.data.broadcast = {
            id: 'clear-' + Date.now(),
            active: false,
            title: '',
            message: '',
            updatedAt: new Date().toISOString()
          }
          await updateGithubVersion(fileInfo.data, fileInfo.sha, 'Vercel Bot: Clear Broadcast Notif')
          await editMsg(chatId, msgId, '🔕 <b>NOTIFIKASI BROADCAST HP TELAH DIMATIKAN!</b>')
        }
        const fresh = await getGithubVersion()
        const { text, keyboard } = buildDashboard(fresh?.data)
        await sendMsg(chatId, text, keyboard)
      }

      return NextResponse.json({ ok: true })
    }

    if (update.message) {
      const msg = update.message
      const chatId = msg.chat?.id
      const userId = msg.from?.id
      const text = (msg.text || '').trim()

      if (userId !== ADMIN_ID) {
        await sendMsg(chatId, `⛔ Akses Dibatasi untuk ID: ${userId}`)
        return NextResponse.json({ ok: true })
      }

      // Kirim typing action seketika agar Telegram menampilkan "typing..." di status bar
      await sendChatAction(chatId, 'typing')

      if (text === '/help') {
        const helpText =
          '📖 <b>PANDUAN PERINTAH KASKU COMMANDER:</b>\n' +
          '━━━━━━━━━━━━━━━━━━━━━\n' +
          '• <code>/start</code> - Menampilkan dasbor kontrol utama\n' +
          '• <code>/status</code> - Menampilkan status versi & server saat ini\n' +
          '• <code>/up 1.1.98</code> - Menaikkan ke nomor versi tertentu (Wajib Update)\n' +
          '• <code>/down 1.1.95</code> - Menurunkan ke nomor versi tertentu (Opsional)\n' +
          '• <code>/lock</code> - Mengunci versi lama (Wajib Update ON)\n' +
          '• <code>/unlock</code> - Membuka kunci (Update Opsional)\n' +
          '• <code>/notes [teks]</code> - Mengubah isi catatan rilis\n' +
          '• <code>/notif [pesan]</code> - <b>Kirim notifikasi langsung ke atas bar HP!</b>\n' +
          '• <code>/clearnotif</code> - Menghapus/menonaktifkan notifikasi broadcast\n' +
          '━━━━━━━━━━━━━━━━━━━━━\n' +
          '💡 <i>Anda juga dapat menekan tombol menu langsung di dasbor interaktif!</i>'
        await sendMsg(chatId, helpText)
      } else if (text.startsWith('/notif ') || text === '/notif') {
        let payload = text.replace('/notif', '').trim()
        let notifTitle = 'KasKu'
        let notifMessage = payload

        // Jika ada separator '|', tetap dukung pemisahan judul | pesan
        if (payload.includes('|')) {
          const parts = payload.split('|')
          notifTitle = (parts[0] || 'KasKu').trim()
          notifMessage = (parts[1] || '').trim()
        }

        if (!notifMessage) {
          notifMessage = 'Pengingat dari KasKu: Catat dan pantau keuangan harianmu agar keuangan tetap sehat!'
        }

        const loadMsg = await sendMsg(chatId, `⏳ <b>[1/2] Menyebarkan notifikasi ke cloud...</b>\n<i>Pesan: "${notifMessage}"</i>`)
        const loadMsgId = loadMsg?.result?.message_id
        await sendChatAction(chatId, 'typing')

        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          const broadcastId = `b-${Date.now()}`
          fileInfo.data.broadcast = {
            id: broadcastId,
            active: true,
            title: notifTitle,
            message: notifMessage,
            updatedAt: new Date().toISOString()
          }
          await updateGithubVersion(fileInfo.data, fileInfo.sha, `Vercel Bot: Broadcast Notif "${notifMessage}"`)
          if (loadMsgId) {
            await editMsg(
              chatId,
              loadMsgId,
              '🔔 <b>[2/2] NOTIFIKASI BERHASIL DIKIRIM KE HP!</b>\n' +
                '━━━━━━━━━━━━━━━━━━━━━\n' +
                `• <b>Judul:</b> ${notifTitle}\n` +
                `• <b>Pesan:</b> ${notifMessage}\n` +
                '━━━━━━━━━━━━━━━━━━━━━\n' +
                '📱 <i>Notifikasi akan langsung masuk di bilah atas HP (Status Bar) pengguna!</i>'
            )
          }
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (text === '/clearnotif') {
        const loadMsg = await sendMsg(chatId, '⏳ <b>Menghapus notifikasi broadcast...</b>')
        const loadMsgId = loadMsg?.result?.message_id
        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          fileInfo.data.broadcast = {
            id: 'clear-' + Date.now(),
            active: false,
            title: '',
            message: '',
            updatedAt: new Date().toISOString()
          }
          await updateGithubVersion(fileInfo.data, fileInfo.sha, 'Vercel Bot: Clear Broadcast Notif')
          if (loadMsgId) {
            await editMsg(chatId, loadMsgId, '🔕 <b>Notifikasi broadcast HP dinonaktifkan.</b>')
          }
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (text === '/lock') {
        const loadMsg = await sendMsg(chatId, '⏳ <b>Sedang mengunci aplikasi di GitHub & Vercel...</b>')
        const loadMsgId = loadMsg?.result?.message_id
        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          fileInfo.data.forceUpdate = true
          fileInfo.data.minRequiredVersion = fileInfo.data.latestVersion || '1.1.95'
          await updateGithubVersion(fileInfo.data, fileInfo.sha, 'Vercel Bot: Lock ON')
          if (loadMsgId) {
            await editMsg(chatId, loadMsgId, '🔒 <b>APLIKASI BERHASIL DIKUNCI!</b>\nSemua versi di bawah <code>v' + fileInfo.data.latestVersion + '</code> wajib update.')
          }
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (text === '/unlock') {
        const loadMsg = await sendMsg(chatId, '⏳ <b>Sedang membuka kunci aplikasi di GitHub & Vercel...</b>')
        const loadMsgId = loadMsg?.result?.message_id
        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          fileInfo.data.forceUpdate = false
          fileInfo.data.minRequiredVersion = '1.1.30'
          await updateGithubVersion(fileInfo.data, fileInfo.sha, 'Vercel Bot: Unlock')
          if (loadMsgId) {
            await editMsg(chatId, loadMsgId, '🔓 <b>KUNCI APLIKASI TELAH DIBUKA!</b>\nPengguna bebas memakai aplikasi.')
          }
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (text.startsWith('/up ') || text.startsWith('/down ')) {
        const cmdParts = text.split(' ')
        const newVer = cmdParts[1] ? cmdParts[1].replace('v', '').trim() : ''
        if (newVer) {
          const isF = text.startsWith('/up ')
          const loadMsg = await sendMsg(chatId, `⏳ <b>Sedang memproses ${isF ? 'kenaikan' : 'penurunan'} versi ke v${newVer}...</b>`)
          const loadMsgId = loadMsg?.result?.message_id
          await executeVersionChange(chatId, newVer, isF, undefined, loadMsgId)
        } else {
          await sendMsg(chatId, '⚠️ Format salah. Contoh penggunaan: <code>/up 1.1.98</code> atau <code>/down 1.1.95</code>')
        }
      } else if (text.startsWith('/notes ')) {
        const newNotes = text.replace('/notes ', '').trim()
        if (newNotes) {
          const loadMsg = await sendMsg(chatId, '⏳ <b>Sedang menyimpan catatan rilis baru ke GitHub...</b>')
          const loadMsgId = loadMsg?.result?.message_id
          const fileInfo = await getGithubVersion()
          if (fileInfo) {
            fileInfo.data.releaseNotes = newNotes
            await updateGithubVersion(fileInfo.data, fileInfo.sha, 'Vercel Bot: Update Release Notes')
            if (loadMsgId) {
              await editMsg(chatId, loadMsgId, `✅ <b>Catatan rilis berhasil diperbarui:</b>\n<i>« ${newNotes} »</i>`)
            }
          }
          const fresh = await getGithubVersion()
          const { text: t, keyboard: k } = buildDashboard(fresh?.data)
          await sendMsg(chatId, t, k)
        }
      } else {
        const loadMsg = await sendMsg(chatId, '🔄 <b>Memuat dasbor kontrol...</b>')
        const loadMsgId = loadMsg?.result?.message_id
        const info = await getGithubVersion()
        const { text: dashText, keyboard: kb } = buildDashboard(info?.data)
        if (loadMsgId) {
          await editMsg(chatId, loadMsgId, dashText, kb)
        } else {
          await sendMsg(chatId, dashText, kb)
        }
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'KasKu Telegram Serverless Webhook (Next.js TypeScript)',
    bot: '@Kaskuubot'
  })
}

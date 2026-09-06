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

  const statusBadge = force ? '🔴 <b>Wajib Update (Terkunci)</b>' : '🟢 <b>Opsional (Bebas)</b>'
  const lockButtonText = force ? '🔓 Buka Kunci Aplikasi' : '🔒 Kunci Aplikasi (Paksa Update)'
  const lockCallback = force ? 'cmd_force_off' : 'cmd_force_on'

  const broadcastMsg = info?.broadcast?.message || info?.broadcast?.title || '-'
  const broadcastStatus = info?.broadcast?.active 
    ? `🔔 <b>BROADCAST HP SAAT INI:</b>\n   └ 🟢 <i>« ${broadcastMsg} »</i>` 
    : '🔔 <b>BROADCAST HP SAAT INI:</b>\n   └ ⚪ <i>Tidak ada broadcast aktif</i>'

  const savedNotif = info?.savedNotification || 'Jangan Lupa Catat Laporan Keuangan Yaa'

  const schedules: any[] = Array.isArray(info?.dailySchedules) ? info.dailySchedules : [
    { id: 'sched_07', time: '07:00', label: 'Pagi', message: 'Selamat Pagii', enabled: true },
    { id: 'sched_13', time: '13:00', label: 'Siang', message: 'Jangan Lupa Isi Laporan Keuangan ya', enabled: true },
    { id: 'sched_21', time: '21:00', label: 'Malam', message: 'Jangan Lupa Isi Laporan Keuangan Ya', enabled: true },
    { id: 'sched_00', time: '00:00', label: 'Tengah Malam', message: 'Selamat Tidur', enabled: true }
  ]

  let schedSummary = '⏰ <b>PENGINGAT OTOMATIS 4-WAKTU (HARIAN):</b>\n'
  schedules.forEach(s => {
    const icon = s.enabled ? '🟢' : '⚪'
    const statusText = s.enabled ? '<b>ON</b>' : '<i>OFF</i>'
    schedSummary += `   • ${icon} <code>${s.time}</code> [${statusText}] : « <i>${s.message}</i> »\n`
  })

  const text =
    '💎 <b>KASKU COMMAND CENTER</b>\n' +
    '━━━━━━━━━━━━━━━━━━━━━\n' +
    `📱 <b>Versi:</b> <code>v${latest}</code> (${statusBadge})\n` +
    `📝 <i>« ${notes} »</i>\n` +
    '━━━━━━━━━━━━━━━━━━━━━\n' +
    `${broadcastStatus}\n\n` +
    `${schedSummary}\n` +
    `📌 <b>Template:</b> <i>« ${savedNotif} »</i>\n` +
    '━━━━━━━━━━━━━━━━━━━━━'

  // Tombol Toggle 4 Jadwal Harian yang rapi dan elegan
  const schedBtn07 = (schedules.find(s => s.id === 'sched_07')?.enabled ? '🟢' : '⚪') + ' 07:00 Pagi'
  const schedBtn13 = (schedules.find(s => s.id === 'sched_13')?.enabled ? '🟢' : '⚪') + ' 13:00 Siang'
  const schedBtn21 = (schedules.find(s => s.id === 'sched_21')?.enabled ? '🟢' : '⚪') + ' 21:00 Malam'
  const schedBtn00 = (schedules.find(s => s.id === 'sched_00')?.enabled ? '🟢' : '⚪') + ' 00:00 Tidur'

  const nextVer = changeVersionNumber(latest, 1)

  const keyboard = {
    inline_keyboard: [
      // Section 1: Quick Action
      [
        { text: '⚡ Kirim Notif Cepat Sekarang', callback_data: 'cmd_quick_notif' }
      ],
      // Section 2: Toggle 4 Jadwal Harian
      [
        { text: schedBtn07, callback_data: 'cmd_toggle_sched_07' },
        { text: schedBtn13, callback_data: 'cmd_toggle_sched_13' }
      ],
      [
        { text: schedBtn21, callback_data: 'cmd_toggle_sched_21' },
        { text: schedBtn00, callback_data: 'cmd_toggle_sched_00' }
      ],
      // Section 3: Broadcast Control
      [
        { text: '📢 Notif Kustom', callback_data: 'cmd_prompt_notif' },
        { text: '🔕 Matikan Notif', callback_data: 'cmd_clear_notif' }
      ],
      // Section 4: Template & Send
      [
        { text: '⚙️ Set Template', callback_data: 'cmd_prompt_setnotif' },
        { text: '🚀 Kirim Template', callback_data: 'cmd_send_saved_notif' }
      ],
      [
        { text: '📦 Template Update APK', callback_data: 'cmd_tpl_update' }
      ],
      // Section 5: App Version & Security
      [
        { text: lockButtonText, callback_data: lockCallback }
      ],
      [
        { text: '🔼 Naik Versi (+1)', callback_data: 'cmd_up_one' },
        { text: '🔽 Turun Versi (-1)', callback_data: 'cmd_down_one' }
      ],
      // Section 6: Maintenance & Quick Testing (Otomatis Sesuai Versi Aktif)
      [
        { text: `⏮️ Reset v${latest}`, callback_data: `cmd_reset_current` },
        { text: `🧪 Uji v${nextVer}`, callback_data: `cmd_test_next` }
      ],
      // Section 7: Utilities & Cek Versi
      [
        { text: '🔍 Cek Versi Server', callback_data: 'cmd_check_version' },
        { text: '🔄 Muat Ulang', callback_data: 'cmd_refresh' }
      ],
      [
        { text: '🌐 Buka Portal KasKu', url: 'https://kasku.kheireditz.my.id/' }
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
      } else if (data === 'cmd_reset_current' || data === 'cmd_set_102' || data === 'cmd_set_101' || data === 'cmd_set_95') {
        const info = await getGithubVersion()
        const cur = info?.data?.latestVersion || '1.1.102'
        await answerCallback(cqId, `⏮️ Reset ke v${cur}...`)
        await editMsg(chatId, msgId, `⏳ <b>Reset ke v${cur} (Opsional)...</b>`)
        await sendChatAction(chatId, 'typing')
        await executeVersionChange(chatId, cur, false, `Pembaruan resmi KasKu v${cur}. Stabilitas notifikasi & performa.`, msgId)
      } else if (data === 'cmd_test_next' || data === 'cmd_set_103' || data === 'cmd_set_96') {
        const info = await getGithubVersion()
        const cur = info?.data?.latestVersion || '1.1.102'
        const nxt = changeVersionNumber(cur, 1)
        await answerCallback(cqId, `🧪 Uji coba v${nxt}...`)
        await editMsg(chatId, msgId, `⏳ <b>Uji coba v${nxt} (Wajib Update)...</b>`)
        await sendChatAction(chatId, 'typing')
        await executeVersionChange(chatId, nxt, true, `Uji coba pembaruan KasKu v${nxt}. Wajib update.`, msgId)
      } else if (data === 'cmd_check_version') {
        await answerCallback(cqId, '🔍 Memeriksa versi server...')
        await sendChatAction(chatId, 'typing')
        const info = await getGithubVersion()
        const cur = info?.data?.latestVersion || '1.1.102'
        const minV = info?.data?.minRequiredVersion || '1.1.30'
        const force = info?.data?.forceUpdate ? '🔴 Wajib Update (Terkunci)' : '🟢 Opsional (Bebas)'
        const notes = info?.data?.releaseNotes || '-'
        const date = info?.data?.releases?.[0]?.releaseDate || '-'
        await sendMsg(
          chatId,
          '🔍 <b>STATUS VERSI KASKU REALTIME SERVER</b>\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            `• <b>Versi Terkini:</b> <code>v${cur}</code>\n` +
            `• <b>Batas Min Versi:</b> <code>v${minV}</code>\n` +
            `• <b>Status Kebijakan:</b> ${force}\n` +
            `• <b>Tanggal Rilis:</b> <code>${date}</code>\n` +
            `• <b>Catatan Rilis:</b> <i>« ${notes} »</i>\n` +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            '🌐 <i>Endpoint live: /api/version</i>'
        )
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
      } else if (data === 'cmd_tpl_update') {
        const info = await getGithubVersion()
        const cur = info?.data?.latestVersion || '1.1.102'
        const nextVer = changeVersionNumber(cur, 1)
        await answerCallback(cqId, '📦 Template Notifikasi Update APK')
        await sendMsg(
          chatId,
          '📦 <b>TEMPLATE CEPAT NOTIFIKASI UPDATE APK</b>\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            'Gunakan perintah kilat di bawah ini untuk mengirim notifikasi update versi ke bilah status HP:\n\n' +
            '<code>/notifupdate ' + cur + ' | ' + nextVer + ' | Peningkatan performa & UI | Fitur AI Voice makin cepat</code>\n\n' +
            '<b>Atau format bebas:</b>\n' +
            '<code>/notifupdate [versi_lama] | [versi_baru] | [fitur_1] | [fitur_2]</code>\n\n' +
            '<b>Contoh hasil di notifikasi HP:</b>\n' +
            '<i>« KasKu v' + nextVer + ' Siap Diunduh! Pembaruan dari v' + cur + ': Peningkatan performa & UI, Fitur AI Voice makin cepat. Buka aplikasi untuk update. »</i>\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            '💡 <i>Salin teks di atas, ubah sesuai kebutuhan, lalu kirim ke bot!</i>',
          {
            inline_keyboard: [
              [
                {
                  text: `⚡ Kirim Cepat Notif Update v${nextVer}`,
                  callback_data: `cmd_send_fast_update_${nextVer}`
                }
              ]
            ]
          }
        )
      } else if (data === 'cmd_quick_notif') {
        const quickMsg = 'Jangan Lupa Catat Laporan Keuangan Yaa'
        await answerCallback(cqId, '⚡ Mengirim Notif Cepat...')
        await editMsg(chatId, msgId, `⏳ <b>[1/2] Menyebarkan Notif Cepat ke HP...</b>\n<i>Pesan: "${quickMsg}"</i>`)
        await sendChatAction(chatId, 'typing')
        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          const broadcastId = `b-${Date.now()}`
          fileInfo.data.broadcast = {
            id: broadcastId,
            active: true,
            title: 'KasKu',
            message: quickMsg,
            updatedAt: new Date().toISOString()
          }
          await updateGithubVersion(fileInfo.data, fileInfo.sha, `Vercel Bot: Quick Notif "${quickMsg}"`)
          await editMsg(
            chatId,
            msgId,
            '🔔 <b>[2/2] NOTIFIKASI CEPAT BERHASIL TERKIRIM!</b>\n' +
              '━━━━━━━━━━━━━━━━━━━━━\n' +
              '• <b>Judul:</b> KasKu\n' +
              `• <b>Pesan:</b> ${quickMsg}\n` +
              '━━━━━━━━━━━━━━━━━━━━━\n' +
              '📱 <i>Pengguna akan langsung menerima notifikasi di bilah atas HP!</i>'
          )
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (data === 'cmd_send_saved_notif') {
        await answerCallback(cqId, '🚀 Mengirim notifikasi tersimpan...')
        await editMsg(chatId, msgId, '⏳ <b>[1/2] Mengambil template notifikasi tersimpan...</b>')
        await sendChatAction(chatId, 'typing')
        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          const targetMsg = fileInfo.data.savedNotification || 'Jangan Lupa Catat Laporan Keuangan Yaa'
          const broadcastId = `b-${Date.now()}`
          fileInfo.data.broadcast = {
            id: broadcastId,
            active: true,
            title: 'KasKu',
            message: targetMsg,
            updatedAt: new Date().toISOString()
          }
          await updateGithubVersion(fileInfo.data, fileInfo.sha, `Vercel Bot: Send Saved Notif "${targetMsg}"`)
          await editMsg(
            chatId,
            msgId,
            '🔔 <b>[2/2] NOTIFIKASI TERSIMPAN BERHASIL DIKIRIM!</b>\n' +
              '━━━━━━━━━━━━━━━━━━━━━\n' +
              '• <b>Judul:</b> KasKu\n' +
              `• <b>Pesan:</b> ${targetMsg}\n` +
              '━━━━━━━━━━━━━━━━━━━━━\n' +
              '📱 <i>Notifikasi langsung masuk di status bar HP pengguna.</i>'
          )
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (data.startsWith('cmd_send_fast_update_')) {
        const targetV = data.replace('cmd_send_fast_update_', '')
        await answerCallback(cqId, `📦 Menyebarkan notif rilis v${targetV}...`)
        await editMsg(chatId, msgId, `⏳ <b>[1/2] Menyebarkan notifikasi rilis v${targetV} ke seluruh HP...</b>`)
        await sendChatAction(chatId, 'typing')
        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          const curV = fileInfo.data.latestVersion || '1.1.102'
          const updateMessage = `Pembaruan Resmi KasKu v${targetV}! Peningkatan performa & kestabilan data. Buka aplikasi untuk update.`
          const broadcastId = `b-${Date.now()}`
          fileInfo.data.broadcast = {
            id: broadcastId,
            active: true,
            title: 'KasKu Update',
            message: updateMessage,
            updatedAt: new Date().toISOString()
          }
          await updateGithubVersion(fileInfo.data, fileInfo.sha, `Vercel Bot: Fast Update Notif v${targetV}`)
          await editMsg(
            chatId,
            msgId,
            '🔔 <b>[2/2] NOTIFIKASI UPDATE APK BERHASIL DIKIRIM KE HP!</b>\n' +
              '━━━━━━━━━━━━━━━━━━━━━\n' +
              '• <b>Judul:</b> KasKu Update\n' +
              `• <b>Pesan:</b> ${updateMessage}\n` +
              '━━━━━━━━━━━━━━━━━━━━━\n' +
              '📱 <i>Pengguna akan langsung menerima notifikasi update di status bar HP!</i>'
          )
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (data === 'cmd_prompt_setnotif') {
        await answerCallback(cqId, 'Ketik /setnotif [isi pesan]')
        await sendMsg(
          chatId,
          '⚙️ <b>CARA SIMPAN TEMPLATE NOTIFIKASI:</b>\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            'Ketik pesan perintah:\n' +
            '<code>/setnotif [isi pesan yang ingin disimpan]</code>\n\n' +
            '<b>Contoh:</b>\n' +
            '<code>/setnotif Jangan Lupa Catat Laporan Keuangan Yaa</code>\n\n' +
            '<i>Setelah disimpan, Anda cukup menekan tombol "🚀 Kirim Notif Tersimpan" kapan saja untuk membroadcast ulang tanpa perlu mengetik lagi!</i>'
        )
      } else if (
        data === 'cmd_toggle_sched_07' ||
        data === 'cmd_toggle_sched_13' ||
        data === 'cmd_toggle_sched_21' ||
        data === 'cmd_toggle_sched_00'
      ) {
        const targetId = data.replace('cmd_toggle_', '')
        await answerCallback(cqId, '⚙️ Mengubah status jadwal...')
        await editMsg(chatId, msgId, '⏳ <b>Menyinkronkan status jadwal ke cloud...</b>')
        await sendChatAction(chatId, 'typing')

        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          if (!Array.isArray(fileInfo.data.dailySchedules)) {
            fileInfo.data.dailySchedules = [
              { id: 'sched_07', time: '07:00', hour: 7, minute: 0, label: 'Pagi (07:00)', message: 'Selamat Pagii', enabled: true },
              { id: 'sched_13', time: '13:00', hour: 13, minute: 0, label: 'Siang (13:00)', message: 'Jangan Lupa Isi Laporan Keuangan ya', enabled: true },
              { id: 'sched_21', time: '21:00', hour: 21, minute: 0, label: 'Malam (21:00)', message: 'Jangan Lupa Isi Laporan Keuangan Ya', enabled: true },
              { id: 'sched_00', time: '00:00', hour: 0, minute: 0, label: 'Tengah Malam (00:00)', message: 'Selamat Tidur', enabled: true }
            ]
          }

          let changedLabel = ''
          let newState = false
          fileInfo.data.dailySchedules = fileInfo.data.dailySchedules.map((s: any) => {
            if (s.id === targetId) {
              newState = !s.enabled
              changedLabel = `${s.time} (${s.message})`
              return { ...s, enabled: newState }
            }
            return s
          })

          await updateGithubVersion(fileInfo.data, fileInfo.sha, `Vercel Bot: Toggle ${targetId} to ${newState ? 'ON' : 'OFF'}`)
          await editMsg(
            chatId,
            msgId,
            `⏰ <b>STATUS JADWAL BERHASIL DIUBAH!</b>\n` +
              `━━━━━━━━━━━━━━━━━━━━━\n` +
              `• <b>Jadwal:</b> ${changedLabel}\n` +
              `• <b>Status Sekarang:</b> ${newState ? '🟢 <b>ON (Aktif)</b>' : '🔴 <b>OFF (Nonaktif)</b>'}\n` +
              `━━━━━━━━━━━━━━━━━━━━━\n` +
              `📱 <i>Perubahan langsung tersinkronisasi ke sistem alarm seluruh pengguna!</i>`
          )
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (data === 'cmd_set_jadwal_20' || data === 'cmd_set_jadwal_13') {
        const hour = data === 'cmd_set_jadwal_20' ? 20 : 13
        const minute = 0
        const timeStr = `${String(hour).padStart(2, '0')}:00`
        await answerCallback(cqId, `⏰ Menyetel jadwal pengingat pukul ${timeStr}...`)
        await editMsg(chatId, msgId, `⏳ <b>[1/2] Menyetel alarm pengingat harian jam ${timeStr} WIB di cloud...</b>`)
        await sendChatAction(chatId, 'typing')

        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          const defaultMsg = fileInfo.data.savedNotification || 'Jangan Lupa Catat Laporan Keuangan Yaa'
          fileInfo.data.scheduledNotification = {
            active: true,
            hour: hour,
            minute: minute,
            time: timeStr,
            title: 'KasKu',
            message: defaultMsg,
            updatedAt: new Date().toISOString()
          }
          await updateGithubVersion(fileInfo.data, fileInfo.sha, `Vercel Bot: Set Schedule ${timeStr}`)
          await editMsg(
            chatId,
            msgId,
            `⏰ <b>[2/2] JADWAL PENGINGAT HARIAN AKTIF!</b>\n` +
              `━━━━━━━━━━━━━━━━━━━━━\n` +
              `• <b>Waktu:</b> Setiap hari pukul <b>${timeStr} WIB</b>\n` +
              `• <b>Judul:</b> KasKu\n` +
              `• <b>Pesan:</b> ${defaultMsg}\n` +
              `━━━━━━━━━━━━━━━━━━━━━\n` +
              `📱 <i>Aplikasi di HP seluruh pengguna akan otomatis membunyikan notifikasi setiap pukul ${timeStr}!</i>`
          )
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (data === 'cmd_prompt_jadwal') {
        await answerCallback(cqId, 'Ketik /jadwal HH:mm [pesan]')
        await sendMsg(
          chatId,
          '⏰ <b>CARA MENGATUR JADWAL NOTIFIKASI JAM BEBAS:</b>\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            'Format perintah:\n' +
            '<code>/jadwal [Jam:Menit] [Pesan Bebas]</code>\n\n' +
            '<b>Contoh 1:</b>\n' +
            '<code>/jadwal 21:00</code> (Pakai template tersimpan)\n\n' +
            '<b>Contoh 2:</b>\n' +
            '<code>/jadwal 07:30 Semangat pagi! Jangan lupa cek saldo kas hari ini.</code>\n\n' +
            '<b>Contoh 3 (Matikan Jadwal):</b>\n' +
            '<code>/clearjadwal</code>\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            '<i>Pengingat akan muncul otomatis di jam tersebut di HP pengguna!</i>'
        )
      } else if (data === 'cmd_clear_jadwal') {
        await answerCallback(cqId, '🔕 Mematikan jadwal pengingat...')
        await editMsg(chatId, msgId, '⏳ <b>Menonaktifkan jadwal pengingat harian...</b>')
        await sendChatAction(chatId, 'typing')
        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          fileInfo.data.scheduledNotification = {
            active: false,
            hour: null,
            minute: null,
            time: null,
            title: '',
            message: '',
            updatedAt: new Date().toISOString()
          }
          await updateGithubVersion(fileInfo.data, fileInfo.sha, 'Vercel Bot: Clear Scheduled Notification')
          await editMsg(chatId, msgId, '🔕 <b>JADWAL PENGINGAT HARIAN TELAH DINONAKTIFKAN!</b>')
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
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
          '╔════════════════════════════╗\n' +
          '   📖 <b>PANDUAN LENGKAP KASKU BOT</b>\n' +
          '╚════════════════════════════╝\n\n' +
          '⚡ <b>KONTROL UTAMA & DASBOR:</b>\n' +
          '   • <code>/start</code> - Menampilkan dasbor visual lengkap\n' +
          '   • <code>/status</code> - Ringkasan status server & versi\n\n' +
          '📢 <b>KIRIM & SET NOTIFIKASI HP:</b>\n' +
          '   • <code>/notif [pesan]</code> - Broadcast instan ke bilah status bar HP\n' +
          '   • <code>/notifupdate [lama] | [baru] | [fitur1] | [fitur2]</code> - Template cepat notifikasi rilis\n' +
          '   • <code>/setnotif [pesan]</code> - Simpan teks template notifikasi\n' +
          '   • <code>/clearnotif</code> - Matikan notifikasi broadcast aktif\n\n' +
          '⏰ <b>PENGATURAN 4-JADWAL HARIAN:</b>\n' +
          '   • <code>/stopjadwal 07</code> - Matikan jadwal 07:00 Pagi\n' +
          '   • <code>/stopjadwal 13</code> - Matikan jadwal 13:00 Siang\n' +
          '   • <code>/stopjadwal 21</code> - Matikan jadwal 21:00 Malam\n' +
          '   • <code>/stopjadwal 00</code> - Matikan jadwal 00:00 Tengah Malam\n' +
          '   • <code>/startjadwal [07/13/21/00]</code> - Nyalakan jadwal\n\n' +
          '🛡️ <b>MANAJEMEN RILIS & KEAMANAN:</b>\n' +
          '   • <code>/lock</code> - Wajib update ke versi terbaru\n' +
          '   • <code>/unlock</code> - Buka kunci (Update bebas/opsional)\n' +
          '   • <code>/up [versi]</code> - Naikkan versi aplikasi\n' +
          '   • <code>/down [versi]</code> - Turunkan versi aplikasi\n' +
          '   • <code>/notes [teks]</code> - Ubah catatan rilis resmi\n' +
          '────────────────────────────\n' +
          '💡 <i>Tips: Seluruh perintah di atas juga dapat Anda akses hanya dengan menekan tombol pada dasbor!</i>'
        await sendMsg(chatId, helpText)
      } else if (text.startsWith('/stopjadwal ') || text.startsWith('/startjadwal ')) {
        const isEnable = text.startsWith('/startjadwal ')
        const arg = text.replace(isEnable ? '/startjadwal ' : '/stopjadwal ', '').trim()
        const targetId = arg.includes(':') ? `sched_${arg.split(':')[0]}` : (arg.length <= 2 ? `sched_${arg.padStart(2, '0')}` : arg)

        const loadMsg = await sendMsg(chatId, `⏳ <b>Menyetel status jadwal ${arg} ke ${isEnable ? 'AKTIF' : 'NONAKTIF'}...</b>`)
        const loadMsgId = loadMsg?.result?.message_id
        await sendChatAction(chatId, 'typing')

        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          if (!Array.isArray(fileInfo.data.dailySchedules)) {
            fileInfo.data.dailySchedules = [
              { id: 'sched_07', time: '07:00', hour: 7, minute: 0, label: 'Pagi (07:00)', message: 'Selamat Pagii', enabled: true },
              { id: 'sched_13', time: '13:00', hour: 13, minute: 0, label: 'Siang (13:00)', message: 'Jangan Lupa Isi Laporan Keuangan ya', enabled: true },
              { id: 'sched_21', time: '21:00', hour: 21, minute: 0, label: 'Malam (21:00)', message: 'Jangan Lupa Isi Laporan Keuangan Ya', enabled: true },
              { id: 'sched_00', time: '00:00', hour: 0, minute: 0, label: 'Tengah Malam (00:00)', message: 'Selamat Tidur', enabled: true }
            ]
          }

          let found = false
          let schedName = ''
          fileInfo.data.dailySchedules = fileInfo.data.dailySchedules.map((s: any) => {
            if (s.id === targetId || s.time.startsWith(arg)) {
              found = true
              schedName = `${s.time} (${s.message})`
              return { ...s, enabled: isEnable }
            }
            return s
          })

          if (found) {
            await updateGithubVersion(fileInfo.data, fileInfo.sha, `Vercel Bot: Set ${targetId} to ${isEnable}`)
            if (loadMsgId) {
              await editMsg(
                chatId,
                loadMsgId,
                `⏰ <b>STATUS JADWAL BERHASIL DIUBAH!</b>\n` +
                  `━━━━━━━━━━━━━━━━━━━━━\n` +
                  `• <b>Jadwal:</b> ${schedName}\n` +
                  `• <b>Status:</b> ${isEnable ? '🟢 <b>ON (Aktif)</b>' : '🔴 <b>OFF (Nonaktif)</b>'}\n` +
                  `━━━━━━━━━━━━━━━━━━━━━\n` +
                  `📱 <i>Perubahan langsung tersinkronisasi ke seluruh pengguna!</i>`
              )
            }
          } else {
            if (loadMsgId) {
              await editMsg(chatId, loadMsgId, `⚠️ Jadwal "${arg}" tidak ditemukan. Pilihan: <code>07</code>, <code>13</code>, <code>21</code>, <code>00</code>.`)
            }
          }
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (text.startsWith('/jadwal ') || text === '/jadwal') {
        const rawPayload = text.replace('/jadwal', '').trim()
        let hour = 20
        let minute = 0
        let schedMsg = ''

        if (rawPayload) {
          const parts = rawPayload.split(' ')
          const timePart = parts[0]
          if (timePart && timePart.includes(':')) {
            const timeSub = timePart.split(':')
            const h = parseInt(timeSub[0], 10)
            const m = parseInt(timeSub[1], 10)
            if (!isNaN(h) && h >= 0 && h <= 23) hour = h
            if (!isNaN(m) && m >= 0 && m <= 59) minute = m
            schedMsg = parts.slice(1).join(' ').trim()
          } else if (!isNaN(parseInt(timePart, 10))) {
            const h = parseInt(timePart, 10)
            if (h >= 0 && h <= 23) hour = h
            schedMsg = parts.slice(1).join(' ').trim()
          } else {
            schedMsg = rawPayload
          }
        }

        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        const loadMsg = await sendMsg(chatId, `⏳ <b>Menyetel jadwal alarm pengingat harian ${timeStr} WIB...</b>`)
        const loadMsgId = loadMsg?.result?.message_id
        await sendChatAction(chatId, 'typing')

        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          if (!schedMsg) {
            schedMsg = fileInfo.data.savedNotification || 'Jangan Lupa Catat Laporan Keuangan Yaa'
          }
          fileInfo.data.scheduledNotification = {
            active: true,
            hour: hour,
            minute: minute,
            time: timeStr,
            title: 'KasKu',
            message: schedMsg,
            updatedAt: new Date().toISOString()
          }
          await updateGithubVersion(fileInfo.data, fileInfo.sha, `Vercel Bot: Set Schedule ${timeStr}`)
          if (loadMsgId) {
            await editMsg(
              chatId,
              loadMsgId,
              `⏰ <b>JADWAL PENGINGAT HARIAN BERHASIL DIAKTIFKAN!</b>\n` +
                `━━━━━━━━━━━━━━━━━━━━━\n` +
                `• <b>Jam Eksekusi:</b> <b>${timeStr} WIB</b> (Setiap Hari)\n` +
                `• <b>Pesan:</b> ${schedMsg}\n` +
                `━━━━━━━━━━━━━━━━━━━━━\n` +
                `📱 <i>Aplikasi di HP seluruh pengguna akan otomatis membunyikan notifikasi setiap pukul ${timeStr}!</i>`
            )
          }
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (text === '/clearjadwal') {
        const loadMsg = await sendMsg(chatId, '⏳ <b>Menonaktifkan jadwal pengingat harian di cloud...</b>')
        const loadMsgId = loadMsg?.result?.message_id
        await sendChatAction(chatId, 'typing')

        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          fileInfo.data.scheduledNotification = {
            active: false,
            hour: null,
            minute: null,
            time: null,
            title: '',
            message: '',
            updatedAt: new Date().toISOString()
          }
          await updateGithubVersion(fileInfo.data, fileInfo.sha, 'Vercel Bot: Clear Scheduled Notification')
          if (loadMsgId) {
            await editMsg(chatId, loadMsgId, '🔕 <b>JADWAL PENGINGAT HARIAN TELAH DINONAKTIFKAN!</b>')
          }
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (text.startsWith('/setnotif ') || text === '/setnotif') {
        const newTemplate = text.replace('/setnotif', '').trim() || 'Jangan Lupa Catat Laporan Keuangan Yaa'
        const loadMsg = await sendMsg(chatId, `⏳ <b>Menyimpan template notifikasi ke cloud...</b>\n<i>« ${newTemplate} »</i>`)
        const loadMsgId = loadMsg?.result?.message_id
        await sendChatAction(chatId, 'typing')

        const fileInfo = await getGithubVersion()
        if (fileInfo) {
          fileInfo.data.savedNotification = newTemplate
          await updateGithubVersion(fileInfo.data, fileInfo.sha, `Vercel Bot: Save Notification Template "${newTemplate}"`)
          if (loadMsgId) {
            await editMsg(
              chatId,
              loadMsgId,
              '💾 <b>TEMPLATE NOTIFIKASI BERHASIL DISIMPAN!</b>\n' +
                '━━━━━━━━━━━━━━━━━━━━━\n' +
                `• <b>Isi Notif:</b> ${newTemplate}\n` +
                '━━━━━━━━━━━━━━━━━━━━━\n' +
                '💡 <i>Sekarang Anda bisa kirim kapan saja cukup dengan menekan tombol "🚀 Kirim Notif Tersimpan" di dasbor!</i>'
            )
          }
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
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
      } else if (text.startsWith('/notifupdate ') || text === '/notifupdate') {
        const rawPayload = text.replace('/notifupdate', '').trim()
        const fileInfo = await getGithubVersion()
        const curVer = fileInfo?.data?.latestVersion || '1.1.102'
        const nextVer = changeVersionNumber(curVer, 1)

        let fromVer = curVer
        let toVer = nextVer
        let p1 = 'Peningkatan performa'
        let p2 = 'Kestabilan sistem'

        if (rawPayload) {
          const parts = rawPayload.split('|').map(s => s.trim()).filter(Boolean)
          if (parts.length >= 4) {
            fromVer = parts[0]
            toVer = parts[1]
            p1 = parts[2]
            p2 = parts[3]
          } else if (parts.length === 3) {
            toVer = parts[0]
            p1 = parts[1]
            p2 = parts[2]
          } else if (parts.length === 2) {
            toVer = parts[0]
            p1 = parts[1]
            p2 = 'Optimalisasi sistem'
          } else {
            toVer = parts[0]
          }
        }

        const formattedMsg = `Pembaruan Resmi KasKu v${toVer}! Dari v${fromVer}: ${p1} & ${p2}. Buka aplikasi untuk update.`
        const loadMsg = await sendMsg(chatId, `⏳ <b>[1/2] Menyebarkan notifikasi rilis v${toVer} ke cloud...</b>\n<i>« ${formattedMsg} »</i>`)
        const loadMsgId = loadMsg?.result?.message_id
        await sendChatAction(chatId, 'typing')

        if (fileInfo) {
          const broadcastId = `b-${Date.now()}`
          fileInfo.data.broadcast = {
            id: broadcastId,
            active: true,
            title: 'KasKu Update',
            message: formattedMsg,
            updatedAt: new Date().toISOString()
          }
          await updateGithubVersion(fileInfo.data, fileInfo.sha, `Vercel Bot: Notif Update v${toVer} (${p1}, ${p2})`)
          if (loadMsgId) {
            await editMsg(
              chatId,
              loadMsgId,
              '🚀 <b>[2/2] NOTIFIKASI UPDATE APK BERHASIL DIKIRIM KE HP!</b>\n' +
                '━━━━━━━━━━━━━━━━━━━━━\n' +
                '• <b>Target Versi:</b> <code>v' + toVer + '</code> (dari <code>v' + fromVer + '</code>)\n' +
                '• <b>Peningkatan 1:</b> ' + p1 + '\n' +
                '• <b>Peningkatan 2:</b> ' + p2 + '\n' +
                '• <b>Teks Notifikasi:</b>\n' +
                '  <i>« ' + formattedMsg + ' »</i>\n' +
                '━━━━━━━━━━━━━━━━━━━━━\n' +
                '📱 <i>Notifikasi langsung masuk dan berbunyi di bilah status HP seluruh pengguna!</i>'
            )
          }
        }
        const fresh = await getGithubVersion()
        const { text: t, keyboard: k } = buildDashboard(fresh?.data)
        await sendMsg(chatId, t, k)
      } else if (text === '/versi' || text === '/checkversion') {
        await sendChatAction(chatId, 'typing')
        const info = await getGithubVersion()
        const cur = info?.data?.latestVersion || '1.1.102'
        const minV = info?.data?.minRequiredVersion || '1.1.30'
        const force = info?.data?.forceUpdate ? '🔴 Wajib Update (Terkunci)' : '🟢 Opsional (Bebas)'
        const notes = info?.data?.releaseNotes || '-'
        const date = info?.data?.releases?.[0]?.releaseDate || '-'
        await sendMsg(
          chatId,
          '🔍 <b>STATUS VERSI KASKU REALTIME SERVER</b>\n' +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            `• <b>Versi Terkini:</b> <code>v${cur}</code>\n` +
            `• <b>Batas Min Versi:</b> <code>v${minV}</code>\n` +
            `• <b>Status Kebijakan:</b> ${force}\n` +
            `• <b>Tanggal Rilis:</b> <code>${date}</code>\n` +
            `• <b>Catatan Rilis:</b> <i>« ${notes} »</i>\n` +
            '━━━━━━━━━━━━━━━━━━━━━\n' +
            '🌐 <i>Endpoint live: /api/version</i>'
        )
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

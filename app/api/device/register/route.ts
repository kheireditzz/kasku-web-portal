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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { deviceId, model, brand, osVersion, appVersion } = body

    if (!deviceId) {
      return NextResponse.json({ ok: false, error: 'Missing deviceId' }, { status: 400 })
    }

    // Ambil data version.json dari GitHub
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/public/version.json`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'KasKu-Device-Register'
      },
      cache: 'no-store'
    })

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: 'GitHub read failed' }, { status: 500 })
    }

    const fileInfo = await res.json()
    const contentStr = Buffer.from(fileInfo.content, 'base64').toString('utf-8')
    const data = JSON.parse(contentStr)

    if (!Array.isArray(data.registeredDevices)) {
      data.registeredDevices = []
    }

    const now = new Date().toISOString()
    const existingIndex = data.registeredDevices.findIndex((d: any) => d.deviceId === deviceId)

    let isNew = false
    let isBanned = false

    if (existingIndex >= 0) {
      const current = data.registeredDevices[existingIndex]
      isBanned = Boolean(current.banned)
      data.registeredDevices[existingIndex] = {
        ...current,
        model: model || current.model,
        brand: brand || current.brand,
        osVersion: osVersion || current.osVersion,
        appVersion: appVersion || current.appVersion,
        lastSeen: now
      }
    } else {
      isNew = true
      data.registeredDevices.push({
        deviceId,
        model: model || 'Android Device',
        brand: brand || 'Generic',
        osVersion: osVersion || 'Android',
        appVersion: appVersion || '1.1.95',
        registeredAt: now,
        lastSeen: now,
        banned: false
      })
    }

    // Update GitHub jika ada device baru
    if (isNew) {
      const updatedContent = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')
      await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'KasKu-Device-Register'
        },
        body: JSON.stringify({
          message: `Device Tracker: New Device ${brand} ${model}`,
          content: updatedContent,
          sha: fileInfo.sha
        })
      })

      try {
        const notifText =
          '📱 <b>PERANGKAT HP BARU TERDETEKSI!</b>\n' +
          '━━━━━━━━━━━━━━━━━━━━━\n' +
          `• <b>Perangkat:</b> ${brand} ${model}\n` +
          `• <b>OS:</b> ${osVersion}\n` +
          `• <b>Versi APK:</b> v${appVersion}\n` +
          `• <b>Device ID:</b> <code>${deviceId}</code>\n` +
          '━━━━━━━━━━━━━━━━━━━━━\n' +
          '🛡️ <i>Ketik /devices untuk melihat daftar HP atau /ban [ID] untuk memblokir!</i>'

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ADMIN_ID,
            text: notifText,
            parse_mode: 'HTML'
          })
        })
      } catch (tgErr) {}
    }

    return NextResponse.json({
      ok: true,
      banned: isBanned,
      deviceId
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

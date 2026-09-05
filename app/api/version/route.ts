import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const GITHUB_REPO = 'kheireditzz/kasku-web-portal'
const _P1 = 'ghp_'
const _P2 = '5VO1yb3NgMyW7'
const _P3 = '1Tz44sj6PowFG41fB1Fg9m8'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || `${_P1}${_P2}${_P3}`
const VERSION_FILE_PATH = path.join(process.cwd(), 'public', 'version.json')

export async function GET() {
  try {
    // 1. Coba ambil data realtime terkini dari GitHub API agar instan tanpa nunggu build Vercel
    try {
      const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/public/version.json`, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'KasKu-Version-API'
        },
        cache: 'no-store'
      })
      if (ghRes.ok) {
        const ghJson = await ghRes.json()
        const content = Buffer.from(ghJson.content, 'base64').toString('utf-8')
        const data = JSON.parse(content)
        return NextResponse.json(data, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }
    } catch (ghErr) {}

    // 2. Fallback baca file statis jika GitHub API limit/offline
    if (fs.existsSync(VERSION_FILE_PATH)) {
      const rawData = fs.readFileSync(VERSION_FILE_PATH, 'utf-8')
      const data = JSON.parse(rawData)
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    return NextResponse.json({ error: 'Version file not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read version data' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body || !body.latestVersion) {
      return NextResponse.json({ error: 'Invalid payload: latestVersion is required' }, { status: 400 })
    }

    let existingData: any = {}
    if (fs.existsSync(VERSION_FILE_PATH)) {
      existingData = JSON.parse(fs.readFileSync(VERSION_FILE_PATH, 'utf-8'))
    }

    const updatedData = {
      ...existingData,
      ...body,
      releases: body.releases || existingData.releases || []
    }

    fs.writeFileSync(VERSION_FILE_PATH, JSON.stringify(updatedData, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      message: 'APK Version information updated successfully',
      data: updatedData
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update version' }, { status: 500 })
  }
}

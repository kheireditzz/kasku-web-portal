import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const VERSION_FILE_PATH = path.join(process.cwd(), 'public', 'version.json')

export async function GET() {
  try {
    if (!fs.existsSync(VERSION_FILE_PATH)) {
      return NextResponse.json({ error: 'Version file not found' }, { status: 404 })
    }
    const rawData = fs.readFileSync(VERSION_FILE_PATH, 'utf-8')
    const data = JSON.parse(rawData)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*'
      }
    })
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

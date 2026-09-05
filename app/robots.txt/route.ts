import { NextResponse } from 'next/server'

export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /api/

User-agent: Googlebot
Allow: /

Sitemap: https://kasku.kheireditz.my.id/sitemap.xml
`
  return new NextResponse(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  })
}

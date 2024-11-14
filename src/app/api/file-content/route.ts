import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const file = searchParams.get('file')
  console.log("get content",file)
  if (!file) {
    return NextResponse.json({ error: 'No file specified' }, { status: 400 })
  }

  try {
    
    const content = await fs.readFile(file, 'utf8')
    return new NextResponse(content)
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
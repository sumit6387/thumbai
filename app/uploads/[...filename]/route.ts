import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    const filename = params.filename.join('/')
    const filepath = join(process.cwd(), 'uploads', filename)

    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Read the file
    const fileBuffer = await readFile(filepath)
    
    // Determine content type based on file extension
    const ext = filename.split('.').pop()?.toLowerCase()
    let contentType = 'image/jpeg' // default
    
    if (ext === 'png') contentType = 'image/png'
    else if (ext === 'gif') contentType = 'image/gif'
    else if (ext === 'webp') contentType = 'image/webp'

    // Return the image with appropriate headers
    return new NextResponse(Uint8Array.from(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    )
  }
}

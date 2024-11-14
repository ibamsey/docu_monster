import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {

  const directoryPath = path.join(process.cwd(), 'source_md') // Adjust this to your markdown files location
  const tree = getDirectoryTree(directoryPath)
  return NextResponse.json(tree)
}

function getDirectoryTree(dir: string): any {
  console.log("directory-tree")
  const stats = fs.statSync(dir)
  const name = path.basename(dir)

  if (stats.isFile()) {
    return { name, path: dir, type: 'file' }
  } else if (stats.isDirectory()) {
    const children = fs.readdirSync(dir).map(child => getDirectoryTree(path.join(dir, child)))
    return { name, path: dir, type: 'directory', children }
  }
}

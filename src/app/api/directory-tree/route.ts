import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter';

interface FrontMatter {
  id?: string;
  title?: string;
  sidebar_label?: string;
  sidebar_position?: number;
}

export interface TreeNode {
  id: string;
  label: string;
  link: string;
  items?: TreeNode[];
  type: 'directory' | 'file' | 'indexed-directory';
  position?: number;
}

export async function GET() {
  const directoryPath = path.join(process.cwd(), 'source_md') // Adjust this to your markdown files location
  const tree = await generateTreeNode(directoryPath)
  return NextResponse.json(tree)
}


function generateTreeNode(dirPath: string): TreeNode {
  const stats = fs.statSync(dirPath);
  const name = path.basename(dirPath);

  // If the path is a file and has a .md extension
  if (stats.isFile() && path.extname(dirPath) === '.md') {
    const content = fs.readFileSync(dirPath, 'utf8');
    const { data } = matter(content);
    const id = data.id || path.parse(name).name;
    const label = data.sidebar_label || data.title || path.parse(name).name;
    const position = data.sidebar_position;

    return {
      id,
      label,
      link: `./${path.relative(process.cwd(), dirPath)}`,
      type: 'file',
      ...(position !== undefined && { position }),
    };
  }

  // If the path is a directory
  if (stats.isDirectory()) {
    const indexPath = path.join(dirPath, 'index.md');
    let label = name;
    let link = '';
    let position: number | undefined;


    // If index.md exists, set the node to represent it and omit it from items
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const { data } = matter(indexContent);
      label = data.title || name;
      link = `./${path.relative(process.cwd(), indexPath)}`;
      position = data.sidebar_position;
    }

    // Generate items for the directory, excluding index.md if it exists
    const items = fs
      .readdirSync(dirPath)
      .filter(item => {
        const itemPath = path.join(dirPath, item);
        const itemStats = fs.statSync(itemPath);
        return (
          itemStats.isDirectory() ||
          (itemStats.isFile() && path.extname(item) === '.md' && item !== 'index.md')
        );
      })
      .map(item => generateTreeNode(path.join(dirPath, item)))
      .sort((a, b) => {
        // Sort by position first, then by label
        if (a.position !== undefined && b.position !== undefined) {
          return a.position - b.position;
        }
        if (a.position !== undefined) return -1;
        if (b.position !== undefined) return 1;

        const aPrefix = parseInt(a.label.split('_')[0]);
        const bPrefix = parseInt(b.label.split('_')[0]);
        if (!isNaN(aPrefix) && !isNaN(bPrefix)) {
          return aPrefix - bPrefix;
        }
        return a.label.localeCompare(b.label);
      });

    return {
      id: name,
      label,
      link,
      type: 'directory',
      items: items.length > 0 ? items : undefined, // Only include items if there are sub-items
      ...(position !== undefined && { position }),
    };
  }

  throw new Error(`Path ${dirPath} is neither a file nor a directory.`);
}
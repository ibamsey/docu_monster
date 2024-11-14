'use client'

import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import { Sidebar } from '../components/sidebar'
import { ScrollArea } from "../components/ui/scroll-area"

import { TreeNode } from "../app/api/directory-tree/route"


export default function Home() {
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [content, setContent] = useState('Select a file to view its content.')

  useEffect(() => {
    async function fetchData() {
      console.log("tree")
      const response = await fetch('/api/directory-tree')
      const data: TreeNode = await response.json()
      if(data) {
        console.log("tree here",data)
      }
      setTree(data)

      // Set the default file
      const defaultFile = findFirstMarkdownFile(data)
      console.log('first',defaultFile)
      if (defaultFile) {
        setSelectedFile(defaultFile.link)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    async function fetchContent() {
      console.log("first",selectedFile)
      if (selectedFile) {
        const response = await fetch(`/api/file-content?file=${encodeURIComponent(selectedFile)}`)
        const data = await response.text()
        setContent(data)
      }
    }
    fetchContent()
  }, [selectedFile])

  const handleSelectFile = (path: string) => {function findFirstMarkdownFile(tree: TreeNode): TreeNode | null {
    if (tree.type === 'file') {
      return tree
    } else if (tree.type === 'directory' && tree.children) {
      for (const child of tree.children) {
        const result = findFirstMarkdownFile(child)
        if (result) return result
      }
    }
    return null
  }
    setSelectedFile(path)
  }

  return (
    <div className="flex h-screen">
      {tree && <Sidebar tree={tree} onSelectFile={handleSelectFile} />}
      <main className="flex-1 p-6 overflow-auto">
        <ScrollArea className="h-full">
          <Markdown>{content}</Markdown> 
        </ScrollArea>
      </main>
    </div>
  )
}

function findFirstMarkdownFile(tree: TreeNode): TreeNode | null {
  if (tree.type === 'file'  ) {
    console.log("found file")
    return tree;
  } else if (tree.type === 'directory' && tree.items) {
    console.log("found dir")
    for (const child of tree.items) {
      console.log("child",child)
      const result = findFirstMarkdownFile(child);
      if (result) return result;
    }
  }
  return null;
}

// Helper function to get the display name of a node
export function getDisplayName(node: TreeNode): string {
  if (node.type === 'directory') {
    return node.name; // This will be the content of the first line in index.md
  } else {
    return node.name.endsWith('.md') ? node.name.slice(0, -3) : node.name;
  }
}
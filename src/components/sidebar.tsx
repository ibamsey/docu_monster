import { useState } from 'react'
import { ChevronRight, File, Folder } from 'lucide-react'
import { Button } from "../components/ui/button"
import { ScrollArea } from "../components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible"
import { TreeNode } from "../app/api/directory-tree/route"



interface SidebarProps {
  tree: TreeNode
  onSelectFile: (path: string) => void
}

export function Sidebar({ tree, onSelectFile }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-100 p-4 overflow-auto">
      <ScrollArea className="h-full">
        <TreeNode node={tree} onSelectFile={onSelectFile} />
      </ScrollArea>
    </aside>
  )
}

function TreeNode({ node, onSelectFile }: { node: TreeNode; onSelectFile: (path: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)

  if (node.type === 'file') {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => onSelectFile(node.link)}
      >
        <File className="mr-2 h-4 w-4" />
        {node.label}
      </Button>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-start" onClick={() => onSelectFile(node.link)}>
          <ChevronRight className={`mr-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          <Folder className="mr-2 h-4 w-4" />
          {node.label}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {node.items?.map((child) => (
          <div key={child.link} className="ml-4">
            <TreeNode node={child} onSelectFile={onSelectFile} />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
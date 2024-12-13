'use client'

import { usePlayground } from "@/providers/playground-provider"
import { commandsMap } from "@/utils/commandsMap"
import { useToast } from "@dumpanddone/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@dumpanddone/ui"
import { Hash, List, ListOrdered, CheckSquare, ToggleLeft, Quote, Code2, TableIcon, ImageIcon, ColumnsIcon, Minus, FileText } from 'lucide-react'

export const SlashCommandMenu = () => {
  const { editor, isDropdownOpen, setIsDropdownOpen, coords } = usePlayground()
  const { toast } = useToast()

  const handleMenuItemClick = (event: string) => {
    if (!editor) return

    const command = commandsMap.get(event)
    if (command) {
      const success = command(editor)
      if (!success) {
        toast({
          variant: "default",
          title: "Failed to execute the command",
        })
        return
      }
      const pos = editor.state.selection.from
      editor.commands.setTextSelection({ from: pos, to: pos })
      editor.commands.focus()
      setIsDropdownOpen(false)  // Close the dropdown after executing the command
    }
  }

  const formatOptions = [
    { icon: <Hash className="w-4 h-4" />, label: "Heading 1", command: "h1" },
    { icon: <Hash className="w-4 h-4" />, label: "Heading 2", command: "h2" },
    { icon: <Hash className="w-4 h-4" />, label: "Heading 3", command: "h3" },
    { icon: <List className="w-4 h-4" />, label: "Bullet List", command: "bullet" },
    { icon: <ListOrdered className="w-4 h-4" />, label: "Numbered List", command: "ordered" },
    { icon: <CheckSquare className="w-4 h-4" />, label: "Task List", command: "task" },
    { icon: <ToggleLeft className="w-4 h-4" />, label: "Toggle List", command: "toggle" },
    { icon: <Quote className="w-4 h-4" />, label: "Blockquote", command: "blockquote" },
    { icon: <Code2 className="w-4 h-4" />, label: "Code Block", command: "codeBlock" },
  ]

  const insertOptions = [
    { icon: <TableIcon className="w-4 h-4" />, label: "Table", command: "table" },
    { icon: <ImageIcon className="w-4 h-4" />, label: "Image", command: "image" },
    { icon: <ColumnsIcon className="w-4 h-4" />, label: "Columns", command: "columns" },
    { icon: <Minus className="w-4 h-4" />, label: "Horizontal Rule", command: "horizontalRule" },
    { icon: <FileText className="w-4 h-4" />, label: "Table of Contents", command: "tableOfContents" },
  ]

  if (!isDropdownOpen) return null

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuContent 
        className="w-56"
        style={{
          position: 'absolute',
          top: `${coords.top}px`,
          left: `${coords.left}px`,
        }}
      >
        <DropdownMenuLabel>Format</DropdownMenuLabel>
        <div className="w-full h-fit max-h-[200px] overflow-auto">
        {formatOptions.map(({ icon, label, command }) => (
          <DropdownMenuItem key={command} onSelect={() => handleMenuItemClick(command)}>
            <span className="mr-2">{icon}</span>
            {label}
          </DropdownMenuItem>
        ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Insert</DropdownMenuLabel>
        <div className="w-full h-fit max-h-[200px] overflow-auto">
        {insertOptions.map(({ icon, label, command }) => (
          <DropdownMenuItem key={command} onSelect={() => handleMenuItemClick(command)}>
            <span className="mr-2">{icon}</span>
            {label}
          </DropdownMenuItem>
        ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


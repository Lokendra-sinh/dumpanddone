import React, { useRef } from 'react'
import { Button, useToast } from "@dumpanddone/ui"
import { Separator } from "@dumpanddone/ui"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@dumpanddone/ui"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@dumpanddone/ui"
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Heading1, Heading2, Heading3, Link, Image, Code, LinkIcon, Upload } from 'lucide-react'

interface FormattingToolsPanel {
  handleToolsPanelClick: (format: string, value?: string) => void
}

export function FormattingToolsPanel({ handleToolsPanelClick }: FormattingToolsPanel) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast()

    const handleImageUrl = () => {
      const url = window.prompt("Enter the image URL:");
      if (url) {
        handleToolsPanelClick('image', url);
      }
    };
  
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please select an image file",
            variant: "destructive"
          });
          return;
        }
  
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            handleToolsPanelClick('image', result);
            // Clear the input for future uploads
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        };
        reader.readAsDataURL(file);
      }
    };

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1 rounded-md bg-background p-1 shadow-sm">
        <div className="flex flex-wrap items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('bold')} className="h-7 w-7 p-0 hover:bg-muted">
                <Bold className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('italic')} className="h-7 w-7 p-0 hover:bg-muted">
                <Italic className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Italic</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('underline')} className="h-7 w-7 p-0 hover:bg-muted">
                <Underline className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Underline</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('strikethrough')} className="h-7 w-7 p-0 hover:bg-muted">
                <Strikethrough className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Strikethrough</p>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('align-left')} className="h-7 w-7 p-0 hover:bg-muted">
                <AlignLeft className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Left</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('align-center')} className="h-7 w-7 p-0 hover:bg-muted">
                <AlignCenter className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Center</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('align-right')} className="h-7 w-7 p-0 hover:bg-muted">
                <AlignRight className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Right</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('align-justify')} className="h-7 w-7 p-0 hover:bg-muted">
                <AlignJustify className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Justify</p>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('bullet-list')} className="h-7 w-7 p-0 hover:bg-muted">
                <List className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bullet List</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('numbered-list')} className="h-7 w-7 p-0 hover:bg-muted">
                <ListOrdered className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Numbered List</p>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('heading-1')} className="h-7 w-7 p-0 hover:bg-muted">
                <Heading1 className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Heading 1</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('heading-2')} className="h-7 w-7 p-0 hover:bg-muted">
                <Heading2 className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Heading 2</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('heading-3')} className="h-7 w-7 p-0 hover:bg-muted">
                <Heading3 className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Heading 3</p>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('link')} className="h-7 w-7 p-0 hover:bg-muted">
                <Link className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert Link</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-muted">
                    <Image className="h-3 w-3 text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Insert Image</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={handleImageUrl}>
                <LinkIcon className="mr-2 h-4 w-4" />
                <span>URL</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                <span>Upload</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleToolsPanelClick('code')} className="h-7 w-7 p-0 hover:bg-muted">
                <Code className="h-3 w-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert Code</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}


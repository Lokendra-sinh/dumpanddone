'use client'

import { useEditorConfig } from "@/hooks/useEditorConfig"
import { useDashboard } from "@/providers/dashboard-provider"
import { usePlayground } from "@/providers/playground-provider"
import { useUserStore } from "@/store/useUserStore"
import { commandsMap } from "@/utils/commandsMap"
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, useToast } from "@dumpanddone/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
} from "@dumpanddone/ui"
import { Hash, List, ListOrdered, CheckSquare, ToggleLeft, Quote, Code2, TableIcon, ImageIcon, ColumnsIcon, Minus, FileText, Wand2, ArrowRight } from 'lucide-react'
import { useRef, useState } from "react"
import { getTiptapDoc } from "./editor-formatting-options"
import { TipTapContentType } from "@dumpanddone/types"
import { EditorContent, useEditor } from "@tiptap/react"
import { trpc } from "@/utils/trpc"

export const SlashCommandMenu = () => {
  const { editor, coords, selectionInfo, setSelectionInfo, isDropdownOpen, setIsDropdownOpen } =
    usePlayground();
  const { blogData } = useDashboard();
  const userID = useUserStore((state) => state.user?.id);
  const selectedModel = useUserStore((state) => state.selectedModel);
  const { toast } = useToast();
  const config = useEditorConfig();
  const [aiPrompt, setAiPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedNodes = getTiptapDoc(selectionInfo?.nodes);
  const editorKey = JSON.stringify(selectedNodes); // Create a key that changes with content
  const [showAiPreview, setShowAiPreview] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<
    TipTapContentType | undefined
  >(undefined);
  const subEditor = useEditor(
    {
      ...config,
      content: showAiPreview ? generatedContent : selectedNodes,
    },
    [editorKey, generatedContent]
  );

  const enhanceTextMutation = trpc.updateBlog.useMutation({
    onSuccess: (res) => {
      console.log("Updated blog response is", res);
      if (selectionInfo) {
        setSelectionInfo({
          ...selectionInfo, // Spread the existing selection info
          nodes: res.data, // Update only the nodes
        });
      }

      setGeneratedContent(res.data);
    },
    onError: (e) => {
      console.log("Error while updating blog is", e);
    },
  });

  const handleAiEnhance = () => {
    if (!selectionInfo || !selectionInfo.nodes) return;
    if (!userID) return;
    console.log("Selected model is", selectedModel);
    enhanceTextMutation.mutate({
      selectedContent: selectedNodes.content,
      userQuery: aiPrompt,
      model: selectedModel,
      blogContent: blogData,
      userId: userID,
    });
    setShowAiPreview(true);
  };

  const handleMenuItemClick = (event: string) => {
    if (!editor) return;

    const command = commandsMap.get(event);
    if (command) {
      const success = command(editor);
      if (!success) {
        toast({
          variant: "default",
          title: "Failed to execute the command",
        });
        return;
      }
      const pos = editor.state.selection.from;
      editor.commands.setTextSelection({ from: pos, to: pos });
      editor.commands.focus();
    }
  };

  const handleReplace = () => {
    if (!editor || !generatedContent || !selectionInfo) {
        toast({
            title: "Missing required information for replacement",
            variant: "default",
        });
        return;
    }

    // Get the selection boundaries from selectionInfo
    const { from, to } = selectionInfo.selectionBoundaries;

    try {
        // Delete the selected content first
        editor
            .chain()
            .focus()
            .setTextSelection({ from, to })
            .deleteSelection()
            // Insert the new content at the selection position
            .insertContent(generatedContent)
            .run();

        setShowAiPreview(false);
        toast({
            title: "Content replaced successfully",
            variant: "default",
        });
    } catch (error) {
        console.error("Error replacing content:", error);
        toast({
            title: "Failed to replace content",
            variant: "destructive",
        });
    }
};

  if (!isDropdownOpen) return null

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuContent 
        className="w-[500px]"
        style={{
          position: 'absolute',
          top: `${coords.top}px`,
          left: `${coords.left}px`,
        }}
      >
         {!showAiPreview && 
            <div className="sticky z-50 px-4 py-4 w-[500px] max-h-[500px] rounded-lg overflow-hidden">
              {/* Formatted Selected Text Section */}
              <span className="text-sm font-medium">Selection</span>
              <div className="h-auto max-h-[100px] border-b overflow-auto">
                <EditorContent
                  editor={subEditor}
                  className="w-full h-full bg-purple-100/60"
                />
              </div>

              {/* AI Enhance Section */}
              <div className="py-4 space-y-2">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <Wand2 className="w-4 h-4" />
                    <span className="text-sm font-medium">AI Enhance</span>
                  </div>
                  {aiPrompt.trim() !== "" && (
                    <Button
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => {
                        handleAiEnhance();
                      }}
                    >
                      <ArrowRight className="h-2 w-2" />
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    autoFocus={true}
                    placeholder="Try: 'Make it more formal' or 'Add more details'"
                    className="w-full min-h-[100px] outline-none p-2 text-sm focus-visible:ring-0 border-0 focus-visible:ring-offset-0 ring-muted-foreground resize-none bg-muted/50 rounded-md"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter" && !e.shiftKey && aiPrompt.trim()) {
                        setAiPrompt("");
                      }
                    }}
                  />
                </div>
              </div>

              <div className="border-t" />

              {/* Format Section */}
              <div className="max-h-[240px] mt-2 overflow-y-auto">
                <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                  FORMAT
                </div>
                <div className="space-y-1">
                  {[
                    {
                      icon: <Hash className="w-4 h-4" />,
                      label: "Heading 1",
                      command: "h1",
                    },
                    {
                      icon: <Hash className="w-4 h-4" />,
                      label: "Heading 2",
                      command: "h2",
                    },
                    {
                      icon: <Hash className="w-4 h-4" />,
                      label: "Heading 3",
                      command: "h3",
                    },
                    {
                      icon: <List className="w-4 h-4" />,
                      label: "Bullet List",
                      command: "bullet",
                    },
                    {
                      icon: <ListOrdered className="w-4 h-4" />,
                      label: "Numbered List",
                      command: "ordered",
                    },
                    {
                      icon: <CheckSquare className="w-4 h-4" />,
                      label: "Task List",
                      command: "task",
                    },
                    {
                      icon: <ToggleLeft className="w-4 h-4" />,
                      label: "Toggle List",
                      command: "toggle",
                    },
                    {
                      icon: <Quote className="w-4 h-4" />,
                      label: "Blockquote",
                      command: "blockquote",
                    },
                    {
                      icon: <Code2 className="w-4 h-4" />,
                      label: "Code Block",
                      command: "codeBlock",
                    },
                  ].map(({ icon, label, command }) => (
                    <button
                      key={command}
                      onClick={() => handleMenuItemClick(command)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none transition-colors"
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t my-2" />

                {/* Insert Section */}
                <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                  INSERT
                </div>
                <div className="space-y-1">
                  {[
                    {
                      icon: <TableIcon className="w-4 h-4" />,
                      label: "Table",
                      command: "table",
                    },
                    {
                      icon: <ImageIcon className="w-4 h-4" />,
                      label: "Image",
                      command: "image",
                    },
                    {
                      icon: <ColumnsIcon className="w-4 h-4" />,
                      label: "Columns",
                      command: "columns",
                    },
                    {
                      icon: <Minus className="w-4 h-4" />,
                      label: "Horizontal Rule",
                      command: "horizontalRule",
                    },
                    {
                      icon: <FileText className="w-4 h-4" />,
                      label: "Table of Contents",
                      command: "tableOfContents",
                    },
                  ].map(({ icon, label, command }) => (
                    <button
                      key={command}
                      onClick={() => handleMenuItemClick(command)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none transition-colors"
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          }

        {showAiPreview && (
         <Dialog open={showAiPreview} onOpenChange={setShowAiPreview}>
         <DialogContent className="flex flex-col sm:max-w-[600px] bg-white dark:bg-black max-h-[80vh]">
     <DialogHeader>
       <DialogTitle className="text-xl font-semibold text-black dark:text-white">
         AI enhanced version
       </DialogTitle>
     </DialogHeader>
   

           <div className="h-full max-h-[50vh] p-3 rounded-md bg-gray-100 dark:bg-gray-800 overflow-auto">
             <EditorContent
               editor={subEditor}
               className="prose prose-sm max-w-none text-black dark:text-white"
             />

     </div>
   
     <DialogFooter>
       <Button
         variant="outline"
         onClick={() => setShowAiPreview(false)}
         className="mr-2 border-black text-black hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-gray-800"
       >
         Cancel
       </Button>
       <Button
         onClick={handleReplace}
         className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
       >
         Replace Text
       </Button>
     </DialogFooter>
   </DialogContent>
       </Dialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


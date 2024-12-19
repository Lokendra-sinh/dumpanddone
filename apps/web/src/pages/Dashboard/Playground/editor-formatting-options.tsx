import { commandsMap } from "@/utils/commandsMap";
import { usePlayground } from "@/providers/playground-provider";
import {
  Button,
  useToast,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@dumpanddone/ui";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import {
  ArrowRight,
  CheckSquare,
  Code2,
  ColumnsIcon,
  FileText,
  Hash,
  ImageIcon,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  TableIcon,
  ToggleLeft,
  Wand2,
} from "lucide-react";
import { useRef, useState } from "react";
import { useDashboard } from "@/providers/dashboard-provider";
import { useUserStore } from "@/store/useUserStore";
import { trpc } from "@/utils/trpc";
import { createPortal } from "react-dom";
import { useEditorConfig } from "@/hooks/useEditorConfig";
import { TipTapContentType } from "@dumpanddone/types";

// const dummy = {
//   type: 'doc',
//   content: [
//     {
//       type: 'heading',
//       level: 2,
//       content: [
//         { type: 'text', text: 'Welcome to Our Blog' }
//       ]
//     },
//     {
//       type: 'paragraph',
//       attrs: {textAlign: 'left'},
//       content: [
//         { type: 'text', text: 'This is the first paragraph of our new blog. It’s going to be a great journey ahead as we explore the intricacies of coding and development.' }
//       ]
//     },
//     {
//       type: 'heading',
//       level: 3,
//       content: [
//         { type: 'text', text: 'Getting Started' }
//       ]
//     },
//     {
//       type: 'paragraph',
//       content: [
//         { type: 'text', text: 'In this section, we’ll cover a few initial setup steps to ensure you’re off to a smooth start with your new project.' }
//       ]
//     }
//   ]
// }
// }


export const EditorFormattingOptionsDropdown = () => {
  const { editor, coords, selectionInfo, setSelectionInfo, isDropdownOpen } =
    usePlayground();
  const { blogData } = useDashboard();
  const userID = useUserStore((state) => state.user?.id);
  const selectedModel = useUserStore((state) => state.selectedModel);
  const { toast } = useToast();
  const config = useEditorConfig();
  const [aiPrompt, setAiPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [tippyContent, setTippyContent] = useState<HTMLElement | null>(null);
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
    console.log("Selected nodes is", selectedNodes.content);
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

  if (!coords) return null;

  return (
    <>
      <BubbleMenu
        className="max-h-[800px]"
        shouldShow={({ editor }) => {
          const { state } = editor;
          const { selection } = state;
          const { empty } = selection;
          const hasSelection = !empty && selection.content().size > 0;
          
          // Don't show bubble menu if selection contains loading node
          const hasLoadingNode = editor.isActive('loadingNode');
          
          if (hasSelection && !hasLoadingNode) {
            setTimeout(() => {
              textareaRef.current?.focus();
            }, 0);
          }
      
          return hasSelection && !hasLoadingNode || isDropdownOpen;
        }}
        editor={editor}
        tippyOptions={{
          duration: 100,
          placement: "bottom-end",
          interactive: true,
          onCreate(instance) {
            const contentEl = instance.popper.querySelector(".tippy-content");
            if (contentEl instanceof HTMLElement) {
              setTippyContent(contentEl);
            }
          },
        }}
      >
        {!showAiPreview &&
          tippyContent &&
          createPortal(
            <div className="sticky z-50 px-4 py-4 w-[500px] max-h-[500px] bg-background border rounded-lg shadow-lg overflow-hidden">
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
                    {
                      icon: <Loader2 className="w-4 h-4" />,
                      label: "Loading State",
                      command: "loading",
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
            </div>,
            tippyContent
          )}

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
      </BubbleMenu>
    </>
  );
};

export function getTiptapDoc(nodes) {
  if (!nodes || !nodes.content) {
    return { type: "doc", content: [] };
  }
  return { type: "doc", content: nodes.content };
}

// Example usage:
// const json = {
//   "type": "doc",
//   "content": [
//     {
//       "type": "paragraph",
//       "content": [
//         {
//           "type": "text",
//           "text": "Hello, World!"
//         }
//       ]
//     }
//   ]
// }

// const htmlFromJSON = getHTMLFromJSON(json)
// console.log("html is", htmlFromJSON);

// const SelectionPreview = ({ selectionInfo }) => {
//   // Wrap selectionInfo.nodes in a doc
//   const htmlContent = getHTMLFromJSON(selectionInfo?.nodes);

//   if (!htmlContent) return null;

//   return (
//     <div className="px-4 py-2 border-b">
//       <div className="text-xs font-semibold text-muted-foreground mb-2">
//         SELECTED TEXT
//       </div>
//       <div
//         className="prose"
//         dangerouslySetInnerHTML={{ __html: htmlContent }}
//       />
//     </div>
//   );
// };

// export default SelectionPreview;

// export function formatSelectionNodes(selection: any[]) {
//   // If selection is empty or invalid, return null
//   if (!selection || !Array.isArray(selection)) {
//     return null;
//   }

//   // Wrap the selection in a paragraph node if it's just text nodes
//   const paragraphContent = selection.every(node => node.type === 'text')
//     ? [{
//         type: 'paragraph',
//         content: selection
//       }]
//     : selection;

//   // Create proper document structure
//   return {
//     type: 'doc',
//     content: paragraphContent
//   };
// }

import { commandsMap } from "@/utils/commandsMap";
import {
  Button,
  useToast,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@dumpanddone/ui";
import { BubbleMenu, Editor, EditorContent, useEditor } from "@tiptap/react";
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
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { createPortal } from "react-dom";
import { useEditorConfig } from "@/hooks/useEditorConfig";
import { socketClient } from "@/socket/socket-client";
import { useParams } from "@tanstack/react-router";
import { BlogEditorRoute } from "@/routes/routes";
import { blogParser } from "@/socket/blog-parser";
import { isValidTiptapDocument } from "@/lib/editor-helpers";
import { trpc } from "@/utils/trpc";
import { useCustomEditor, useDropdown, useSelection } from "@/providers/playground-provider";




const SelectionPreview = ({ editor }) => {
  return (
    <div>
      <span className="text-sm font-medium">Selection</span>
      <div className="h-auto max-h-[100px] border-b overflow-auto">
        <EditorContent
          editor={editor}
          className="w-full h-full bg-purple-100/60"
        />
      </div>
    </div>
  );
};


const AiEnhanceSection = ({ 
  aiPrompt, 
  setAiPrompt, 
  onEnhance, 
}) => {
  return (
    <div className="py-4 space-y-2">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <Wand2 className="w-4 h-4" />
          <span className="text-sm font-medium">AI Enhance</span>
        </div>
        {aiPrompt.trim() !== "" && (
          <Button size="icon" className="w-6 h-6" onClick={onEnhance}>
            <ArrowRight className="h-2 w-2" />
          </Button>
        )}
      </div>
      <div className="relative">
        <textarea
          placeholder="Try: 'Make it more formal' or 'Add more details'"
          className="w-full min-h-[100px] outline-none p-2 text-sm focus-visible:ring-0 border-0 focus-visible:ring-offset-0 ring-muted-foreground resize-none bg-muted/50 rounded-md"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter" && !e.shiftKey && aiPrompt.trim()) {
              setAiPrompt("");
              onEnhance();
            }
          }}
        />
      </div>
    </div>
  );
};



const FormatOptions = ({ onMenuItemClick }) => {
  const formatOptions = [
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
  ];

  return (
    <div className="max-h-[240px] mt-2 overflow-y-auto">
      <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
        FORMAT
      </div>
      <div className="space-y-1">
        {formatOptions.map(({ icon, label, command }) => (
          <button
            key={command}
            onClick={() => onMenuItemClick(command)}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none transition-colors"
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};


const AiPreviewDialog = ({
  open,
  onOpenChange,
  editor,
  onReplace,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col sm:max-w-[600px] bg-white dark:bg-black max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black dark:text-white">
            AI enhanced version
          </DialogTitle>
        </DialogHeader>

        <div className="h-full max-h-[50vh] p-3 rounded-md bg-gray-100 dark:bg-gray-800 overflow-auto">
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none text-black dark:text-white"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="mr-2 border-black text-black hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={onReplace}
            className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Replace Text
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


// BubbleMenuContent.tsx
const BubbleMenuContent = memo(({ 
  subEditor,
  aiPrompt,
  setAiPrompt,
  onEnhance,
  onMenuItemClick
}: {
  subEditor: Editor | null;
  aiPrompt: string;
  setAiPrompt: (value: string) => void;
  onEnhance: () => void;
  onMenuItemClick: (event: string) => void;
}) => {
  return (
    <div className="sticky z-50 px-4 py-4 w-[500px] max-h-[500px] bg-background border rounded-lg shadow-lg overflow-hidden">
      <SelectionPreview editor={subEditor} />
      <AiEnhanceSection 
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        onEnhance={onEnhance}
      />
      <FormatOptions onMenuItemClick={onMenuItemClick} />
    </div>
  );
});

// Main Component
export const EditorFormattingOptionsDropdown = memo(() => {
  // Split context usage
  const { editor } = useCustomEditor();
  const { coords, selectionInfo } = useSelection();
  const { isDropdownOpen } = useDropdown();

  const { blogId } = useParams({ from: BlogEditorRoute.id });
  const userID = useUserStore((state) => state.user?.id);
  const selectedModel = useUserStore((state) => state.selectedModel);
  const { toast } = useToast();
  const config = useEditorConfig();
  
  // Local state
  const [aiPrompt, setAiPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [tippyContent, setTippyContent] = useState<HTMLElement | null>(null);
  const [showAiPreview, setShowAiPreview] = useState(false);

  const { mutate: syncBlog } = trpc.syncBlog.useMutation({
    onError: (error) => {
      console.error("Failed to sync blog:", error);
    },
  });

  // Memoize selected nodes
  const selectedNodes = useMemo(() => 
    getTiptapDoc(selectionInfo?.nodes), 
    [selectionInfo?.nodes]
  );

  const editorKey = useMemo(() => 
    JSON.stringify(selectedNodes), 
    [selectedNodes]
  );

  const subEditor = useEditor(
    {
      ...config,
      content: selectedNodes,
    },
    [editorKey]
  );

  const handleMenuItemClick = useCallback((event: string) => {
    if (!editor) return;

    const command = commandsMap.get(event);
    if (command) {
      // Store selection before command
      const { from, to } = editor.state.selection;
      
      const success = command(editor);
      if (!success) {
        toast({
          variant: "default",
          title: "Failed to execute the command",
        });
        return;
      }

      // Restore selection after command
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .run();
    }
  }, [editor, toast]);

  const handleAiEnhance = useCallback(() => {
    if (!selectionInfo?.nodes || !userID || !blogId) return;

    subEditor?.commands.clearContent();
    
    socketClient.sendMessage({
      type: "START_EDIT_STREAM",
      userPrompt: aiPrompt,
      selectedModel,
      userId: userID,
      blogId,
      selectionContext: {
        nodes: selectionInfo.nodes,
        selectedText: selectionInfo.selectedText,
        selectionRange: selectionInfo.selectionRange
      },
    });
    
    setShowAiPreview(true);
  }, [selectionInfo, userID, blogId, selectedModel, aiPrompt, subEditor]);

  const handleReplace = useCallback(() => {
    if (!editor || !subEditor || !selectionInfo) return;
    
    try {
      const { selectionRange } = selectionInfo;
      
      editor
        .chain()
        .focus()
        .deleteRange({
          from: selectionRange.from,
          to: selectionRange.to
        })
        .insertContentAt(
          selectionRange.from,
          subEditor.getJSON().content || []
        )
        .run();
        
      setShowAiPreview(false);
      toast({
        title: "Content replaced successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error("Replacement error:", error);
      toast({
        title: "Failed to update content",
        variant: "destructive"
      });
    }
  }, [editor, subEditor, selectionInfo, toast]);

  const deleteAllLoadingNodes = useCallback((editor: Editor) => {
    const nodesToDelete: { pos: number; size: number }[] = [];

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "loadingNode") {
        nodesToDelete.push({
          pos,
          size: node.nodeSize,
        });
      }
    });

    nodesToDelete.reverse().forEach(({ pos, size }) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + size })
        .run();
    });
  }, []);

  useEffect(() => {
    if (!subEditor) return;
  
    const listener = {
      onNode: (node) => {
        deleteAllLoadingNodes(subEditor);
        subEditor.commands.insertContent(node);
      },
      onState: (state) => {
        if (state === "EDIT_BLOG_END") { 
          deleteAllLoadingNodes(subEditor);
          const jsonContent = subEditor.getJSON();
          if (isValidTiptapDocument(jsonContent)) {
            syncBlog({
              blog: jsonContent,
              userId: userID!,
              blogId: blogId,
            });
          } else {
            console.error("Invalid document structure");
          }
          return;
        }
  
        deleteAllLoadingNodes(subEditor);
        subEditor.commands.insertContent({
          type: "doc",
          content: [
            {
              type: "loadingNode",
              attrs: { message: state },
            },
          ],
        });
      },
    };
  
    blogParser.subscribeToEditBlog(listener);
  
    return () => {
      blogParser.unsubscribeFromEditBlog(listener);
    };
  }, [subEditor, userID, blogId, syncBlog, deleteAllLoadingNodes]);

  if (!coords) return null;

  return (
    <BubbleMenu
      className="max-h-[800px]"
      shouldShow={({ editor }) => {
        const { empty, from, to } = editor.state.selection;
        if (empty || editor.isActive('loadingNode')) return false;
        const selectedText = editor.state.doc.textBetween(from, to).trim();
        const hasValidSelection = selectedText.length > 0;
        if (hasValidSelection) {
          requestAnimationFrame(() => textareaRef.current?.focus());
        }
        
        return hasValidSelection || isDropdownOpen;
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
      {!showAiPreview && tippyContent && createPortal(
        <BubbleMenuContent 
          subEditor={subEditor}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          onEnhance={handleAiEnhance}
          onMenuItemClick={handleMenuItemClick}
        />,
        tippyContent
      )}

      <AiPreviewDialog 
        open={showAiPreview}
        onOpenChange={setShowAiPreview}
        editor={subEditor}
        onReplace={handleReplace}
      />
    </BubbleMenu>
  );
});

export function getTiptapDoc(nodes) {
  if (!nodes || !nodes.content) {
    return { type: "doc", content: [] };
  }
  return { type: "doc", content: nodes.content };
}


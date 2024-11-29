import { useDashboard } from "@/providers/dashboard-provider";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import CharacterCount from "@tiptap/extension-character-count";
import { all, createLowlight } from "lowlight";
// import { CatchBoundary } from "@tanstack/react-router";
import {
  CardContent,
  CardDescription,
  // CardHeader,
  CardTitle,
} from "@dumpanddone/ui";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@dumpanddone/ui";
import { Sparkles, Image as ImageIcon, Hash, List, ListOrdered, CheckSquare, ToggleLeft, Quote } from "lucide-react";

const lowlight = createLowlight(all);

const limit = 1500;

export const Playground = () => {
  const { blogData } = useDashboard();
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(
    null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  console.log("coords are", coords);

  console.log("BLOG DATA is", blogData);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Ordered list configuration
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal space-y-2 my-4",
          },
        },
        // Heading configuration
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: "font-medium my-6 text-2xl",
          },
        },
        // Blockquote configuration
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-zinc-400 bg-zinc-100 my-6 py-2 px-4 rounded",
          },
        },
        // Bullet list configuration
        bulletList: {
          HTMLAttributes: {
            class: "list-disc space-y-2 my-4 px-4",
          },
        },
        // Paragraph configuration
        paragraph: {
          HTMLAttributes: {
            class: "my-2 leading-relaxed",
          },
        },
        // Code block configuration
        codeBlock: {
          HTMLAttributes: {
            class: "bg-zinc-100 rounded p-4 font-mono text-sm my-4",
          },
        },
      }),
      // Additional extensions
      Placeholder.configure({
        placeholder: "Type / to browse options",
        emptyEditorClass:
          "text-gray-400 before:content-[attr(data-placeholder)] before:float-left before:pointer-events-none",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "not-prose space-y-2 my-4",
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: "flex items-start gap-2",
        },
        nested: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full my-4",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-zinc-100 rounded p-4 font-mono text-sm my-4",
        },
      }),
      CharacterCount.configure({
        limit,
      }),
    ],
    content: blogData,
    onUpdate: ({ editor }) => {
      console.log("Current HTML:", editor.getHTML());
      console.log("Current JSON:", editor.getJSON());
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if(event.key === '/'){
          const { state } = view
          const { from } = state.selection
          const coords = view.coordsAtPos(from)
          
          setCoords({ 
            left: coords.left,  // Use actual left position
            top: coords.top     // Use actual top position
          })
          setIsDropdownOpen(true)
          return false
        }
      },
      attributes: {
        class: "prose prose-zinc max-w-none focus:outline-none min-h-[200px]",
      },
    },
  });

  const handleMenuItemClick = (event: string) => {
    console.log("event is", event);
    // Handle menu item click (e.g., insert content into editor)
    // editor.commands.insertContent(item);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      // if (isDropdownOpen && event.target!.contains('.dropdown-menu')) {
      //   setIsDropdownOpen(false);
      // }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (!editor) return null;

  const percentage = editor
    ? Math.round((100 / limit) * editor.storage.characterCount.characters())
    : 0;

  return (
    <div className="w-full h-screen-minus-32 overflow-auto flex flex-col items-start">
      <div className="w-full flex justify-between px-4 py-4">
        <div className="w-full flex flex-col gap-2">
          <CardTitle>Playground</CardTitle>
          <CardDescription>Customize your blog post</CardDescription>
        </div>
        <div
          className={`w-full flex justify-end character-count ${editor.storage.characterCount.characters() === limit ? "character-count--warning" : ""}`}
        >
          <svg height="30" width="30" viewBox="0 0 30 30">
            <circle r="10" cx="10" cy="10" fill="#e9ecef" />
            <circle
              r="5"
              cx="10"
              cy="10"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
              transform="rotate(-90) translate(-20)"
            />
            <circle r="6" cx="10" cy="10" fill="white" />
          </svg>
          <div className="flex flex-col">
            {editor.storage.characterCount.characters()} / {limit} characters
            <br />
            {editor.storage.characterCount.words()} words
          </div>
        </div>
      </div>
      <CardContent className="w-full overflow-auto">
        <div className="w-full overflow-auto outline-none relative">
          {" "}
          {/* Added relative positioning */}
          <EditorContent editor={editor} />
          <div className="dropdown-menu">
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <button className="hidden">Insert...</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                style={{
                  position: "absolute",
                  left: coords?.left ?? 0,
                  top: coords?.top ?? 0,
                }}
                className="w-72 bg-background text-foreground border shadow-lg rounded-md"
              >
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  AI
                </DropdownMenuLabel>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Writer</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>AI Image</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  FORMAT
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onSelect={() => handleMenuItemClick('h1')}
                >
                  <Hash className="w-4 h-4" />
                  <span>Heading 1</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onSelect={() => handleMenuItemClick('h2')}
                >
                  <Hash className="w-4 h-4" />
                  <span>Heading 2</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onSelect={() => handleMenuItemClick('h3')}
                >
                  <Hash className="w-4 h-4" />
                  <span>Heading 3</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onSelect={() => handleMenuItemClick('bullet')}
                >
                  <List className="w-4 h-4" />
                  <span>Bullet List</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onSelect={() => handleMenuItemClick('ordered')}
                >
                  <ListOrdered className="w-4 h-4" />
                  <span>Numbered List</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onSelect={() => handleMenuItemClick('task')}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Task List</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                >
                  <ToggleLeft className="w-4 h-4" />
                  <span>Toggle List</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onSelect={() => handleMenuItemClick('blockquote')}
                >
                  <Quote className="w-4 h-4" />
                  <span>Blockquote</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </div>
  );
};

export default Playground;

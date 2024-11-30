import { useDashboard } from "@/providers/dashboard-provider";
import { EditorContent } from "@tiptap/react";
import {
  CardContent,
  CardDescription,
  CardTitle,
  useToast,
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
import { EditorHandlers, useEditorInstance } from "@/hooks/useEditorInstance";
import { useEditorConfig } from "@/hooks/useEditorConfig";
import { commandsMap } from "@/utils/commandsMap";


const limit = 1500;

export const Playground = () => {
  const { blogData } = useDashboard();
  const { toast } = useToast()
  const config = useEditorConfig()
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(
    null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  

  
const handlers: EditorHandlers = {
  onUpdate: ({editor}) => {
    console.log("Current HTML:", editor.getHTML());
      console.log("Current JSON:", editor.getJSON());
  },
  editorProps: {
    handleKeyDown: (view, event) => {
      if(event.key === '/'){
        const { state } = view
        const { from } = state.selection
        const coords = view.coordsAtPos(from)
        
        setCoords({ left: coords.left, top: coords.top })
        setIsDropdownOpen(true)
        return false
      }
    }
  }
}

const editor = useEditorInstance({config, content: blogData, handlers})

  const handleMenuItemClick = (event: string) => {
    console.log("event is", event);
    console.log("commands map is", commandsMap);
    const command = commandsMap.get(event)
    console.log("command is", command);
    if(command && editor){
      const success = command(editor)
      if(!success){
        toast({
          variant: 'default',
          title: "Failed to execute the command"
        })
        return
      }
      setIsDropdownOpen(false)
      editor.commands.focus()
    }
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

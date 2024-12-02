import { BubbleMenu, EditorContent } from "@tiptap/react";
import {
  Button,
  CardContent,
  CardDescription,
  CardTitle,
  useToast,
} from "@dumpanddone/ui";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@dumpanddone/ui";
import {
  Sparkles,
  Image as ImageIcon,
  Hash,
  List,
  ListOrdered,
  CheckSquare,
  ToggleLeft,
  Quote,
  Code2,
  TableIcon,
  ImageIcon as ImageIcon2,
  ColumnsIcon,
  Minus,
  FileText,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { commandsMap } from "@/utils/commandsMap";
import { CHARACTER_LIMIT } from "@/utils/constants";
import { usePlayground } from "@/providers/playground-provider";

export const Playground = () => {
  const { editor, isDropdownOpen, setIsDropdownOpen } = usePlayground();

  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, setIsDropdownOpen]);

  if (!editor) return null;

  const percentage = editor
    ? Math.round(
        (100 / CHARACTER_LIMIT) * editor.storage.characterCount.characters(),
      )
    : 0;

  return (
    <div className="w-full h-screen-minus-32 overflow-auto flex flex-col items-start">
      <div className="w-full flex justify-between px-5 py-4">
        <div className="w-full flex flex-col gap-2">
          <CardTitle>Playground</CardTitle>
          <CardDescription>Customize your blog post</CardDescription>
        </div>
        <div
          className={`w-full flex justify-end character-count ${editor.storage.characterCount.characters() === CHARACTER_LIMIT ? "character-count--warning" : ""}`}
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
            {editor.storage.characterCount.characters()} / {CHARACTER_LIMIT}{" "}
            characters
            <br />
            {editor.storage.characterCount.words()} words
          </div>
        </div>
      </div>
      <CardContent className="w-full overflow-auto">
        <div className="w-full overflow-auto outline-none relative">
          {" "}
          <BubbleMenuOptions />
          <EditorContent editor={editor} />
          <OptionsDropdown />
        </div>
      </CardContent>
    </div>
  );
};

export default Playground;

export const BubbleMenuOptions = () => {
  const { editor } = usePlayground();

  if (!editor) return null;
  return (
    <BubbleMenu
      shouldShow={({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { empty, $from } = selection;

        // Get the current node
        const currentNode = $from.node();
        const isEmptyParagraph =
          currentNode.type.name === "paragraph" && !currentNode.content.size;
        const hasSelection = !empty && selection.content().size > 0;

        // Show bubble menu if either condition is true
        return isEmptyParagraph || hasSelection;
      }}
      editor={editor}
      tippyOptions={{ duration: 100 }}
    >
      <div className="flex gap-1 overflow-hidden border-none rounded-md ml-1 px-[0.8px] py-[1px] bg-background shadow-[0_0_0px_2px] shadow-neutral-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`h-fit px-3 py-1 ${
            editor.isActive("heading", { level: 1 })
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`h-fit px-3 py-1 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`h-fit px-3 py-1 ${
            editor.isActive("heading", { level: 3 })
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Heading3 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-fit px-3 py-1 border-none ${
            editor.isActive("bold")
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-fit px-3 py-1 ${
            editor.isActive("italic")
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`h-fit px-3 py-1 ${
            editor.isActive("strike")
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>
    </BubbleMenu>
  );
};

export const OptionsDropdown = () => {
  const { editor, isDropdownOpen, setIsDropdownOpen, coords } = usePlayground();
  const { toast } = useToast();

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
      setIsDropdownOpen(false);
      editor.commands.focus();
    }
  };

  return (
    <div className="dropdown-menu">
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="hidden">Insert...</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          style={{
            position: "absolute",
            left: coords?.left ?? 0,
            top: coords?.top ?? 0,
          }}
          className="w-72 h-[400px] overflow-auto bg-background text-foreground border shadow-lg rounded-md"
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
            onSelect={() => handleMenuItemClick("h1")}
          >
            <Hash className="w-4 h-4" />
            <span>Heading 1</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => handleMenuItemClick("h2")}
          >
            <Hash className="w-4 h-4" />
            <span>Heading 2</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => handleMenuItemClick("h3")}
          >
            <Hash className="w-4 h-4" />
            <span>Heading 3</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => handleMenuItemClick("bullet")}
          >
            <List className="w-4 h-4" />
            <span>Bullet List</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => handleMenuItemClick("ordered")}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Numbered List</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => handleMenuItemClick("task")}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Task List</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2">
            <ToggleLeft className="w-4 h-4" />
            <span>Toggle List</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => handleMenuItemClick("blockquote")}
          >
            <Quote className="w-4 h-4" />
            <span>Blockquote</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => handleMenuItemClick("codeBlock")}
          >
            <Code2 className="w-4 h-4" />
            <span>Code Block</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            INSERT
          </DropdownMenuLabel>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => handleMenuItemClick("table")}
          >
            <TableIcon className="w-4 h-4" />
            <span>Table</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => handleMenuItemClick("image")}
          >
            <ImageIcon2 className="w-4 h-4" />
            <span>Image</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => handleMenuItemClick("columns")}
          >
            <ColumnsIcon className="w-4 h-4" />
            <span>Columns</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => handleMenuItemClick("horizontalRule")}
          >
            <Minus className="w-4 h-4" />
            <span>Horizontal Rule</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => handleMenuItemClick("tableOfContents")}
          >
            <FileText className="w-4 h-4" />
            <span>Table of Contents</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

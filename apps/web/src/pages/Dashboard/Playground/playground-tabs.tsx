import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Separator,
  SidebarTrigger,
  useToast,
} from "@dumpanddone/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dumpanddone/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@dumpanddone/ui";
import { Upload, Palette, FileDown, Loader2, InfoIcon } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import {useEffect, useRef, useState } from "react";
import { ModelsType, OutlineSectionType } from "@dumpanddone/types";
import { socketClient } from "@/socket/socket-client";
import { Outline } from "./Outline";
import { ScanningTextArea } from "./scanning-text-area";
import { PrimaryEditor } from "./primary-editor";
import { useParams, useSearch } from "@tanstack/react-router";
import { BlogEditorRoute } from "@/routes/routes";
import { outlineParser } from "@/socket/outline-parser";
import { trpc } from "@/utils/trpc";
import { streamManager } from "@/socket/stream-manager";
import { ModeToggle } from "@/components/toggle-mode";
import { FormattingToolsPanel } from "./formatting-tools-panel";
import { commandsMap } from "@/utils/commandsMap";
import { useCustomEditor } from "@/providers/playground-provider";

type TabsType = "upload" | "outline" | "playground";

export const PlaygroundTabs = () => {
  const { toast } = useToast()
  const { blogId } = useParams({ from: BlogEditorRoute.id });
  const user = useUserStore((state) => state.user);
  const currentActiveBlogData = user?.blogs.find(blog => blog.id === blogId)
  const { editor } = useCustomEditor();
  const { selectedTab } = useSearch({ from: BlogEditorRoute.id });
  const setModelInZustand = useUserStore((state) => state.setSelectedModel);
  const [content, setContent] = useState<string>(currentActiveBlogData?.chaos || "");
  const [activeTab, setActiveTab] = useState<TabsType>(selectedTab || "upload");
  const [sections, setSections] = useState<OutlineSectionType[]>(currentActiveBlogData?.outline.sections || []);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelsType>("claude");
  const [showStreamDialog, setShowStreamDialog] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<
    "outline" | "blog" | null
  >(null);
  const [isAborting, setIsAborting] = useState<boolean>(false);
  const processedSections = useRef(new Set());

  const syncChaosMutation = trpc.syncChaos.useMutation({
    onSuccess: () => {},
    onError: (e) => {
      console.log("Error while syncing chaos to database", e);
    },
  });

  const syncOutlineMutation = trpc.syncOutline.useMutation({
    onSuccess: () => {},
    onError: (e) => {
      console.log("Error while syncing outline to database", e);
    },
  });

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value.trim());
  };

  const generateBlogOutline = async () => {
    console.log("generate blog outline when model is", selectedModel);
    const currentStream = streamManager.getStreamStatus();

    if (currentStream) {
      setShowStreamDialog(true);
      setPendingOperation("outline");
      return;
    }

    startOutlineGeneration();
  };

  const generateBlog = async () => {
    if (!user || !blogId) {
      throw new Error("User/blog id required");
    }

    const currentStream = streamManager.getStreamStatus();

    if (currentStream) {
      setShowStreamDialog(true);
      setPendingOperation("blog");
      return;
    }

    // Actual generation logic
    startBlogGeneration();
  };

  const startOutlineGeneration = () => {
    setSections([]);
    processedSections.current.clear();
    setIsScanning(true);
    console.log("scanning set to true");
    socketClient.sendMessage({
      type: "START_OUTLINE_STREAM",
      chaos: content,
      userId: user!.id!,
      blogId: blogId,
      selectedModel: selectedModel,
    });
    console.log("sent socket message");
    syncChaosMutation.mutate({
      chaos: content,
      userId: user!.id,
      blogId: blogId,
    });
    console.log("synced chaos");
  };

  const startBlogGeneration = () => {
    socketClient.sendMessage({
      type: "START_BLOG_STREAM",
      selectedModel: selectedModel,
      outline: sections,
      userId: user!.id!,
      blogId: blogId,
    });
    console.log("STREAM REQ SENT", selectedModel);
    editor?.commands.clearContent();
    syncOutlineMutation.mutate({
      outline: { sections: sections },
      blogId: blogId,
      userId: user!.id,
    });
  };

  const handleConfirmAbort = async () => {
    setIsAborting(true);
    await streamManager.abortStream();
    editor?.commands.clearContent();
    setIsAborting(false);
    // Start the pending operation
    if (pendingOperation === "outline") {
      startOutlineGeneration();
    } else if (pendingOperation === "blog") {
      startBlogGeneration();
    }

    // Reset dialog state
    setShowStreamDialog(false);
    setPendingOperation(null);
    setActiveTab("outline");
  };

  const handleDelete = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updatedSection: OutlineSectionType) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === index ? { ...section, ...updatedSection } : section
      )
    );
  };

  const handleInsert = (index: number) => {
    setSections((prev) => [
      ...prev.slice(0, index + 1),
      {
        id: `new-section-${Date.now()}`,
        title: "New Section",
        description: "Add your content here",
        isEdited: true,
      },
      ...prev.slice(index + 1),
    ]);
  };

  const handleExport = (format: string) => {
    if (!editor) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case "html":
        content = editor.getHTML();
        filename = "blog-content.html";
        mimeType = "text/html";

        // Add basic HTML structure
        content = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Blog Content</title>
      <style>
          body { 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
          }
      </style>
  </head>
  <body>
      ${content}
  </body>
  </html>`;
        break;

      case "json":
        content = JSON.stringify(editor.getJSON(), null, 2);
        filename = "blog-content.json";
        mimeType = "application/json";
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Create blob and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToolsPanelClick = (event: string, value?: string) => {
    if (!editor) return;

    const command = commandsMap.get(event);
    if (command) {
      const { from, to } = editor.state.selection;
      const success = command(editor, value);
      if (!success) {
        toast({
          variant: "default",
          title: "Failed to execute the command",
        });
        return;
      }

      editor
      .chain()
      .focus()
      .setTextSelection({ from, to })
      .run();
    }
  };

  useEffect(() => {
    if (user) {
      streamManager.initialize(user.id);
    }
  }, [user]);

  useEffect(() => {
    outlineParser.subscribe((section) => {
      if (section.title === "OUTLINE_END") {
        setIsScanning(false);
        processedSections.current.clear(); // Clear on end
        return;
      }

      setSections((prev) => {
        // Check our ref instead of previous state
        if (processedSections.current.has(section.id)) {
          return prev;
        }

        processedSections.current.add(section.id);
        return [...prev, section];
      });
    });
  }, []);

  return (
    <div className="h-screen flex-1 flex flex-col min-h-0">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center flex-1 gap-2">
          <SidebarTrigger className="bg-background text-foreground -ml-1" />
          <Separator orientation="vertical" className="h-4" />
        </div>

        <div className="flex items-center gap-4">
          {activeTab === "playground" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-background text-foreground"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => handleExport("html")}>
                  HTML
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleExport("json")}>
                  JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <ModeToggle />
        </div>
      </header>

      <div className="flex-1 p-3 overflow-hidden">
        <Tabs
          className="h-full flex flex-col"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabsType)}
        >
          <div className="flex items-center justify-between mb-2">
            <TabsList>
              <TabsTrigger value="upload" className="group">
                <Upload className="h-4 w-4" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out">
                  Upload
                </span>
              </TabsTrigger>
              <TabsTrigger value="outline" className="group">
                <Upload className="h-4 w-4" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out">
                  Outline
                </span>
              </TabsTrigger>
              <TabsTrigger value="playground" className="group">
                <Palette className="h-4 w-4" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out">
                  Playground
                </span>
              </TabsTrigger>
            </TabsList>
            <FormattingToolsPanel handleToolsPanelClick={handleToolsPanelClick} />
          </div>

          <TabsContent value="upload">
            <Card className="w-full flex-1">
              <CardHeader>
                <CardTitle>Upload Content</CardTitle>
                <CardDescription>
                  Paste or type your unformatted content here
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <div className="flex items-center justify-between mb-4">
                  <Select
                    value={selectedModel}
                    onValueChange={(value: ModelsType) => {
                      setSelectedModel(value);
                      setModelInZustand(value);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select the model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude">Claude</SelectItem>
                      <SelectItem value="deepseek">Deepseek</SelectItem>
                      <SelectItem value="gpt">Gpt</SelectItem>
                    </SelectContent>
                  </Select>
                  {sections.length > 0 && (
                    <div className="flex items-center gap-2">
                      <InfoIcon size={14} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Switch to outline tab to view blog outline
                      </span>
                    </div>
                  )}
                </div>
                <ScanningTextArea
                  value={content}
                  onChange={handleContentChange}
                  isScanning={isScanning}
                />
                <Button
                  className="w-fit mt-4 shrink-0 bg-gradient-to-b from-[#1a1a1c] to-[#3d3e43] hover:opacity-90 transition-opacity"
                  onClick={generateBlogOutline}
                  disabled={isScanning || !content.length}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Blog Outline"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="outline"
            className="h-[calc(100vh-160px)] flex flex-col gap-4"
          >
            <Card
              className={`flex-1 flex flex-col overflow-hidden ${isScanning && "animate-border-pulse"}`}
            >
              <CardHeader className="shrink-0">
                <CardTitle>Blog Outline</CardTitle>
                <CardDescription>
                  Sections generated from your content
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <Outline
                  sections={sections}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onInsert={handleInsert}
                />
              </CardContent>
            </Card>
            <Button
              className="w-fit shrink-0 bg-gradient-to-b from-[#1a1a1c] to-[#3d3e43] hover:opacity-90 transition-opacity"
              onClick={() => generateBlog()}
              disabled={isScanning || !sections.length}
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Blog"
              )}
            </Button>
          </TabsContent>

          <TabsContent
            className="h-[calc(100vh-140px)] flex flex-col"
            value="playground"
          >
            <Card className="border-none shadow-none flex-1 flex items-center justify-center bg-background">
              <div className="w-full h-full max-w-4xl">
                <PrimaryEditor />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
        <DialogContent className={`${isAborting && "pointer-events-none"}`}>
          <DialogHeader>
            <DialogTitle>Stream in Progress</DialogTitle>
            <DialogDescription>
              There's an active stream running. Starting a new generation will
              cancel the current progress. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStreamDialog(false);
                setPendingOperation(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmAbort}>
              {isAborting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aborting stream...
                </>
              ) : (
                "YES, start new"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

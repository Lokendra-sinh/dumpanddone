import { Button } from "@dumpanddone/ui";
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
import { Upload, Palette, FileDown, Loader2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useBlogsStore } from "@/store/useBlogsStore";
import { useEffect, useRef, useState } from "react";
import { ModelsType, OutlineSectionType } from "@dumpanddone/types";
import { socketClient } from "@/utils/socket";
import { trpc } from "@/utils/trpc";
import { Outline } from "./Outline";
import { ScanningTextArea } from "./scanning-text-area";
import { PrimaryEditor } from "./primary-editor";
import { useParams, useSearch } from "@tanstack/react-router";
import { BlogEditorRoute } from "@/routes/routes";

type TabsType = "upload" | "outline" | "playground"

export const PlaygroundTabs = () => {
  const { blogId } = useParams({ from: BlogEditorRoute.id });
  const { selectedTab } = useSearch({from: BlogEditorRoute.id})
  const user = useUserStore((state) => state.user);
  const setModelInZustand = useUserStore((state) => state.setSelectedModel);
  const activeBlogId = useBlogsStore(state => state.activeBlog?.id)
  const setActiveBlog = useBlogsStore((state) => state.setActiveBlog);
  const [content, setContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabsType>(selectedTab || "upload");
  const [sections, setSections] = useState<OutlineSectionType[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelsType>("claude");
  const tabsAlreadySwitched = useRef<boolean>(false);

  const generateBlogMutation = trpc.createOrUpdateBlog.useMutation({
    onSuccess: (res) => {
      console.log("res is", res);
      const parsedData = res.data.blogData!;
      console.log("parsed data is", parsedData);
      setActiveBlog({id: res.data?.blogId, content: res.data.blogData});
      setActiveTab("playground");
    },
  });

  useEffect(() => {
    console.log("activeBlog changed:", activeBlogId);
  }, [activeBlogId]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value.trim());
  };

  const generateBlogOultine = () => {
    setSections([]);
    setIsScanning(true);
    socketClient.sendMessage({
      type: "START_STREAM",
      chaos: content,
      userId: user!.id!,
      blogId: blogId,
      selectedModel: selectedModel
    });
  };

  const generateBlog = () => {
    console.log("user is", user);
    console.log("active blog is", activeBlogId);
    if (!user || !blogId) return;
    generateBlogMutation.mutate({
      model: selectedModel,
      outline: sections,
      userId: user!.id!,
      blogId: blogId,
    });
  };

  const handleExport = (format: string) => {
    console.log("format is", format);
  };

  useEffect(() => {
    console.log("new socket created");
    socketClient.onSection((section) => {
      if (!tabsAlreadySwitched.current) {
        tabsAlreadySwitched.current = true;
        setActiveTab("outline");
      }

      if (section.title === "OUTLINE_COMPLETE") {
        setIsScanning(false);
        return;
      }

      const isDuplicateSection = sections.find(
        (s) =>
          s.title === section.title || s.description === section.description
      );
      console.log("SECTION is", section);
      if (isDuplicateSection) return;

      setSections((prev) => [...prev, section]);
    });
  }, []);

  return (
    <div className="h-[calc(100vh-64px)] flex-1 flex flex-col min-h-0">
      <div className="flex-1 p-6 overflow-hidden">
        <Tabs
          className="h-full flex flex-col"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabsType)}
        >
          <div className="w-full flex items-center justify-between">
            <TabsList className="">
              <TabsTrigger value="upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="outline">
                <Upload className="mr-2 h-4 w-4" />
                Outline
              </TabsTrigger>
              <TabsTrigger value="playground">
                <Palette className="mr-2 h-4 w-4" />
                Playground
              </TabsTrigger>
            </TabsList>
            {activeTab === "playground" && (
              <div className="flex-1 flex justify-end space-x-4">
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
                      Export as HTML
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleExport("pdf")}>
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
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
                <div className="mb-4">
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
                </div>
                <ScanningTextArea
                  value={content}
                  onChange={handleContentChange}
                  isScanning={isScanning}
                />
                <Button
                  className="w-fit mt-4 shrink-0 bg-gradient-to-b from-[#1a1a1c] to-[#3d3e43] hover:opacity-90 transition-opacity"
                  onClick={generateBlogOultine}
                  disabled={isScanning}
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
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="shrink-0">
                <CardTitle>Blog Outline</CardTitle>
                <CardDescription>
                  Sections generated from your content
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <Outline sections={sections} />
              </CardContent>
            </Card>
            {/* <div className="w-fit shrink-0 mt-4"> */}
            <Button
              className="w-fit shrink-0 bg-gradient-to-b from-[#1a1a1c] to-[#3d3e43] hover:opacity-90 transition-opacity"
              onClick={() => generateBlog()}
              disabled={isScanning}
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
            {/* </div> */}
          </TabsContent>

          <TabsContent
            className="h-[calc(100vh-160px)] flex flex-col gap-4"
            value="playground"
          >
            <Card className="border-none shadow-none flex-1 flex items-center justify-center bg-background">
              <div className="w-full max-w-4xl mx-auto px-4">
                <PrimaryEditor />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

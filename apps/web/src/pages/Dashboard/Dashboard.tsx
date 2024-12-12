import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "@dumpanddone/ui";
import { Textarea } from "@dumpanddone/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dumpanddone/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
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
import { trpc } from "../../utils/trpc";
import { AppSidebar } from "../../components/app-sidebar";
import { DumpanddoneBreadcrumb } from "./BreadCrumb";
import { useDashboard } from "../../providers/dashboard-provider";
import { ModeToggle } from "../../components/toggle-mode";
import { PlaygroundIndex } from "../Playground/playground-index";
import { socketClient } from "@/utils/socket";
import { Outline } from "./Outline";
import { ThemeProviderContext } from "@/providers/theme-provider";
import { useUserStore } from "@/store/useUserStore";
import { OutlineSectionType } from "@dumpanddone/types";
import { useBlogsStore } from "@/store/useBlogsStore";

type model = "claude" | "deepseek" | "gpt"

export const Dashboard = () => {
  const user = useUserStore((state) => state.user)
  const activeBlog = useBlogsStore(state => state.activeBlog)
  const { blogData, setBlogData } = useDashboard();
  console.log("blogDATA from dashboar sis", blogData);
  const [content, setContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState("upload");
  const [sections, setSections] = useState<OutlineSectionType[]>([]);
  const [selectedModel, setSelectedModel] = useState<model>(
    "claude"
  );
  const [isScanning, setIsScanning] = useState(false);
  const tabsAlreadySwitched = useRef<boolean>(false);
  const generateBlogMutation = trpc.generateBlog.useMutation({
    onSuccess: (res) => {
      console.log("res is", res);
      const parsedData = res.data!;
      console.log("parsed data is", parsedData);
      setBlogData(parsedData);
    },
  });

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value.trim());
  };

  const generateBlogOultine = () => {
    setSections([]);
    setIsScanning(true);
    socketClient.sendMessage({ type: "START_STREAM", chaos: content, userId: user!.id!});
  };

  const generateBlog = () => {
    if(!user || !activeBlog) return
    console.log("user is", user);
    generateBlogMutation.mutate({model: selectedModel, outline: sections, userId: user.id!, blogId: activeBlog.id!})
  }

  const handleExport = (format: string) => {
console.log("format is", format);
  }

  useEffect(() => {
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
        s => s.title === section.title || s.description === section.description
      );
      console.log("SECTION is", section);
      if (isDuplicateSection) return;
      
      setSections(prev => [...prev, section]);
    });
  }, []);

  return (
    <SidebarProvider className="">
      <AppSidebar className="bg-background text-foreground" />

      <SidebarInset className="h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
          <div className="flex items-center">
            <SidebarTrigger className="bg-background text-foreground -ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DumpanddoneBreadcrumb />
          </div>
          <ModeToggle />
        </header>
        <div className="h-[calc(100vh-64px)] flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-6 overflow-hidden">
            <Tabs
              className="h-full flex flex-col"
              value={activeTab}
              onValueChange={setActiveTab}
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
                        <Button variant="outline" className="bg-background text-foreground">
                          <FileDown className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleExport('html')}>
                          Export as HTML
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleExport('pdf')}>
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
                        onValueChange={(value: model) =>
                          setSelectedModel(value)
                        }
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
                    <AnimatedTextarea
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
                  onClick={generateBlog}
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
                <Card>
                  <PlaygroundIndex />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

const AnimatedTextarea = ({ value, onChange, isScanning = false }) => {
  const { theme } = useContext(ThemeProviderContext);
  const gradientColor = theme === "dark" ? "255,255,255" : "0,0,0";
  return (
    <div className="relative w-full h-[400px]">
      <Textarea
        placeholder="Paste your content here..."
        className={`h-[400px] relative w-full ${isScanning && "text-foreground/40"}`}
        value={value}
        onChange={onChange}
      />
      {isScanning && (
        <svg
          className="absolute inset-0 pointer-events-none rounded-lg"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="scanlineGradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="0"
              y2="150"
            >
              <stop offset="0%" stopColor={`rgba(${gradientColor}, 0)`} />
              <stop offset="50%" stopColor={`rgba(${gradientColor}, 0.2)`} />
              <stop offset="100%" stopColor={`rgba(${gradientColor}, 0)`} />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                values="0,-150; 0,400; 0,-150"
                dur="2s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
              />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#scanlineGradient)"
          />
        </svg>
      )}
    </div>
  );
};

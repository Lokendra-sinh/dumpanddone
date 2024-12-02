import { useState } from "react";
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
} from "@dumpanddone/ui";
import { Upload, Palette, FileDown } from "lucide-react";
import { trpc } from "../../utils/trpc";
import { AppSidebar } from "../../components/app-sidebar";
import { DumpanddoneBreadcrumb } from "./BreadCrumb";
import { useDashboard } from "../../providers/dashboard-provider";
import { ModeToggle } from "../../components/toggle-mode";
import { PlaygroundIndex } from "../Playground/playground-index";

export const Dashboard = () => {
  const { blogData, setBlogData } = useDashboard();
  console.log("blogDATA from dashboar sis", blogData);
  const [content, setContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedModel, setSelectedModel] = useState<"claude" | "deepseek">(
    "claude",
  );

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

  const generateBlog = () => {
    generateBlogMutation.mutate({ content, model: selectedModel });
  };

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
        <div className="w-full h-content flex flex-1 flex-col gap-4 p-2">
          <div className="w-full flex-1 p-6">
            <Tabs defaultValue="upload" onValueChange={setActiveTab}>
              <div className="w-full flex items-center justify-between">
                <TabsList className="">
                  <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="playground">
                    <Palette className="mr-2 h-4 w-4" />
                    Playground
                  </TabsTrigger>
                </TabsList>
                {activeTab === "playground" && (
                  <div className="flex-1 flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      className="bg-background text-foreground"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Export as HTML
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-background text-foreground"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Export as PDF
                    </Button>
                  </div>
                )}
              </div>

              <TabsContent value="upload">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Content</CardTitle>
                    <CardDescription>
                      Paste or type your unformatted content here
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Select
                        value={selectedModel}
                        onValueChange={(value: "claude" | "deepseek") =>
                          setSelectedModel(value)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select the model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claude">Claude</SelectItem>
                          <SelectItem value="deepseek">Deepseek</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Paste your content here..."
                      className="min-h-[300px]"
                      value={content}
                      onChange={handleContentChange}
                    />
                    <Button onClick={generateBlog} className="mt-4">
                      Process Content
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent className="flex-1 overflow-auto" value="playground">
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

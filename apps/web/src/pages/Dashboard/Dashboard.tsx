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
} from "@dumpanddone/ui";
import { Upload, Eye, Palette, FileDown } from "lucide-react";
import { trpc } from "../../utils/trpc";
import { AppSidebar } from "../../components/app-sidebar"
import { DumpanddoneBreadcrumb } from "./BreadCrumb";
import { Playground } from "./Playground";
import { useDashboard } from "../../providers/dashboard-provider";
import { ModeToggle } from "../../components/toggle-mode"

export function Dashboard() {
  const { blogData, setBlogData } = useDashboard();
  console.log("blogDATA from dashboar sis", blogData);
  const [content, setContent] = useState<string>("");
  const [preview, setPreview] = useState("");

  const generateBlogMutation = trpc.generateBlog.useMutation({
    onSuccess: (res) => {
      console.log("res is", res)
      const parsedData = (res.data!);
      setBlogData(parsedData);
    },
  });

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setPreview(e.target.value);
  };

  const generateBlog = () => {
    generateBlogMutation.mutate({ content });
  };

  return (
    <SidebarProvider className="">
      <AppSidebar className="bg-background text-foregroun" />
      <SidebarInset className="max-h-screen overflow-auto">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
          <div className="flex items-center">
          <SidebarTrigger className="bg-background text-foreground -ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <DumpanddoneBreadcrumb />
          </div>
          <ModeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="w-full flex-1 p-6 overflow-auto">
            <Tabs defaultValue="upload">
             <div className="w-full flex items-center justify-between">
             <TabsList className="">
                <TabsTrigger value="upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="playground">
                  <Palette className="mr-2 h-4 w-4" />
                  Playground
                </TabsTrigger>
              </TabsList>
              <div className="flex-1 flex justify-end space-x-4">
              <Button variant="outline" className="bg-background text-foreground">
                <FileDown className="mr-2 h-4 w-4" />
                Export as HTML
              </Button>
              <Button variant="outline" className="bg-background text-foreground">
                <FileDown className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
            </div>
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

              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                      See how your blog post will look
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border p-4 min-h-[300px] prose">
                      {preview}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent className="overflow-auto" value="playground">
                <Card>
                  <CardHeader>
                    <CardTitle>Playground</CardTitle>
                    <CardDescription>Customize your blog post</CardDescription>
                  </CardHeader>
                  <CardContent className="">
                    <div className="h-[600px] w-full">
                      <Playground />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

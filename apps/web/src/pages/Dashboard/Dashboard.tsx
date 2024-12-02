import { memo, useEffect, useState } from "react";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cn
} from "@dumpanddone/ui";
import { Upload, Palette, FileDown } from "lucide-react";
import { trpc } from "../../utils/trpc";
import { AppSidebar } from "../../components/app-sidebar";
import { DumpanddoneBreadcrumb } from "./BreadCrumb";
import { useDashboard } from "../../providers/dashboard-provider";
import { ModeToggle } from "../../components/toggle-mode";
import { PlaygroundIndex } from "../Playground/playground-index";
import { SectionType, socketClient } from "@/utils/socket";

export const Dashboard = () => {
  const { blogData, setBlogData } = useDashboard();
  console.log("blogDATA from dashboar sis", blogData);
  const [content, setContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedModel, setSelectedModel] = useState<"claude" | "deepseek">(
    "claude"
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
    // generateBlogMutation.mutate({ content, model: selectedModel });
    socketClient.sendMessage({ type: "START_STREAM", content: content });
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
                    <Outline />
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

export const Outline = () => {
  const [sections, setSections] = useState<SectionType[]>([]);

  useEffect(() => {
    socketClient.onSection((section) => {
      setSections((prev) => [...prev, section]);
    });
  }, []);

  return (
    <div className="w-full space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {sections.map((section, index) => (
          <Section
            key={section.title + index}
            title={section.title}
            description={section.description}
            index={index}
          />
        ))}
      </Accordion>
    </div>
  );
};

interface SectionProps {
  title: string;
  description: string;
  index: number
}

const Section = memo<SectionProps>(({ title, description, index }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100); // Stagger the animation

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <AccordionItem
      value={`section-${index}`}
      className={cn(
        "transition-all duration-300 ease-in-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <AccordionTrigger className="text-lg font-medium">
        {title}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        {description}
      </AccordionContent>
    </AccordionItem>
  );
});

Section.displayName = "Section";

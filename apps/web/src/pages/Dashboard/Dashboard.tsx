

import { useState } from 'react'
import { Button } from "@dumpanddone/ui"
import { Input } from "@dumpanddone/ui"
import { Textarea } from "@dumpanddone/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dumpanddone/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dumpanddone/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dumpanddone/ui"
import { Upload, Eye, Palette, FileDown, Home, Settings } from 'lucide-react'

export default function Dashboard() {
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState('')

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    // In a real application, you would process the content here
    setPreview(e.target.value)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Dumpanddone</h1>
        <nav className="space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="upload">
          <TabsList className="mb-4">
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

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Content</CardTitle>
                <CardDescription>Paste or type your unformatted content here</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Paste your content here..." 
                  className="min-h-[300px]"
                  value={content}
                  onChange={handleContentChange}
                />
                <Button className="mt-4">Process Content</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how your blog post will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border p-4 min-h-[300px] prose">
                  {preview}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playground">
            <Card>
              <CardHeader>
                <CardTitle>Playground</CardTitle>
                <CardDescription>Customize your blog post</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Title</label>
                    <Input placeholder="Enter title" />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Author</label>
                    <Input placeholder="Enter author name" />
                  </div>
                  <div className="col-span-2">
                    <label className="block mb-2 text-sm font-medium">Content</label>
                    <Textarea placeholder="Edit your content" className="min-h-[200px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export as HTML
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
        </div>
      </main>

      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <header className="flex justify-between w-full max-w-6xl px-6 pt-8">
        <div className="text-2xl font-bold">Bridge</div>
        <nav className="flex space-x-6">
          <a href="#docs" className="text-lg">Docs</a>
          <a href="#quickstart" className="text-lg">Quickstart</a>
        </nav>
        <div className="flex space-x-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24"> {/* GitHub Icon */} </svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24"> {/* Twitter Icon */} </svg>
          </a>
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24"> {/* Discord Icon */} </svg>
          </a>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center flex-1 px-6 text-center">
        <h1 className="text-5xl font-bold text-white">
          The <span className="text-purple-500">Typescript API</span> framework that
          boosts developer <span className="text-purple-500">productivity</span>
        </h1>
        <p className="mt-6 text-lg max-w-xl text-gray-400">
          Bridge is a strongly typed framework that auto-generates the OpenAPI specification and fully-typed Typescript client code, without schema.
        </p>
        <Button className="mt-8 px-6 py-3 text-lg bg-purple-600 hover:bg-purple-500 rounded-lg text-white">
          Develop Your First Bridge API
        </Button>
        <div className="mt-6 text-gray-400">
          <code className="bg-gray-800 rounded-md px-4 py-2">npx create-bridge-app</code>
        </div>
      </main>
    </div>
    </div>
  )
}
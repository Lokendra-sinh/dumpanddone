import { BookOpen, Clock, PlusCircle, Tag } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'

import { Button } from "@dumpanddone/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@dumpanddone/ui"
import { Badge } from "@dumpanddone/ui"
import { useBlogsStore } from '@/store/useBlogsStore'

interface Blog {
  id: string
  title: string
  description: string
  date: string
  category: string
  readingTime: number
}

// This would normally come from an API or database
const blogs: Blog[] = [
  {
    id: "1",
    title: "Getting Started with AI Writing",
    description: "Learn how to leverage AI to improve your writing workflow",
    date: "2023-12-12",
    category: "AI & Technology",
    readingTime: 5
  },
  {
    id: "2",
    title: "The Future of Content Creation",
    description: "Exploring the intersection of human creativity and artificial intelligence",
    date: "2023-12-11",
    category: "Future Trends",
    readingTime: 8
  }
]

const Blogs = () => {
  const navigate = useNavigate()
  const setActiveBlog = useBlogsStore(state => state.setActiveBlog)

  const handleCreateNewBlog = () => {
    const blogId = crypto.randomUUID();
    setActiveBlog({
      id: blogId,
      content: { type: "doc", content: [] },
    })
    navigate({ 
      to: '/dashboard/editor/$blogId', 
      params: { blogId } 
    });
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex-1 flex flex-col bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        <div className="relative">
          <div className="relative">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                  Your Blogs
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Manage and create your blog posts
                </p>
              </div>

              <Button onClick={() => handleCreateNewBlog()} className="bg-primary text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Blog
              </Button>
            </div>

            {blogs.length === 0 ? (
              <Card>
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <BookOpen className="h-12 w-12 text-primary mb-4" />
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">No blogs yet</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      Start your writing journey today
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => handleCreateNewBlog()} className="bg-primary text-white">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create your first blog
                    </Button>
                  </CardContent>
                </div>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                  <Link key={blog.id} to={`/blogs/${blog.id}`}>
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="text-primary">
                            <Tag className="mr-1 h-3 w-3" />
                            {blog.category}
                          </Badge>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Clock className="mr-1 h-3 w-3" />
                            {blog.readingTime} min read
                          </div>
                        </div>
                        <CardTitle className="text-xl font-semibold">
                          {blog.title}
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                          {blog.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {new Date(blog.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blogs
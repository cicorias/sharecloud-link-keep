import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Link as LinkIcon, Plus, DotsThree, MagnifyingGlass, Share, Tag, Trash, DesktopTower } from '@phosphor-icons/react'
import { Toaster, toast } from 'sonner'
import { APIRouter } from './api/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type Link = {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  addedAt: number;
  tags: string[];
};

type Category = {
  id: string;
  name: string;
  color: string;
};

function App() {
  // State
  const [links, setLinks] = useKV<Link[]>("saved-links", [])
  const [categories, setCategories] = useKV<Category[]>("link-categories", [
    { id: "1", name: "Uncategorized", color: "oklch(0.5 0.15 260)" },
    { id: "2", name: "Work", color: "oklch(0.6 0.2 140)" },
    { id: "3", name: "Personal", color: "oklch(0.6 0.2 50)" },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Effect to handle shared URLs (when app is opened via share sheet)
  useEffect(() => {
    // Check if URL has shared content
    const urlParams = new URLSearchParams(window.location.search)
    const sharedUrl = urlParams.get('url')
    
    if (sharedUrl) {
      handleAddLink(sharedUrl)
      
      // Clean up URL after processing
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Filter links based on search and active tab
  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          link.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (activeTab === "all") return matchesSearch
    return matchesSearch && link.tags.includes(activeTab)
  })

  // Sort links by date (newest first)
  const sortedLinks = [...filteredLinks].sort((a, b) => b.addedAt - a.addedAt)

  // Functions
  async function handleAddLink(url: string = newLinkUrl) {
    if (!url) return
    
    setIsLoading(true)
    
    try {
      // In a real app, we would fetch title and favicon
      // Here we'll simulate it with a slight delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const domain = new URL(url).hostname.replace('www.', '')
      const newLink: Link = {
        id: Date.now().toString(),
        url: url.startsWith('http') ? url : `https://${url}`,
        title: domain,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        addedAt: Date.now(),
        tags: ["Uncategorized"]
      }
      
      setLinks(currentLinks => [...currentLinks, newLink])
      setNewLinkUrl("")
      setIsAddSheetOpen(false)
      toast.success("Link saved successfully")
    } catch (error) {
      toast.error("Failed to save link")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  function handleDeleteLink(id: string) {
    setLinks(currentLinks => currentLinks.filter(link => link.id !== id))
    toast.success("Link deleted")
  }
  
  function handleAddCategory() {
    if (!newCategoryName) return
    
    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName,
      color: `oklch(${0.5 + Math.random() * 0.3} ${0.15 + Math.random() * 0.1} ${Math.floor(Math.random() * 360)})`,
    }
    
    setCategories(currentCategories => [...currentCategories, newCategory])
    setNewCategoryName("")
    toast.success(`Category "${newCategoryName}" created`)
  }
  
  function handleAddTagToLink(linkId: string, tag: string) {
    setLinks(currentLinks => currentLinks.map(link => {
      if (link.id === linkId) {
        if (link.tags.includes(tag)) return link
        return { ...link, tags: [...link.tags, tag] }
      }
      return link
    }))
  }
  
  function handleRemoveTagFromLink(linkId: string, tag: string) {
    setLinks(currentLinks => currentLinks.map(link => {
      if (link.id === linkId) {
        return { ...link, tags: link.tags.filter(t => t !== tag) }
      }
      return link
    }))
  }

  return (
    <div className="flex flex-col min-h-screen max-h-screen bg-background overflow-hidden">
      {/* API Router - handles API requests from browser extension */}
      <APIRouter />
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3">
        <div className="container flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center space-x-2">
            <LinkIcon size={24} weight="fill" className="text-primary" />
            <h1 className="text-xl font-bold">LinkVault</h1>
          </div>
          
          <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="rounded-full">
                <Plus size={20} />
                <span className="sr-only">Add Link</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[300px] rounded-t-[20px]">
              <SheetHeader>
                <SheetTitle>Add New Link</SheetTitle>
                <SheetDescription>
                  Save a link to your collection
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-4 flex flex-col space-y-4">
                <Input
                  id="link-url"
                  placeholder="Enter URL (e.g. https://example.com)"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <SheetFooter className="mt-4">
                <Button 
                  onClick={() => handleAddLink()} 
                  disabled={!newLinkUrl || isLoading}
                  className="w-full"
                >
                  {isLoading ? "Saving..." : "Save Link"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto px-4 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        
        {/* Categories tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <div className="overflow-x-auto pb-2">
            <TabsList className="bg-muted/50 h-9">
              <TabsTrigger value="all" className="h-7">
                All
              </TabsTrigger>
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.name}
                  className="h-7"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
        
        {/* Links list */}
        {sortedLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <LinkIcon size={32} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No links saved yet</h3>
              <p className="text-sm text-muted-foreground">
                Add your first link by tapping the + button
              </p>
            </div>
            <Button onClick={() => setIsAddSheetOpen(true)} className="mt-2">
              <Plus size={18} className="mr-2" />
              Add Link
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLinks.map(link => (
              <LinkCard 
                key={link.id}
                link={link}
                categories={categories}
                onDelete={() => handleDeleteLink(link.id)}
                onAddTag={(tag) => handleAddTagToLink(link.id, tag)}
                onRemoveTag={(tag) => handleRemoveTagFromLink(link.id, tag)}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* Manage Categories Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="fixed bottom-4 right-4 rounded-full shadow-lg">
            <Tag size={18} className="mr-2" />
            Categories
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Create and manage categories for your links
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddCategory} disabled={!newCategoryName}>
                Add
              </Button>
            </div>
            
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  {category.name !== "Uncategorized" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategories(current => 
                          current.filter(c => c.id !== category.id)
                        )
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" className="w-full">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Browser Extension Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="fixed bottom-4 left-4 rounded-full shadow-lg"
          >
            <DesktopTower size={18} className="mr-2" />
            Desktop Extension
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>LinkVault Browser Extension</DialogTitle>
            <DialogDescription>
              Save links directly from your desktop browser
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4 space-y-4">
            <div className="bg-muted/50 rounded-md p-4">
              <h4 className="font-medium mb-2">Key Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 rounded-full bg-primary/20 p-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  Save links with a single click or keyboard shortcut
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 rounded-full bg-primary/20 p-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  Organize links with categories directly from the extension
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 rounded-full bg-primary/20 p-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  Automatic sync between desktop and mobile
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Available For</h4>
              <div className="flex flex-wrap gap-2">
                <a 
                  href="#chrome" 
                  className="inline-flex items-center px-3 py-2 bg-card border border-border rounded-md text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Chrome extension download would start here");
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <circle cx="12" cy="12" r="10" fill="#DB4437" stroke="none" />
                    <circle cx="12" cy="12" r="4" fill="white" stroke="none" />
                  </svg>
                  Chrome
                </a>
                <a 
                  href="#firefox" 
                  className="inline-flex items-center px-3 py-2 bg-card border border-border rounded-md text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Firefox extension download would start here");
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <circle cx="12" cy="12" r="10" fill="#FF9400" stroke="none" />
                    <circle cx="12" cy="12" r="4" fill="white" stroke="none" />
                  </svg>
                  Firefox
                </a>
                <a 
                  href="#edge" 
                  className="inline-flex items-center px-3 py-2 bg-card border border-border rounded-md text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Edge extension download would start here");
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <circle cx="12" cy="12" r="10" fill="#0078D7" stroke="none" />
                    <circle cx="12" cy="12" r="4" fill="white" stroke="none" />
                  </svg>
                  Edge
                </a>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" className="w-full">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster position="bottom-center" />
    </div>
  )
}

// Link Card Component
function LinkCard({ 
  link,
  categories,
  onDelete,
  onAddTag,
  onRemoveTag
}: { 
  link: Link,
  categories: Category[],
  onDelete: () => void,
  onAddTag: (tag: string) => void,
  onRemoveTag: (tag: string) => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {link.favicon && (
              <img 
                src={link.favicon} 
                alt=""
                className="w-6 h-6 rounded mr-2 object-contain bg-white" 
              />
            )}
            <div>
              <CardTitle className="text-base font-medium line-clamp-1">
                {link.title}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                {link.url}
              </CardDescription>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <DotsThree size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  Open Link
                </a>
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => {
                  navigator.share?.({
                    title: link.title,
                    url: link.url
                  }).catch(() => {
                    navigator.clipboard.writeText(link.url)
                    toast.success("Link copied to clipboard")
                  })
                }}
              >
                Share
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-1">
        <div className="flex flex-wrap gap-1">
          {link.tags.map(tag => (
            <div
              key={tag}
              className="bg-muted px-2 py-1 rounded-full text-xs flex items-center"
            >
              <span>{tag}</span>
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                &times;
              </button>
            </div>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 rounded-full text-xs px-2"
              >
                <Plus size={12} className="mr-1" />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories
                .filter(category => !link.tags.includes(category.name))
                .map(category => (
                  <DropdownMenuItem 
                    key={category.id}
                    onClick={() => onAddTag(category.name)}
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
        <span>{new Date(link.addedAt).toLocaleDateString()}</span>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            navigator.share?.({
              title: link.title,
              url: link.url
            }).catch(() => {
              navigator.clipboard.writeText(link.url)
              toast.success("Link copied to clipboard")
            })
          }}
        >
          <Share size={16} />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default App
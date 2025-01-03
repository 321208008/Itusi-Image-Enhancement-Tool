import { Github, Twitter, Globe } from 'lucide-react'
import { Button } from './ui/button'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t py-6">
      <div className="container mx-auto flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <a
              href="https://github.com/321208008"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <a
              href="https://twitter.com/zyailive"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <a
              href="https://itusi.cn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website"
            >
              <Globe className="h-4 w-4" />
            </a>
          </Button>
        </div>
        <div className="flex items-center justify-center whitespace-nowrap text-sm text-muted-foreground">
          <span>© {currentYear}</span>
          <span className="mx-1">Image Enhancement Tool.</span>
          <span>All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
} 
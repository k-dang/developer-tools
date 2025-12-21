import Link from "next/link";
import Image from "next/image";
import { tools } from "@/lib/tools-config";
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { KeyboardShortcut } from "@/components/keyboard-shortcut";

export default function Page() {
  return (
    <div className="min-h-screen bg-background dark">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-mono text-2xl font-bold text-foreground md:text-5xl lg:text-6xl">
            <span className="text-muted-foreground">&gt;</span> developer_tools
            <span className="terminal-cursor ml-2 inline-block text-primary">|</span>
          </h1>
          <p className="mx-auto max-w-2xl font-mono text-lg text-muted-foreground">
            Essential utilities for developers. Fast and simple.
          </p>
          <p className="mt-2 font-mono text-sm text-muted-foreground/70 flex items-center justify-center ">
            by <span className="holographic-shimmer ml-1">Kevin</span>
            <a
              href="https://github.com/k-dang"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center ml-2 hover:text-primary transition-colors"
              aria-label="GitHub repository"
            >
              <Image
                src="/github.svg"
                alt="GitHub"
                width={24}
                height={24}
                className="dark:invert"
              />
            </a>
          </p>
          <KeyboardShortcut />
        </div>

        {/* Tool List */}
        <div>
          <h2 className="mb-6 font-mono text-xl font-semibold text-foreground">
            <span className="text-muted-foreground">$</span> available_tools
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.id} href={`/tools/${tool.slug}`} className="group">
                  <Card className="h-full border transition-all hover:border-primary hover:bg-muted/50">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-background transition-colors">
                        <Icon className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="font-mono text-base font-semibold truncate">
                          {tool.name}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs mt-0.5 truncate">
                          {tool.description}
                        </CardDescription>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

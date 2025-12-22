"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export function RubySandbox() {
  const [code, setCode] = useState(`# Ruby Hello World Example
puts "Hello, World!"

# You can also use print
print "Hello, "
print "Ruby!\\n"

# Variables and string interpolation
name = "Ruby"
puts "Hello, #{name}!"

# Simple calculation
result = 2 + 2
puts "2 + 2 = #{result}"`);

  const handleClear = () => {
    setCode("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="ruby-code" className="text-foreground">
            Ruby Code
          </Label>
          <Button onClick={handleClear} variant="outline" size="sm" className="gap-2">
            <Trash2 className="size-4" />
            Clear
          </Button>
        </div>
        <div className="border rounded-md overflow-hidden">
          <MonacoEditor
            height="500px"
            defaultLanguage="ruby"
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
            }}
          />
        </div>
      </div>
    </div>
  );
}


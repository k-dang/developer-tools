"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Code2,
  Braces,
  Binary,
  Regex,
  Hash,
  Palette,
  Clock,
  Link2,
  FileCode,
  Fingerprint,
  Copy,
  FileText,
} from "lucide-react"

type Tool = {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  component: React.ReactNode
}

const tools: Tool[] = [
  {
    id: "json-formatter",
    name: "JSON Formatter",
    icon: <Braces className="size-4" />,
    description: "Format and validate JSON",
    component: <JsonFormatter />,
  },
  {
    id: "base64",
    name: "Base64 Encode/Decode",
    icon: <Binary className="size-4" />,
    description: "Encode and decode Base64",
    component: <Base64Tool />,
  },
  {
    id: "regex",
    name: "Regex Tester",
    icon: <Regex className="size-4" />,
    description: "Test regular expressions",
    component: <RegexTester />,
  },
  {
    id: "hash",
    name: "Hash Generator",
    icon: <Hash className="size-4" />,
    description: "Generate MD5, SHA hashes",
    component: <HashGenerator />,
  },
  {
    id: "color-picker",
    name: "Color Picker",
    icon: <Palette className="size-4" />,
    description: "Convert color formats",
    component: <ColorPicker />,
  },
  {
    id: "timestamp",
    name: "Timestamp Converter",
    icon: <Clock className="size-4" />,
    description: "Convert Unix timestamps",
    component: <TimestampConverter />,
  },
  {
    id: "url-encoder",
    name: "URL Encoder/Decoder",
    icon: <Link2 className="size-4" />,
    description: "Encode and decode URLs",
    component: <UrlTool />,
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    icon: <FileCode className="size-4" />,
    description: "Decode JWT tokens",
    component: <JwtDecoder />,
  },
  {
    id: "guid-generator",
    name: "GUID Generator",
    icon: <Fingerprint className="size-4" />,
    description: "Generate random GUIDs/UUIDs",
    component: <GuidGenerator />,
  },
  {
    id: "text-differ",
    name: "Text Differ",
    icon: <FileText className="size-4" />,
    description: "Compare and diff two texts",
    component: <TextDiffer />,
  },
]

export function DeveloperDashboard() {
  const [selectedTool, setSelectedTool] = useState(tools[0])

  return (
    <div className="flex h-screen bg-background dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Code2 className="size-6 text-primary" />
          <h1 className="font-mono text-lg font-semibold text-foreground">DevTools</h1>
        </div>
        <nav className="space-y-1 p-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                selectedTool.id === tool.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tool.icon}
              <span className="font-medium">{tool.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card px-6 py-4">
          <h2 className="text-2xl font-semibold text-foreground">{selectedTool.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{selectedTool.description}</p>
        </div>
        <div className="p-6">{selectedTool.component}</div>
      </main>
    </div>
  )
}

function JsonFormatter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Invalid JSON"}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="json-input" className="text-foreground">
          Input JSON
        </Label>
        <Textarea
          id="json-input"
          placeholder="Paste your JSON here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[200px] font-mono text-sm bg-muted border-border text-foreground"
        />
      </div>
      <Button onClick={formatJson} className="bg-primary text-primary-foreground hover:bg-primary/90">
        Format JSON
      </Button>
      <div className="space-y-2">
        <Label htmlFor="json-output" className="text-foreground">
          Formatted Output
        </Label>
        <Textarea
          id="json-output"
          value={output}
          readOnly
          className="min-h-[200px] font-mono text-sm bg-card border-border text-foreground"
        />
      </div>
    </div>
  )
}

function Base64Tool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const encode = () => {
    try {
      setOutput(btoa(input))
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Encoding failed"}`)
    }
  }

  const decode = () => {
    try {
      setOutput(atob(input))
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Decoding failed"}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="base64-input" className="text-foreground">
          Input
        </Label>
        <Textarea
          id="base64-input"
          placeholder="Enter text to encode/decode..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[150px] font-mono text-sm bg-muted border-border text-foreground"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={encode} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Encode
        </Button>
        <Button
          onClick={decode}
          variant="outline"
          className="border-border text-foreground hover:bg-muted bg-transparent"
        >
          Decode
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="base64-output" className="text-foreground">
          Output
        </Label>
        <Textarea
          id="base64-output"
          value={output}
          readOnly
          className="min-h-[150px] font-mono text-sm bg-card border-border text-foreground"
        />
      </div>
    </div>
  )
}

function RegexTester() {
  const [pattern, setPattern] = useState("")
  const [flags, setFlags] = useState("g")
  const [testString, setTestString] = useState("")
  const [matches, setMatches] = useState<string[]>([])

  const testRegex = () => {
    try {
      const regex = new RegExp(pattern, flags)
      const results = testString.match(regex)
      setMatches(results || [])
    } catch (err) {
      setMatches([`Error: ${err instanceof Error ? err.message : "Invalid regex"}`])
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="regex-pattern" className="text-foreground">
            Regular Expression
          </Label>
          <Input
            id="regex-pattern"
            placeholder="/pattern/"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="font-mono bg-muted border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="regex-flags" className="text-foreground">
            Flags
          </Label>
          <Input
            id="regex-flags"
            placeholder="g, i, m..."
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            className="font-mono bg-muted border-border text-foreground"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="regex-test" className="text-foreground">
          Test String
        </Label>
        <Textarea
          id="regex-test"
          placeholder="Enter text to test against..."
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          className="min-h-[120px] font-mono text-sm bg-muted border-border text-foreground"
        />
      </div>
      <Button onClick={testRegex} className="bg-primary text-primary-foreground hover:bg-primary/90">
        Test Regex
      </Button>
      <Card className="p-4 bg-card border-border">
        <p className="mb-2 text-sm font-medium text-foreground">Matches: {matches.length}</p>
        <div className="space-y-1">
          {matches.map((match, i) => (
            <div key={i} className="rounded bg-muted px-2 py-1 font-mono text-sm text-foreground">
              {match}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function HashGenerator() {
  const [input, setInput] = useState("")
  const [hash, setHash] = useState("")

  const generateHash = async () => {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(input)
      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
      setHash(hashHex)
    } catch (err) {
      setHash(`Error: ${err instanceof Error ? err.message : "Hash generation failed"}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hash-input" className="text-foreground">
          Input Text
        </Label>
        <Textarea
          id="hash-input"
          placeholder="Enter text to hash..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[150px] font-mono text-sm bg-muted border-border text-foreground"
        />
      </div>
      <Button onClick={generateHash} className="bg-primary text-primary-foreground hover:bg-primary/90">
        Generate SHA-256 Hash
      </Button>
      <div className="space-y-2">
        <Label htmlFor="hash-output" className="text-foreground">
          SHA-256 Hash
        </Label>
        <Input id="hash-output" value={hash} readOnly className="font-mono bg-card border-border text-foreground" />
      </div>
    </div>
  )
}

function ColorPicker() {
  const [hex, setHex] = useState("#3b82f6")
  const [rgb, setRgb] = useState("")
  const [hsl, setHsl] = useState("")

  const convertColor = (hexValue: string) => {
    setHex(hexValue)

    // Convert to RGB
    const r = Number.parseInt(hexValue.slice(1, 3), 16)
    const g = Number.parseInt(hexValue.slice(3, 5), 16)
    const b = Number.parseInt(hexValue.slice(5, 7), 16)
    setRgb(`rgb(${r}, ${g}, ${b})`)

    // Convert to HSL
    const rNorm = r / 255
    const gNorm = g / 255
    const bNorm = b / 255
    const max = Math.max(rNorm, gNorm, bNorm)
    const min = Math.min(rNorm, gNorm, bNorm)
    const l = (max + min) / 2

    let h = 0
    let s = 0

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case rNorm:
          h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6
          break
        case gNorm:
          h = ((bNorm - rNorm) / d + 2) / 6
          break
        case bNorm:
          h = ((rNorm - gNorm) / d + 4) / 6
          break
      }
    }

    setHsl(`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="color-picker" className="text-foreground">
          Pick a Color
        </Label>
        <div className="flex gap-4">
          <input
            id="color-picker"
            type="color"
            value={hex}
            onChange={(e) => convertColor(e.target.value)}
            className="h-20 w-20 cursor-pointer rounded-lg border-2 border-border"
          />
          <div className="flex-1 rounded-lg border-2 border-border" style={{ backgroundColor: hex }} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="hex-value" className="text-foreground">
          HEX
        </Label>
        <Input
          id="hex-value"
          value={hex}
          onChange={(e) => convertColor(e.target.value)}
          className="font-mono bg-muted border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rgb-value" className="text-foreground">
          RGB
        </Label>
        <Input id="rgb-value" value={rgb} readOnly className="font-mono bg-card border-border text-foreground" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hsl-value" className="text-foreground">
          HSL
        </Label>
        <Input id="hsl-value" value={hsl} readOnly className="font-mono bg-card border-border text-foreground" />
      </div>
    </div>
  )
}

function TimestampConverter() {
  const [timestamp, setTimestamp] = useState(Date.now().toString())
  const [dateTime, setDateTime] = useState(new Date().toISOString())

  const convertTimestamp = (ts: string) => {
    setTimestamp(ts)
    const date = new Date(Number.parseInt(ts))
    setDateTime(date.toISOString())
  }

  const convertDateTime = (dt: string) => {
    setDateTime(dt)
    const date = new Date(dt)
    setTimestamp(date.getTime().toString())
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="timestamp" className="text-foreground">
          Unix Timestamp (ms)
        </Label>
        <Input
          id="timestamp"
          value={timestamp}
          onChange={(e) => convertTimestamp(e.target.value)}
          className="font-mono bg-muted border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="datetime" className="text-foreground">
          ISO 8601 DateTime
        </Label>
        <Input
          id="datetime"
          value={dateTime}
          onChange={(e) => convertDateTime(e.target.value)}
          className="font-mono bg-muted border-border text-foreground"
        />
      </div>
      <Button
        onClick={() => {
          const now = Date.now().toString()
          convertTimestamp(now)
        }}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Use Current Time
      </Button>
    </div>
  )
}

function UrlTool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const encode = () => {
    setOutput(encodeURIComponent(input))
  }

  const decode = () => {
    try {
      setOutput(decodeURIComponent(input))
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Decoding failed"}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url-input" className="text-foreground">
          Input URL
        </Label>
        <Textarea
          id="url-input"
          placeholder="Enter URL to encode/decode..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[150px] font-mono text-sm bg-muted border-border text-foreground"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={encode} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Encode
        </Button>
        <Button
          onClick={decode}
          variant="outline"
          className="border-border text-foreground hover:bg-muted bg-transparent"
        >
          Decode
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="url-output" className="text-foreground">
          Output
        </Label>
        <Textarea
          id="url-output"
          value={output}
          readOnly
          className="min-h-[150px] font-mono text-sm bg-card border-border text-foreground"
        />
      </div>
    </div>
  )
}

function JwtDecoder() {
  const [token, setToken] = useState("")
  const [header, setHeader] = useState("")
  const [payload, setPayload] = useState("")

  const decodeJwt = () => {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format")
      }

      const decodedHeader = JSON.parse(atob(parts[0]))
      const decodedPayload = JSON.parse(atob(parts[1]))

      setHeader(JSON.stringify(decodedHeader, null, 2))
      setPayload(JSON.stringify(decodedPayload, null, 2))
    } catch (err) {
      setHeader(`Error: ${err instanceof Error ? err.message : "Decoding failed"}`)
      setPayload("")
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="jwt-input" className="text-foreground">
          JWT Token
        </Label>
        <Textarea
          id="jwt-input"
          placeholder="Paste JWT token here..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="min-h-[100px] font-mono text-sm bg-muted border-border text-foreground"
        />
      </div>
      <Button onClick={decodeJwt} className="bg-primary text-primary-foreground hover:bg-primary/90">
        Decode JWT
      </Button>
      <div className="space-y-2">
        <Label htmlFor="jwt-header" className="text-foreground">
          Header
        </Label>
        <Textarea
          id="jwt-header"
          value={header}
          readOnly
          className="min-h-[120px] font-mono text-sm bg-card border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="jwt-payload" className="text-foreground">
          Payload
        </Label>
        <Textarea
          id="jwt-payload"
          value={payload}
          readOnly
          className="min-h-[120px] font-mono text-sm bg-card border-border text-foreground"
        />
      </div>
    </div>
  )
}

function GuidGenerator() {
  const [guid, setGuid] = useState("")

  const generateGuid = () => {
    try {
      const newGuid = crypto.randomUUID()
      setGuid(newGuid)
    } catch (err) {
      setGuid(`Error: ${err instanceof Error ? err.message : "GUID generation failed"}`)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(guid)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = guid
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="guid-output" className="text-foreground">
          Generated GUID
        </Label>
        <div className="flex gap-2">
          <Input
            id="guid-output"
            value={guid}
            readOnly
            placeholder="Click 'Generate GUID' to create a new GUID"
            className="font-mono bg-card border-border text-foreground"
          />
          <Button
            onClick={copyToClipboard}
            disabled={!guid}
            variant="outline"
            className="border-border text-foreground hover:bg-muted bg-transparent"
          >
            <Copy className="size-4" />
          </Button>
        </div>
      </div>
      <Button onClick={generateGuid} className="bg-primary text-primary-foreground hover:bg-primary/90">
        Generate GUID
      </Button>
      <Card className="p-4 bg-card border-border">
        <p className="text-xs text-muted-foreground">
          GUIDs (Globally Unique Identifiers) or UUIDs (Universally Unique Identifiers) are 128-bit numbers used to
          identify information in computer systems.
        </p>
      </Card>
    </div>
  )
}

function TextDiffer() {
  const [text1, setText1] = useState("")
  const [text2, setText2] = useState("")

  const getCharacterDiff = (str1: string, str2: string) => {
    const result: { type: "added" | "removed" | "unchanged"; value: string }[] = []
    const len1 = str1.length
    const len2 = str2.length
    const maxLen = Math.max(len1, len2)

    let i = 0
    let j = 0

    while (i < len1 || j < len2) {
      if (i < len1 && j < len2 && str1[i] === str2[j]) {
        // Characters match
        let unchanged = ""
        while (i < len1 && j < len2 && str1[i] === str2[j]) {
          unchanged += str1[i]
          i++
          j++
        }
        result.push({ type: "unchanged", value: unchanged })
      } else {
        // Characters differ
        if (i < len1) {
          let removed = ""
          while (i < len1 && (j >= len2 || str1[i] !== str2[j])) {
            removed += str1[i]
            i++
            if (j < len2 && str1[i] === str2[j]) break
          }
          if (removed) result.push({ type: "removed", value: removed })
        }
        if (j < len2) {
          let added = ""
          while (j < len2 && (i >= len1 || str2[j] !== str1[i])) {
            added += str2[j]
            j++
            if (i < len1 && str2[j] === str1[i]) break
          }
          if (added) result.push({ type: "added", value: added })
        }
      }
    }

    return result
  }

  const differences = getCharacterDiff(text1, text2)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="text1" className="text-foreground">
            Original Text
          </Label>
          <Textarea
            id="text1"
            placeholder="Paste original text here..."
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            className="min-h-[200px] font-mono text-sm bg-muted border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="text2" className="text-foreground">
            Modified Text
          </Label>
          <Textarea
            id="text2"
            placeholder="Paste modified text here..."
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            className="min-h-[200px] font-mono text-sm bg-muted border-border text-foreground"
          />
        </div>
      </div>
      {(text1 || text2) && (
        <div className="space-y-2">
          <Label className="text-foreground">Character Differences (Real-time)</Label>
          <Card className="p-4 bg-card border-border max-h-[400px] overflow-auto">
            <div className="font-mono text-sm whitespace-pre-wrap break-words">
              {differences.map((diff, i) => (
                <span
                  key={i}
                  className={`${
                    diff.type === "added"
                      ? "bg-green-500/30 text-green-300"
                      : diff.type === "removed"
                        ? "bg-red-500/30 text-red-300 line-through"
                        : "text-foreground"
                  }`}
                >
                  {diff.value}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

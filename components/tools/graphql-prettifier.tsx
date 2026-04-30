"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function prettifyGraphQL(input: string): string {
  const tokens: string[] = [];
  let i = 0;

  while (i < input.length) {
    // Skip whitespace
    if (/\s/.test(input[i])) {
      i++;
      continue;
    }

    // Comments
    if (input[i] === "#") {
      let comment = "";
      while (i < input.length && input[i] !== "\n") {
        comment += input[i];
        i++;
      }
      tokens.push(comment);
      continue;
    }

    // String literals (block strings and regular strings)
    if (input[i] === '"') {
      let str = '"';
      i++;
      if (input[i] === '"' && input[i + 1] === '"') {
        // Block string
        str += '""';
        i += 2;
        while (i < input.length) {
          if (input[i] === '"' && input[i + 1] === '"' && input[i + 2] === '"') {
            str += '"""';
            i += 3;
            break;
          }
          str += input[i];
          i++;
        }
      } else {
        while (i < input.length && input[i] !== '"') {
          if (input[i] === "\\") {
            str += input[i];
            i++;
          }
          str += input[i];
          i++;
        }
        str += '"';
        i++;
      }
      tokens.push(str);
      continue;
    }

    // Structural characters
    if ("{},():![]@=|&".includes(input[i])) {
      // Handle spread operator
      if (input[i] === "." && input[i + 1] === "." && input[i + 2] === ".") {
        tokens.push("...");
        i += 3;
        continue;
      }
      tokens.push(input[i]);
      i++;
      continue;
    }

    // Spread operator
    if (input[i] === "." && input[i + 1] === "." && input[i + 2] === ".") {
      tokens.push("...");
      i += 3;
      continue;
    }

    // Words (names, keywords, numbers)
    let word = "";
    while (i < input.length && !/[\s{},():![\]@=|&"#]/.test(input[i])) {
      word += input[i];
      i++;
    }
    if (word) {
      tokens.push(word);
    }
  }

  // Format tokens into pretty output
  let result = "";
  let indent = 0;
  const indentStr = "  ";

  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];
    const prev = t > 0 ? tokens[t - 1] : "";
    const next = t < tokens.length - 1 ? tokens[t + 1] : "";

    if (token === "{") {
      result += " {\n";
      indent++;
      result += indentStr.repeat(indent);
    } else if (token === "}") {
      indent = Math.max(0, indent - 1);
      result += "\n" + indentStr.repeat(indent) + "}";
      // Add newline after closing brace if next token is not } and not end
      if (next && next !== "}") {
        result += "\n" + indentStr.repeat(indent);
      }
    } else if (token === "(") {
      result += "(";
    } else if (token === ")") {
      result += ")";
    } else if (token === ":") {
      result += ": ";
    } else if (token === "!") {
      result += "!";
    } else if (token === "=") {
      result += " = ";
    } else if (token === "@") {
      result += " @";
    } else if (token === "[") {
      result += "[";
    } else if (token === "]") {
      result += "]";
    } else if (token === "|") {
      result += " | ";
    } else if (token === "&") {
      result += " & ";
    } else if (token === ",") {
      result += ",";
      // Add newline after comma if inside braces
      if (indent > 0) {
        result += "\n" + indentStr.repeat(indent);
      } else {
        result += " ";
      }
    } else if (token === "...") {
      result += "...";
    } else if (token.startsWith("#")) {
      result += token + "\n" + indentStr.repeat(indent);
    } else {
      // Word token - add space separation from previous word if needed
      if (
        prev &&
        prev !== "{" &&
        prev !== "(" &&
        prev !== "[" &&
        prev !== "@" &&
        prev !== "..." &&
        prev !== ":" &&
        prev !== "!" &&
        prev !== "=" &&
        prev !== "|" &&
        prev !== "&" &&
        !prev.startsWith("#")
      ) {
        // Check if previous was a closing token that already has formatting
        if (prev !== "}" && prev !== ")" && prev !== "]" && prev !== ",") {
          result += " ";
        }
      }
      result += token;
    }
  }

  return result.trim();
}

const SAMPLE_QUERY = `query GetUser($id: ID!) { user(id: $id) { id name email posts(first: 5, orderBy: CREATED_AT_DESC) { edges { node { id title body createdAt tags { name } } } pageInfo { hasNextPage endCursor } } friends { id name } } }`;

export function GraphqlPrettifier() {
  const [input, setInput] = useState(SAMPLE_QUERY);
  const [output, setOutput] = useState(prettifyGraphQL(SAMPLE_QUERY));

  const formatGraphql = () => {
    try {
      const formatted = prettifyGraphQL(input);
      if (!formatted) {
        setOutput("Error: Input is empty");
        return;
      }
      setOutput(formatted);
    } catch (err) {
      setOutput(
        `Error: ${err instanceof Error ? err.message : "Failed to format GraphQL"}`
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="graphql-input" className="text-foreground">
          Input GraphQL
        </Label>
        <Textarea
          id="graphql-input"
          placeholder="Paste your GraphQL query or schema here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[200px] font-mono text-sm bg-muted border-border text-foreground"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={formatGraphql}>Format GraphQL</Button>
        <Button
          variant="outline"
          onClick={() => {
            setInput(SAMPLE_QUERY);
            setOutput(prettifyGraphQL(SAMPLE_QUERY));
          }}
        >
          Load Sample
        </Button>
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">Formatted Output</Label>
        <SyntaxHighlighter
          language="graphql"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: "0.5rem",
            fontSize: "0.85rem",
            lineHeight: "1.5",
            minHeight: "200px",
            border: "1px solid hsl(var(--border))",
          }}
          showLineNumbers
        >
          {output || " "}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

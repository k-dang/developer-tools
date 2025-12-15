"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/ui/copy-button";

const loremWords = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

function generateSentence(minWords: number = 8, maxWords: number = 15): string {
  const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  const words: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
  }

  // Capitalize first word
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

  return words.join(" ") + ".";
}

function generateParagraph(minSentences: number = 3, maxSentences: number = 6): string {
  const sentenceCount =
    Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
  const sentences: string[] = [];

  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence());
  }

  return sentences.join(" ");
}

export function LoremIpsum() {
  const [paragraphCount, setParagraphCount] = useState(3);
  const [generatedText, setGeneratedText] = useState(() => generateParagraph());

  const generateText = () => {
    const paragraphs: string[] = [];
    for (let i = 0; i < paragraphCount; i++) {
      paragraphs.push(generateParagraph());
    }
    setGeneratedText(paragraphs.join("\n\n"));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="paragraph-count" className="text-foreground">
          Number of Paragraphs (1-10)
        </Label>
        <Input
          id="paragraph-count"
          type="number"
          min="1"
          max="10"
          value={paragraphCount}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value >= 1 && value <= 10) {
              setParagraphCount(value);
            }
          }}
          className="bg-card border-border text-foreground"
        />
      </div>
      <Button onClick={generateText}>Generate Lorem Ipsum</Button>
      {generatedText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="lorem-output" className="text-foreground">
              Generated Text
            </Label>
            <CopyButton textToCopy={generatedText} />
          </div>
          <Textarea
            id="lorem-output"
            value={generatedText}
            readOnly
            className="min-h-[300px] font-mono text-sm bg-muted border-border text-foreground"
          />
        </div>
      )}
    </div>
  );
}

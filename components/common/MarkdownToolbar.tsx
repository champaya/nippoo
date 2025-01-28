import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  QueueListIcon,
  CodeBracketIcon,
  LinkIcon,
  HashtagIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";

interface MarkdownToolbarProps {
  onInsert: (markdown: string, selectedText?: string) => void;
}

interface ToolButton {
  icon: React.ElementType;
  label: string;
  markdown: string;
  description: string;
  wrapMode?: boolean;
  prefix?: string;
  suffix?: string;
}

const tools: ToolButton[] = [
  {
    icon: HashtagIcon,
    label: "見出し1",
    markdown: "# ",
    description: "大見出しを追加 (h1)",
    wrapMode: true,
    prefix: "# ",
  },
  {
    icon: HashtagIcon,
    label: "見出し2",
    markdown: "## ",
    description: "中見出しを追加 (h2)",
    wrapMode: true,
    prefix: "## ",
  },
  {
    icon: HashtagIcon,
    label: "見出し3",
    markdown: "### ",
    description: "小見出しを追加 (h3)",
    wrapMode: true,
    prefix: "### ",
  },
  {
    icon: HashtagIcon,
    label: "見出し4",
    markdown: "#### ",
    description: "最小見出しを追加 (h4)",
    wrapMode: true,
    prefix: "#### ",
  },
  {
    icon: BoldIcon,
    label: "太字",
    markdown: "**太字**",
    description: "テキストを太字に",
    wrapMode: true,
    prefix: "**",
    suffix: "**",
  },
  {
    icon: ItalicIcon,
    label: "斜体",
    markdown: "*斜体*",
    description: "テキストを斜体に",
    wrapMode: true,
    prefix: "*",
    suffix: "*",
  },
  {
    icon: ListBulletIcon,
    label: "箇条書き",
    markdown: "- $1",
    description: "箇条書きリストを追加",
    wrapMode: true,
    prefix: "- ",
  },
  {
    icon: QueueListIcon,
    label: "番号付きリスト",
    markdown: "1. $1",
    description: "番号付きリストを追加",
    wrapMode: true,
    prefix: "1. ",
  },
  {
    icon: CodeBracketIcon,
    label: "インラインコード",
    markdown: "`コード`",
    description: "インラインコードを追加",
    wrapMode: true,
    prefix: "`",
    suffix: "`",
  },
  {
    icon: Square2StackIcon,
    label: "コードブロック",
    markdown: "```\nコード\n```",
    description: "コードブロックを追加",
    wrapMode: true,
    prefix: "```\n",
    suffix: "\n```",
  },
  {
    icon: LinkIcon,
    label: "リンク",
    markdown: "[テキスト](URL)",
    description: "リンクを追加",
    wrapMode: true,
    prefix: "[",
    suffix: "](URL)",
  },
];

export const MarkdownToolbar = ({ onInsert }: MarkdownToolbarProps) => {
  const getSelectedText = (): string => {
    if (typeof window === "undefined") return "";
    return window.getSelection()?.toString() || "";
  };

  const handleInsert = (tool: ToolButton) => {
    const selectedText = getSelectedText();
    if (tool.wrapMode && selectedText) {
      if (tool.label === "箇条書き" || tool.label === "番号付きリスト") {
        // 選択テキストを行ごとに分割し、各行にプレフィックスを追加
        const lines = selectedText.split("\n");
        const processedText = lines
          .map((line, index) => {
            if (tool.label === "番号付きリスト") {
              return `${index + 1}. ${line}`;
            }
            return `- ${line}`;
          })
          .join("\n");
        onInsert(processedText);
      } else {
        const wrappedText = tool.prefix + selectedText + (tool.suffix || "");
        onInsert(wrappedText);
      }
    } else {
      onInsert(tool.markdown);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 p-1 bg-neutral-50 rounded-md border border-border">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.label}
              type="button"
              onClick={() => handleInsert(tool)}
              className="p-1.5 hover:bg-neutral-100 rounded-md group relative"
              title={tool.description}
            >
              <Icon
                className={`h-4 w-4 ${
                  tool.label.startsWith("見出し")
                    ? `scale-${tool.label.slice(-1)}/4`
                    : ""
                }`}
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                {tool.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

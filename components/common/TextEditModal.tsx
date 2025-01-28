import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface TextEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  title: string;
  content: string;
}

export const TextEditModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  content: initialContent,
}: TextEditModalProps) => {
  const [editedContent, setEditedContent] = useState(initialContent);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditedContent(initialContent);
  }, [initialContent]);

  const handleSave = () => {
    onSave(editedContent);
    onClose();
  };

  const handleCancel = () => {
    setEditedContent(initialContent);
    onClose();
  };

  const handleInsertMarkdown = (markdown: string, selectedText?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editedContent.substring(start, end);

    // 選択テキストがある場合は、そのテキストを保持しながらマークダウンを適用
    const newContent = selected
      ? editedContent.substring(0, start) +
        markdown.replace("$1", selected) +
        editedContent.substring(end)
      : editedContent.substring(0, start) +
        markdown +
        editedContent.substring(end);

    setEditedContent(newContent);

    // カーソル位置を更新
    const newCursorPos = selected
      ? start + markdown.replace("$1", selected).length
      : start + markdown.length;
    textarea.focus();
    setTimeout(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCancel}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="relative bg-white rounded-lg w-[80vw] h-[80vh] p-6 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <DialogTitle className="text-xl font-semibold">
                    {title}
                  </DialogTitle>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        isPreviewMode
                          ? "text-white bg-primary-500 hover:bg-primary-600"
                          : "text-white bg-secondary-500 hover:bg-secondary-600"
                      }`}
                    >
                      {isPreviewMode ? "編集モード" : "プレビューモード"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <MarkdownToolbar onInsert={handleInsertMarkdown} />
                </div>
                <div className="flex-1 overflow-auto flex gap-4">
                  <div className={`flex-1 ${isPreviewMode ? "hidden" : ""}`}>
                    <textarea
                      ref={textareaRef}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full h-full px-4 py-2 border rounded-md font-mono text-sm border-border resize-none"
                    />
                  </div>
                  <div
                    className={`flex-1 ${
                      !isPreviewMode ? "hidden" : ""
                    } overflow-auto border rounded-md p-4 bg-white`}
                  >
                    <MarkdownRenderer content={editedContent} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    保存
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

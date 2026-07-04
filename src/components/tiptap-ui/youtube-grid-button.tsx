import * as React from "react"
import { useCurrentEditor } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"

export const YoutubeGridButton = () => {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  return (
    <Button
      data-style="ghost"
      onClick={() => {
        editor.chain().focus().insertContent('<div data-youtube-grid></div>').run()
      }}
      title="Add 3-Column YouTube Shorts"
      className="flex items-center gap-1 px-2"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="tiptap-button-icon text-red-500"
      >
        <path d="M2.5 7.1C2.6 5.8 3.6 4.7 4.9 4.6c2.4-.2 7.1-.2 7.1-.2s4.7 0 7.1.2c1.3.1 2.3 1.2 2.4 2.5.2 2.1.2 4.9.2 4.9s0 2.8-.2 4.9c-.1 1.3-1.1 2.4-2.4 2.5-2.4.2-7.1.2-7.1.2s-4.7 0-7.1-.2c-1.3-.1-2.3-1.2-2.4-2.5-.2-2.1-.2-4.9-.2-4.9s0-2.8.2-4.9z"/>
        <path d="m10 15 5-3-5-3v6z"/>
      </svg>
      <span className="text-xs font-semibold">YT Shorts Grid</span>
    </Button>
  )
}

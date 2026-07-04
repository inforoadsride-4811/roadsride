import { NodeViewWrapper } from '@tiptap/react'
import React, { useState } from 'react'

export const YoutubeGridComponent = (props: any) => {
  const { node, updateAttributes } = props
  const urls = node.attrs.urls || ['', '', '']
  const [editing, setEditing] = useState(urls.every((u: string) => !u))

  const handleUrlChange = (index: number, val: string) => {
    const newUrls = [...urls]
    newUrls[index] = val
    updateAttributes({ urls: newUrls })
  }

  const getYoutubeId = (url: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  return (
    <NodeViewWrapper className="youtube-grid-wrapper my-8 relative">
      {editing ? (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col gap-4">
          <h4 className="font-semibold text-gray-700">Add 3 YouTube Shorts / Videos</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {urls.map((u: string, i: number) => (
              <div key={i} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Video {i + 1} URL</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/shorts/..."
                  value={u}
                  onChange={(e) => handleUrlChange(i, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-brand-yellow focus:border-brand-yellow outline-none"
                />
              </div>
            ))}
          </div>
          <button 
            onClick={() => setEditing(false)}
            className="self-end px-4 py-2 bg-brand-yellow text-brand-black font-semibold rounded hover:bg-yellow-400 transition"
          >
            Save Videos
          </button>
        </div>
      ) : (
        <div className="group relative">
          <button 
            onClick={() => setEditing(true)}
            className="absolute -top-3 -right-3 bg-white border border-gray-200 shadow-sm p-1 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
            title="Edit Videos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {urls.map((u: string, i: number) => {
              const yId = getYoutubeId(u)
              return (
                <div key={i} className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {yId ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${yId}`}
                      title={`YouTube video ${i + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No video
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </NodeViewWrapper>
  )
}

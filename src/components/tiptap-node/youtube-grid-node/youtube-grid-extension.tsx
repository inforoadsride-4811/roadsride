import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { YoutubeGridComponent } from './youtube-grid-component'

export const YoutubeGrid = Node.create({
  name: 'youtubeGrid',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      urls: {
        default: ['', '', ''],
        parseHTML: element => {
          const urlsStr = element.getAttribute('data-urls')
          if (urlsStr) {
            try {
              return JSON.parse(urlsStr)
            } catch (e) {
              return ['', '', '']
            }
          }
          return ['', '', '']
        },
        renderHTML: attributes => {
          if (!attributes.urls) return {}
          return { 'data-urls': JSON.stringify(attributes.urls) }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-youtube-grid]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    let urls = node.attrs.urls
    if (!Array.isArray(urls)) urls = ['', '', '']

    const getYoutubeId = (url: string) => {
      if (!url) return null
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/
      const match = url.match(regExp)
      return (match && match[2].length === 11) ? match[2] : null
    }

    const gridContent = urls.map((u: string) => {
      const yId = getYoutubeId(u)
      if (!yId) return ['div', { class: 'aspect-[9/16] bg-gray-100 rounded-lg border border-gray-200' }]

      return ['div', { class: 'aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden border border-gray-200' },
        ['iframe', {
          src: `https://www.youtube.com/embed/${yId}`,
          style: 'width: 100%; height: 100%; border: 0;',
          allowfullscreen: 'true',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        }]
      ]
    })

    return ['div', mergeAttributes(HTMLAttributes, {
      'data-youtube-grid': '',
      class: 'grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 my-8'
    }), ...gridContent]
  },

  addNodeView() {
    return ReactNodeViewRenderer(YoutubeGridComponent)
  },
})

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough as StrikeIcon, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2, Heading3, Table as TableIcon, PlaySquare as YoutubeIcon, Minus, Loader2, LayoutGrid, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback, useRef, useState } from 'react';
import { uploadFile, BUCKETS } from '@/lib/storage';
import { useToast } from '@/components/ui/toast';
// Add Underline and Strike from StarterKit is already included (Strike is, Underline is not)
import Underline from '@tiptap/extension-underline';

// --- Custom Grid Extension ---
import { Node, mergeAttributes } from '@tiptap/core';

const GridBlock = Node.create({
  name: 'gridBlock',
  group: 'block',
  content: 'block+',
  priority: 60,
  addAttributes() {
    return {
      cols: {
        default: 2,
        parseHTML: el => parseInt(el.getAttribute('data-cols')) || 2,
        renderHTML: attrs => ({ 'data-cols': attrs.cols }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="grid-block"]' }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const cols = node.attrs.cols || 2;
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-type': 'grid-block',
      style: `display:grid;grid-template-columns:repeat(${cols}, 1fr);gap:16px;margin:16px 0;padding:16px;border:1px dashed #d1d5db;border-radius:8px;background:#f9fafb`,
    }), 0];
  },
  addCommands() {
    return {
      setGrid: (cols = 2) => ({ commands }) => {
        const cells = Array.from({ length: cols }, (_, i) => `<p>Column ${i + 1}</p>`).join('');
        return commands.insertContent(`<div data-type="grid-block" data-cols="${cols}">${cells}</div>`);
      },
    }
  },
});

// --- Custom Iframe Extension (for raw YouTube/embed iframes) ---
const Iframe = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: '100%' },
      height: { default: '500' },
      frameborder: { default: '0' },
      allowfullscreen: { default: true },
      allow: { default: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' },
      style: { default: 'border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.05)' },
    };
  },
  parseHTML() {
    return [{ tag: 'iframe' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'my-4', style: 'position:relative' },
      ['iframe', mergeAttributes(HTMLAttributes)],
    ];
  },
});

// --- Custom StyledDiv (preserves styled wrappers like grid containers) ---
const StyledDiv = Node.create({
  name: 'styledDiv',
  group: 'block',
  content: 'block*',
  defining: true,
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: el => el.getAttribute('style'),
        renderHTML: attrs => attrs.style ? { style: attrs.style } : {},
      },
      class: {
        default: null,
        parseHTML: el => el.getAttribute('class'),
        renderHTML: attrs => attrs.class ? { class: attrs.class } : {},
      },
    };
  },
  parseHTML() {
    return [{
      tag: 'div',
      // Only match divs that have a style attribute (not all divs)
      getAttrs: el => {
        // Don't match grid-block divs (handled by GridBlock extension)
        if (el.getAttribute('data-type') === 'grid-block') return false;
        const style = el.getAttribute('style') || '';
        const cls = el.getAttribute('class') || '';
        // Match divs with grid/flex layout or specific data attributes
        if (style.includes('grid') || style.includes('flex') || 
            style.includes('margin') || style.includes('border-radius') ||
            cls.includes('grid') || el.getAttribute('data-type')) {
          return {};
        }
        return false;
      },
    }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },
});

const MenuBar = ({ editor }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    // Upload to Supabase Storage inside the PRODUCTS bucket
    const { success, url, error } = await uploadFile(file, BUCKETS.PRODUCTS, 'editor/');
    setUploading(false);

    if (success) {
      editor.chain().focus().setImage({ src: url }).run();
    } else {
      addToast({ title: 'Image Upload Failed', message: error, type: 'error' });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addYoutubeVideo = () => {
    if (!editor) return;
    const url = prompt('Enter YouTube URL');
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: Math.max(320, parseInt(editor.view.dom.clientWidth, 10)) || 640,
        height: Math.max(180, parseInt(editor.view.dom.clientWidth, 10) / (16/9)) || 480,
      });
    }
  };

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border-b border-brand-border bg-gray-50/50 sticky top-0 z-10">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-brand-yellow/20 border-brand-yellow' : ''}
        title="Bold"
      >
        <Bold size={16} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-brand-yellow/20 border-brand-yellow' : ''}
        title="Italic"
      >
        <Italic size={16} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'bg-brand-yellow/20 border-brand-yellow' : ''}
        title="Underline"
      >
        <UnderlineIcon size={16} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'bg-brand-yellow/20 border-brand-yellow' : ''}
        title="Strike"
      >
        <StrikeIcon size={16} />
      </Button>

      <div className="w-px h-8 bg-brand-border mx-1" />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-brand-yellow/20 border-brand-yellow' : ''}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-brand-yellow/20 border-brand-yellow' : ''}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'bg-brand-yellow/20 border-brand-yellow' : ''}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </Button>

      <div className="w-px h-8 bg-brand-border mx-1" />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-brand-yellow/20 border-brand-yellow' : ''}
        title="Bullet List"
      >
        <List size={16} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-brand-yellow/20 border-brand-yellow' : ''}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'bg-brand-yellow/20 border-brand-yellow' : ''}
        title="Blockquote"
      >
        <span className="font-serif font-bold italic text-sm">"</span>
      </Button>

      <div className="w-px h-8 bg-brand-border mx-1" />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={setLink}
        className={editor.isActive('link') ? 'bg-brand-yellow/20 border-brand-yellow' : ''}
        title="Link"
      >
        <LinkIcon size={16} />
      </Button>
      
      {/* Actual Image Upload Button */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
      />
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        title="Upload Image"
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
      </Button>

      <Button type="button" variant="outline" size="sm" onClick={addYoutubeVideo} title="YouTube Embed">
        <YoutubeIcon size={16} />
      </Button>

      <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
        <Minus size={16} />
      </Button>

      <div className="w-px h-8 bg-brand-border mx-1" />

      <Button type="button" variant="outline" size="sm" onClick={() => {
        const rows = parseInt(prompt('Number of rows?', '3'));
        const cols = parseInt(prompt('Number of columns?', '3'));
        if (rows > 0 && cols > 0) {
          editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        }
      }} title="Insert Table">
        <TableIcon size={16} />
      </Button>

      <Button type="button" variant="outline" size="sm" onClick={() => {
        const cols = parseInt(prompt('Number of columns? (1-6)', '3'));
        if (cols > 0 && cols <= 6) {
          const cells = Array.from({ length: cols }, (_, i) => `<p>Column ${i + 1}</p>`).join('');
          editor.commands.insertContent(`<div data-type="grid-block" data-cols="${cols}">${cells}</div>`);
        }
      }} title="Insert Grid Layout">
        <Columns size={16} />
      </Button>

    </div>
  );
};

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full shadow-sm my-4',
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-xl shadow-sm my-4',
        },
      }),
      HorizontalRule,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      GridBlock,
      Iframe,
      StyledDiv,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none min-h-[400px] p-6 max-w-none text-gray-800',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border border-brand-border rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-brand-yellow focus-within:border-brand-yellow transition-shadow relative">
      <MenuBar editor={editor} />
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

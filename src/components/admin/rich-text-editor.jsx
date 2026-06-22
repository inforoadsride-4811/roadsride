'use client';

import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

export default function RichTextEditor({ value, onChange }) {
  return (
    <div className="relative w-full max-h-[600px] overflow-y-auto rounded-xl border border-brand-border bg-white shadow-sm focus-within:ring-2 focus-within:ring-brand-yellow focus-within:border-brand-yellow transition-shadow">
      <SimpleEditor value={value} onChange={onChange} />
    </div>
  );
}

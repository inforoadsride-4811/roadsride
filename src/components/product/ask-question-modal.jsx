'use client';

import { useState } from 'react';
import { askQuestion } from '@/actions/qa';
import { useToast } from '@/components/ui/toast';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AskQuestionModal({ productId, onClose, onSuccess }) {
  const [author, setAuthor] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !question.trim()) {
      addToast('error', 'Name and Question are required');
      return;
    }

    setLoading(true);
    const res = await askQuestion(productId, { author, question });
    
    if (res.success) {
      addToast('success', 'Your question has been submitted and is pending review!');
      onSuccess?.();
    } else {
      addToast('error', res.error || 'Failed to submit question');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-brand-black">Ask a Question</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              placeholder="e.g. John Doe"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-yellow outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Question *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              rows={4}
              placeholder="What would you like to know about this product?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-yellow outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="px-5">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="px-5">
              {loading ? 'Submitting...' : 'Submit Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

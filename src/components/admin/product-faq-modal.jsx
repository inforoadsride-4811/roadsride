'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { Loader2, Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { getProductFAQs, saveProductFAQ, deleteProductFAQ } from '@/actions/faqs';

export function ProductFaqModal({ isOpen, onClose, product }) {
  const { addToast } = useToast();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && product?.id) {
      loadFaqs();
      resetForm();
    }
  }, [isOpen, product]);

  const loadFaqs = async () => {
    setLoading(true);
    const res = await getProductFAQs(product.id);
    if (res.success) {
      setFaqs(res.faqs);
    } else {
      addToast({ title: 'Error', description: res.error, type: 'error' });
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setQuestion('');
    setAnswer('');
    setSortOrder(faqs.length * 10);
  };

  const handleEdit = (faq) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setSortOrder(faq.sortOrder);
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      addToast({ title: 'Validation', description: 'Question and Answer are required', type: 'error' });
      return;
    }

    setSaving(true);
    const data = {
      id: editingId,
      question: question.trim(),
      answer: answer.trim(),
      sortOrder: Number(sortOrder) || 0
    };

    const res = await saveProductFAQ(product.id, data);
    setSaving(false);

    if (res.success) {
      addToast({ title: 'Success', description: 'FAQ saved successfully', type: 'success' });
      resetForm();
      loadFaqs();
    } else {
      addToast({ title: 'Error', description: res.error, type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    
    setLoading(true);
    const res = await deleteProductFAQ(id);
    if (res.success) {
      addToast({ title: 'Success', description: 'FAQ deleted', type: 'success' });
      loadFaqs();
    } else {
      addToast({ title: 'Error', description: res.error, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title={`Manage FAQs for ${product?.name || ''}`}>
      <div className="space-y-6 px-6 pb-6 pt-4">
          {/* FAQ List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Existing FAQs</h3>
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : faqs.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No FAQs added yet.</p>
            ) : (
              <div className="space-y-2">
                {faqs.map(faq => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-brand-black">{faq.question}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(faq)}>
                        <Edit2 size={14} className="text-gray-500 hover:text-brand-black" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(faq.id)}>
                        <Trash2 size={14} className="text-red-500 hover:text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              {editingId ? 'Edit FAQ' : 'Add New FAQ'}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="question" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Question</label>
                <Input 
                  id="question" 
                  value={question} 
                  onChange={e => setQuestion(e.target.value)} 
                  placeholder="e.g. What is the warranty period?"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="answer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Answer</label>
                <Textarea 
                  id="answer" 
                  value={answer} 
                  onChange={e => setAnswer(e.target.value)} 
                  placeholder="Provide a detailed answer..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="sortOrder" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Sort Order (Optional)</label>
                <Input 
                  id="sortOrder" 
                  type="number" 
                  value={sortOrder} 
                  onChange={e => setSortOrder(e.target.value)} 
                  className="w-32"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {editingId && (
                  <Button variant="outline" onClick={resetForm}>Cancel Edit</Button>
                )}
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  {editingId ? 'Update FAQ' : 'Add FAQ'}
                </Button>
              </div>
            </div>
          </div>
        </div>
    </Dialog>
  );
}

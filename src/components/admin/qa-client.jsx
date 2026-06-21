'use client';

import { useState, useMemo } from 'react';
import { answerQuestion, rejectQuestion, deleteQA, createDummyQA } from '@/actions/qa';
import { useToast } from '@/components/ui/toast';
import { Search, MessageSquare, CheckCircle, XCircle, Trash2, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function QAClient({ initialQAs, products }) {
  const [qas, setQas] = useState(initialQAs || []);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'answered', 'rejected'
  const [answeringId, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const [showDummyModal, setShowDummyModal] = useState(false);
  const { addToast } = useToast();

  const filteredQAs = useMemo(() => {
    return qas.filter(qa => {
      if (filter !== 'all' && qa.status !== filter) return false;
      if (search) {
        const term = search.toLowerCase();
        return (
          qa.question.toLowerCase().includes(term) ||
          qa.author.toLowerCase().includes(term) ||
          qa.product.name.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [qas, search, filter]);

  const handleAnswer = async (id) => {
    if (!answerText.trim()) return;
    
    setLoadingId(id);
    const res = await answerQuestion(id, answerText);
    if (res.success) {
      setQas(prev => prev.map(q => q.id === id ? { ...q, status: 'answered', answer: answerText } : q));
      setAnsweringId(null);
      setAnswerText('');
      addToast('success', 'Question answered successfully!');
    } else {
      addToast('error', res.error || 'Failed to answer question');
    }
    setLoadingId(null);
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this question? It will not be shown on the site.')) return;
    
    setLoadingId(id);
    const res = await rejectQuestion(id);
    if (res.success) {
      setQas(prev => prev.map(q => q.id === id ? { ...q, status: 'rejected' } : q));
      addToast('success', 'Question rejected');
    } else {
      addToast('error', res.error || 'Failed to reject question');
    }
    setLoadingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this Q&A?')) return;
    
    setLoadingId(id);
    const res = await deleteQA(id);
    if (res.success) {
      setQas(prev => prev.filter(q => q.id !== id));
      addToast('success', 'Q&A deleted');
    } else {
      addToast('error', res.error || 'Failed to delete Q&A');
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions, authors, or products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none text-sm"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-yellow outline-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <Button onClick={() => setShowDummyModal(true)} className="flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Dummy Q&A
        </Button>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filteredQAs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No questions found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredQAs.map((qa) => (
              <li key={qa.id} className={`p-6 transition-colors ${qa.status === 'pending' ? 'bg-blue-50/30' : ''}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        qa.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        qa.status === 'answered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {qa.status.charAt(0).toUpperCase() + qa.status.slice(1)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{qa.author}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <Link href={`/product/${qa.product.slug}`} target="_blank" className="text-sm text-brand-blue hover:underline flex items-center gap-1">
                        {qa.product.name}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{new Date(qa.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <h4 className="text-base font-semibold text-gray-900 mb-2">Q: {qa.question}</h4>
                    
                    {qa.status === 'answered' && qa.answer && (
                      <div className="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap"><span className="font-semibold text-brand-black">A:</span> {qa.answer}</p>
                      </div>
                    )}

                    {answeringId === qa.id && (
                      <div className="mt-4">
                        <textarea
                          rows={3}
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Type your answer here..."
                          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-yellow outline-none mb-3"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleAnswer(qa.id)} 
                            disabled={loadingId === qa.id || !answerText.trim()}
                            className="text-sm px-4 py-1.5"
                          >
                            {loadingId === qa.id ? 'Saving...' : 'Submit Answer'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => { setAnsweringId(null); setAnswerText(''); }}
                            className="text-sm px-4 py-1.5"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {qa.status === 'pending' && answeringId !== qa.id && (
                      <button
                        onClick={() => setAnsweringId(qa.id)}
                        className="p-2 text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                        title="Answer Question"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {qa.status === 'pending' && (
                      <button
                        onClick={() => handleReject(qa.id)}
                        disabled={loadingId === qa.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject Question"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(qa.id)}
                      disabled={loadingId === qa.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showDummyModal && (
        <DummyQAModal 
          products={products} 
          onClose={() => setShowDummyModal(false)}
          onSuccess={(newQA) => {
            setQas([newQA, ...qas]);
            setShowDummyModal(false);
            addToast('success', 'Dummy Q&A added!');
          }}
        />
      )}
    </div>
  );
}

function DummyQAModal({ products, onClose, onSuccess }) {
  const [productId, setProductId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !question || !answer) {
      addToast('error', 'Product, Question, and Answer are required');
      return;
    }
    setLoading(true);
    const res = await createDummyQA(productId, { question, answer, author });
    if (res.success) {
      onSuccess(res.qa);
    } else {
      addToast('error', res.error || 'Failed to add Q&A');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Add Dummy Q&A</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Product *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-yellow outline-none"
            >
              <option value="">Select a product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author Name (Optional)</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. John Doe (Leaves default 'Customer' if empty)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-yellow outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-yellow outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-yellow outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Q&A'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

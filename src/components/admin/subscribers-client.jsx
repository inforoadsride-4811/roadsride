'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, Search } from 'lucide-react';

export default function SubscribersClient({ subscribers }) {
  const [search, setSearch] = useState('');

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-black">Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your newsletter subscribers</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 focus:border-brand-yellow transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Email Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-yellow/10 flex items-center justify-center flex-shrink-0">
                          <Mail size={14} className="text-brand-yellow" />
                        </div>
                        <span className="font-medium text-brand-black">{sub.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.status === 'subscribed' ? 'success' : 'secondary'} className="capitalize">
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Mail size={24} className="text-gray-300" />
                      <p>No subscribers found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../context/AuthContext';
import { MessageSquare, Calendar, User, Mail, Phone, Trash2, Search, Copy, Check } from 'lucide-react';

const ManageQueries = () => {
  const { token } = useAuth();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE}/queries`, { headers });
      setQueries(res.data);
    } catch (err) {
      console.error('Error fetching queries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchQueries();
    }
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to dismiss this customer query?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE}/queries/${id}`, { headers });
      setQueries(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      console.error('Error deleting query:', err);
      alert('Failed to delete query. Please try again.');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const filteredQueries = queries.filter(q => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      q.name?.toLowerCase().includes(search) ||
      q.email?.toLowerCase().includes(search) ||
      q.phone?.includes(search) ||
      q.message?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-8 text-left font-body">
      
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-light tracking-wider text-[#111111] uppercase">
            Customer Queries
          </h1>
          <p className="mt-1 text-xs text-[#707070] tracking-wider uppercase">
            Review and manage customer messages and question forms submitted on the storefront
          </p>
        </div>

        <div className="w-full sm:w-72">
          <div className="relative">
            <input
              type="text"
              placeholder="Search queries (Name, message...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-stone-200 bg-white pl-9 pr-3 py-2.5 text-xs font-body tracking-wider placeholder-stone-400 focus:border-[#7A624E] focus:outline-none transition-colors rounded-xs"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
          </div>
        </div>
      </div>

      {/* Query List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 bg-stone-150 border border-stone-200 rounded-sm" />
          ))}
        </div>
      ) : filteredQueries.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-200 text-xs text-[#707070] uppercase tracking-widest font-semibold italic">
          {queries.length === 0 ? "No customer queries logged yet." : "No queries found matching search query."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {filteredQueries.map((query) => (
            <div
              key={query._id}
              className="bg-white border border-stone-200 p-6 flex flex-col justify-between shadow-xs hover:border-[#7A624E] transition-all duration-300 relative group min-h-[14rem]"
            >
              
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2.5">
                    <div className="bg-stone-100 p-2 rounded-xs">
                      <MessageSquare className="h-4 w-4 text-[#7A624E]" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-heading text-sm font-semibold text-[#111111]">{query.name}</h3>
                      <div className="flex items-center text-[10px] text-stone-400 mt-0.5 space-x-1.5 uppercase font-medium">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(query.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete trigger */}
                  <button
                    onClick={() => handleDelete(query._id)}
                    className="text-stone-300 hover:text-[#E07A5F] transition-colors p-1"
                    title="Dismiss Query"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Message Body */}
                <div className="bg-stone-50/70 p-4 border border-stone-100 rounded-xs text-left">
                  <p className="normal-case text-stone-600 font-light leading-relaxed whitespace-pre-wrap text-xs">
                    {query.message}
                  </p>
                </div>
              </div>

              {/* Contact Panel footer */}
              <div className="mt-5 border-t border-stone-100 pt-4 flex flex-wrap justify-between items-center text-[10px] uppercase font-semibold text-stone-500 gap-2">
                <div className="flex space-x-4">
                  {/* Email contact */}
                  <div className="flex items-center space-x-1 hover:text-[#7A624E] transition-colors cursor-pointer" onClick={() => copyToClipboard(query.email, `${query._id}-email`)}>
                    <Mail className="h-3.5 w-3.5" />
                    <span className="normal-case font-light font-body">{query.email}</span>
                    {copiedId === `${query._id}-email` ? (
                      <Check className="h-3 w-3 text-green-600 ml-1" />
                    ) : (
                      <Copy className="h-2.5 w-2.5 text-stone-300 group-hover:text-stone-400 ml-1" />
                    )}
                  </div>

                  {/* Phone contact */}
                  <div className="flex items-center space-x-1 hover:text-[#7A624E] transition-colors cursor-pointer" onClick={() => copyToClipboard(query.phone, `${query._id}-phone`)}>
                    <Phone className="h-3.5 w-3.5" />
                    <span className="font-light font-body">{query.phone}</span>
                    {copiedId === `${query._id}-phone` ? (
                      <Check className="h-3 w-3 text-green-600 ml-1" />
                    ) : (
                      <Copy className="h-2.5 w-2.5 text-stone-300 group-hover:text-stone-400 ml-1" />
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ManageQueries;

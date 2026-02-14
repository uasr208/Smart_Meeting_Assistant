import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Edit2, Trash2, Plus, X, Tag, Calendar, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { ActionItem } from '../types/database';

interface ActionItemsListProps {
  refreshTrigger: number;
}

export function ActionItemsList({ refreshTrigger }: ActionItemsListProps) {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ task: '', owner: '', due_date: '', tags: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ task: '', owner: '', due_date: '', tags: '' });
  const { user } = useAuth();

  const fetchItems = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [user, refreshTrigger]);

  const toggleStatus = async (item: ActionItem) => {
    const newStatus = item.status === 'open' ? 'done' : 'open';
    const { error } = await supabase
      .from('action_items')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', item.id);

    if (!error) {
      fetchItems();
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('action_items')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchItems();
    }
  };

  const startEditing = (item: ActionItem) => {
    setEditingId(item.id);
    setEditForm({
      task: item.task,
      owner: item.owner || '',
      due_date: item.due_date || '',
      tags: item.tags?.join(', ') || '',
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const tags = editForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    const { error } = await supabase
      .from('action_items')
      .update({
        task: editForm.task,
        owner: editForm.owner || null,
        due_date: editForm.due_date || null,
        tags: tags.length > 0 ? tags : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingId);

    if (!error) {
      setEditingId(null);
      fetchItems();
    }
  };

  const addNewItem = async () => {
    if (!user || !addForm.task.trim()) return;

    const tags = addForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    const { error } = await supabase
      .from('action_items')
      .insert({
        task: addForm.task,
        owner: addForm.owner || null,
        due_date: addForm.due_date || null,
        tags: tags.length > 0 ? tags : null,
        status: 'open',
        user_id: user.id,
        transcript_id: '00000000-0000-0000-0000-000000000000',
      });

    if (!error) {
      setShowAddForm(false);
      setAddForm({ task: '', owner: '', due_date: '', tags: '' });
      fetchItems();
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Action Items</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'open', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-sm">
              ({items.filter(item => f === 'all' || item.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">New Action Item</h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setAddForm({ task: '', owner: '', due_date: '', tags: '' });
              }}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={addForm.task}
              onChange={(e) => setAddForm({ ...addForm, task: e.target.value })}
              placeholder="Task description"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={addForm.owner}
                onChange={(e) => setAddForm({ ...addForm, owner: e.target.value })}
                placeholder="Owner"
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={addForm.due_date}
                onChange={(e) => setAddForm({ ...addForm, due_date: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={addForm.tags}
                onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })}
                placeholder="Tags (comma separated)"
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={addNewItem}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Add Item
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg">No action items found</p>
            <p className="text-sm mt-2">Process a transcript or add items manually</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 transition ${
                item.status === 'done'
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-white border-slate-300 hover:border-blue-300'
              }`}
            >
              {editingId === item.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.task}
                    onChange={(e) => setEditForm({ ...editForm, task: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={editForm.owner}
                      onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                      placeholder="Owner"
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={editForm.due_date}
                      onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      placeholder="Tags"
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStatus(item)}
                      className="mt-1 flex-shrink-0 text-slate-400 hover:text-blue-600 transition"
                    >
                      {item.status === 'done' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-slate-800 font-medium ${
                          item.status === 'done' ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.task}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                        {item.owner && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{item.owner}</span>
                          </div>
                        )}
                        {item.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(item.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            <div className="flex gap-1">
                              {item.tags.map((tag, i) => (
                                <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEditing(item)}
                        className="text-slate-400 hover:text-blue-600 transition"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-slate-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

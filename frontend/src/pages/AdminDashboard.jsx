import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { AuthContext, API_BASE_URL } from '../context/AuthContext';

export default function AdminDashboard() {
  const { token, user, handleAuthError } = useContext(AuthContext);
  
  // News state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL POSTS'); // ALL POSTS, DRAFT, SCHEDULED, IN-REVIEW, PUBLISHED
  
  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Tech');
  const [subcategory, setSubcategory] = useState('');
  const [image, setImage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [formStatusText, setFormStatusText] = useState('');
  const [formError, setFormError] = useState('');

  const formRef = useRef(null);

  const tabs = ['ALL POSTS', 'DRAFT', 'SCHEDULED', 'IN-REVIEW', 'PUBLISHED'];

  // Fetch posts
  const fetchPosts = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/news`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          handleAuthError(res.status);
          throw new Error('Session expired. Please log in again.');
        }
        return res.json();
      })
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  // Handle Tab Click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Filter posts based on active tab
  const getFilteredPosts = () => {
    if (activeTab === 'ALL POSTS') return posts;
    // Map Tab names to status states
    const statusMap = {
      'DRAFT': 'Draft',
      'SCHEDULED': 'Scheduled',
      'IN-REVIEW': 'In-Review',
      'PUBLISHED': 'Published'
    };
    const targetStatus = statusMap[activeTab];
    return posts.filter(post => post.status.toLowerCase() === targetStatus.toLowerCase());
  };

  // Form actions
  const handleCreateNewClick = () => {
    resetForm();
    setFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleEditClick = (post) => {
    setEditId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setCategory(post.category);
    setSubcategory(post.subcategory || '');
    setImage(post.image || '');
    if (post.scheduledAt) {
      // Format to datetime-local expected string 'YYYY-MM-DDTHH:MM'
      const date = new Date(post.scheduledAt);
      const tzOffset = date.getTimezoneOffset() * 60000; // in ms
      const localISODate = (new Date(date - tzOffset)).toISOString().slice(0, 16);
      setScheduledAt(localISODate);
    } else {
      setScheduledAt('');
    }
    setFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setContent('');
    setCategory('Tech');
    setSubcategory('');
    setImage('');
    setScheduledAt('');
    setFormStatusText('');
    setFormError('');
  };

  const submitPost = (status) => {
    if (!title || !content || !category) {
      setFormError('Please fill out Title, Content and Category fields.');
      return;
    }

    if (status === 'Scheduled' && !scheduledAt) {
      setFormError('Please select a Schedule Date for scheduling.');
      return;
    }

    setFormError('');
    const payload = {
      title,
      content,
      category,
      subcategory,
      status,
      image,
      scheduledAt: status === 'Scheduled' ? scheduledAt : ''
    };

    setFormStatusText('SAVING...');

    const url = editId ? `${API_BASE_URL}/news/${editId}` : `${API_BASE_URL}/news`;
    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          handleAuthError(res.status);
          throw new Error('Your session has expired. Please log in again.');
        }
        if (!res.ok) return res.json().then(d => { throw new Error(d.message || 'Failed to save post'); });
        return res.json();
      })
      .then(savedPost => {
        setFormStatusText('SUCCESS!');
        setTimeout(() => {
          resetForm();
          setFormOpen(false);
          fetchPosts();
        }, 1000);
      })
      .catch(err => {
        console.error(err);
        setFormStatusText('');
        setFormError(err.message || 'An error occurred while saving.');
      });
  };

  const handleDeleteClick = (id) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;

    fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          handleAuthError(res.status);
          throw new Error('Session expired. Please log in again.');
        }
        if (!res.ok) return res.json().then(d => { throw new Error(d.message || 'Failed to delete post'); });
        return res.json();
      })
      .then(() => {
        fetchPosts();
      })
      .catch(err => {
        console.error(err);
        alert(err.message);
      });
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '--';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Mock Text Editor Interactions
  const handleEditorToolbarClick = (wrapperStart, wrapperEnd) => {
    const textarea = document.getElementById('editorTextarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = wrapperStart + selectedText + wrapperEnd;
    setContent(text.substring(0, start) + replacement + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + wrapperStart.length, start + wrapperStart.length + selectedText.length);
    }, 50);
  };

  const filteredPosts = getFilteredPosts();

  return (
    <AdminLayout>
      <div className="pt-8 pb-20 px-margin-mobile md:px-stack-lg max-w-5xl mx-auto space-y-stack-lg">
        
        {/* Headline Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Content Management</h1>
            <p className="text-on-surface-variant font-body-md mt-1">Create and manage your editorial publications.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCreateNewClick}
              className="bg-primary text-on-primary hover:bg-primary-container px-6 py-3 rounded font-label-caps text-xs font-bold flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span> NEW POST
            </button>
          </div>
        </div>

        {/* Post Creation Area (Form) */}
        {formOpen && (
          <section ref={formRef} className="bg-surface-container-lowest border border-outline-variant p-stack-md md:p-stack-lg rounded-xl shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant/60 pb-3">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-3xl">edit_note</span>
                <h2 className="font-headline-sm text-headline-sm font-bold">
                  {editId ? 'Edit News Post' : 'Create News Post'}
                </h2>
              </div>
              <button 
                onClick={() => { resetForm(); setFormOpen(false); }} 
                className="text-on-surface-variant hover:text-red-600 transition-colors material-symbols-outlined p-1 rounded-full hover:bg-surface-container cursor-pointer"
              >
                close
              </button>
            </div>
            
            <form onSubmit={e => e.preventDefault()} className="space-y-stack-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
                
                {/* Title Input */}
                <div className="md:col-span-2 space-y-1">
                  <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Article Title
                  </label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter headline..."
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 font-body-md outline-none text-sm"
                  />
                </div>

                {/* Schedule Date */}
                <div className="space-y-1">
                  <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Schedule Date & Time
                  </label>
                  <input 
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 font-body-md outline-none text-sm"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
                {/* Category Select */}
                <div className="space-y-1">
                  <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Category
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 font-body-md outline-none text-sm"
                  >
                <option value="Tech">Tech</option>
                    <option value="Politics">Politics</option>
                    <option value="Sports">Sports</option>
                    <option value="Economy">Economy</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                {/* Subcategory */}
                <div className="space-y-1">
                  <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Subcategory (Optional)
                  </label>
                  <input 
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. Artificial Intelligence"
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 font-body-md outline-none text-sm"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-1">
                  <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Cover Image URL (Optional)
                  </label>
                  <input 
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 font-body-md outline-none text-sm"
                  />
                </div>
              </div>

              {/* Content Editor */}
              <div className="space-y-1">
                <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Content Editor
                </label>
                <div className="border border-outline-variant rounded overflow-hidden shadow-sm">
                  {/* Toolbar */}
                  <div className="bg-surface-container border-b border-outline-variant p-2 flex gap-2 overflow-x-auto">
                    <button 
                      type="button" 
                      onClick={() => handleEditorToolbarClick('**', '**')}
                      className="p-2 hover:bg-surface-container-highest rounded cursor-pointer" 
                      title="Bold text"
                    >
                      <span className="material-symbols-outlined text-xl">format_bold</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleEditorToolbarClick('*', '*')}
                      className="p-2 hover:bg-surface-container-highest rounded cursor-pointer" 
                      title="Italic text"
                    >
                      <span className="material-symbols-outlined text-xl">format_italic</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleEditorToolbarClick('\n- ', '')}
                      className="p-2 hover:bg-surface-container-highest rounded cursor-pointer" 
                      title="Bullet list"
                    >
                      <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleEditorToolbarClick('[', '](url)')}
                      className="p-2 hover:bg-surface-container-highest rounded cursor-pointer" 
                      title="Add hyperlink"
                    >
                      <span className="material-symbols-outlined text-xl">link</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleEditorToolbarClick('![Image Description](', ')')}
                      className="p-2 hover:bg-surface-container-highest rounded cursor-pointer" 
                      title="Add image link"
                    >
                      <span className="material-symbols-outlined text-xl">image</span>
                    </button>
                  </div>
                  {/* Textarea */}
                  <textarea 
                    id="editorTextarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing the story... Use double newlines for paragraphs."
                    rows="8"
                    className="w-full bg-surface-container-low border-none focus:ring-0 p-4 font-body-md outline-none text-sm resize-y"
                  />
                </div>
              </div>

              {/* Form Action buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/60">
                {formError && (
                  <div className="bg-error-container text-on-error-container text-xs font-semibold px-4 py-3 rounded flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error_outline</span>
                    {formError}
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-primary">
                    {formStatusText}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      type="button" 
                      onClick={() => submitPost('Draft')}
                      className="px-6 py-2.5 border border-secondary text-secondary rounded font-label-caps text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      SAVE DRAFT
                    </button>
                    <button 
                      type="button" 
                      onClick={() => submitPost('In-Review')}
                      className="px-6 py-2.5 border border-primary text-primary rounded font-label-caps text-xs font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
                    >
                      SEND FOR APPROVAL
                    </button>
                    {scheduledAt && (
                      <button 
                        type="button" 
                        onClick={() => submitPost('Scheduled')}
                        className="px-6 py-2.5 bg-status-scheduled/10 border border-status-scheduled text-status-scheduled rounded font-label-caps text-xs font-bold hover:bg-status-scheduled/20 transition-colors cursor-pointer"
                      >
                        SCHEDULE RELEASE
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => submitPost('Published')}
                      className="px-6 py-2.5 bg-primary text-on-primary rounded font-label-caps text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-sm"
                    >
                      PUBLISH NOW
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </section>
        )}

        {/* All Posts Management */}
        <section className="space-y-stack-md">
          {/* Tab lists */}
          <div className="flex items-center border-b border-outline-variant overflow-x-auto hide-scrollbar">
            <div className="flex">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`px-6 py-4 font-label-caps text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab 
                      ? 'border-b-2 border-primary text-primary bg-primary/5' 
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid Table Container */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    <th className="px-6 py-4 font-label-caps text-xs font-bold text-on-surface-variant">TITLE & CATEGORY</th>
                    <th className="px-6 py-4 font-label-caps text-xs font-bold text-on-surface-variant">STATUS</th>
                    <th className="px-6 py-4 font-label-caps text-xs font-bold text-on-surface-variant">DATE</th>
                    <th className="px-6 py-4 font-label-caps text-xs font-bold text-on-surface-variant text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-20">
                        <span className="material-symbols-outlined animate-spin text-3xl text-primary mb-2">sync</span>
                        <p className="font-label-caps text-xs text-outline font-bold">Synchronizing database feed...</p>
                      </td>
                    </tr>
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-20 text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl text-outline mb-2">newspaper</span>
                        <p className="font-bold">No news posts found in this feed tab.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => {
                      // Status colors config
                      const badgeClasses = {
                        'Published': 'bg-status-published/10 text-status-published',
                        'Scheduled': 'bg-status-scheduled/10 text-status-scheduled',
                        'In-Review': 'bg-status-review/10 text-status-review',
                        'Draft': 'bg-status-draft/10 text-status-draft'
                      };
                      const badgeClass = badgeClasses[post.status] || 'bg-status-draft/10 text-status-draft';

                      return (
                        <tr key={post.id} className="hover:bg-surface-container-low transition-colors duration-200">
                          <td className="px-6 py-4">
                            <Link 
                              to={`/news/${post.id}`} 
                              className="font-body-md font-bold text-on-surface hover:text-primary transition-colors hover:underline line-clamp-1"
                            >
                              {post.title}
                            </Link>
                            <div className="text-primary font-label-caps text-[9px] font-bold uppercase mt-1">
                              {post.category} {post.subcategory ? `• ${post.subcategory}` : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${badgeClass}`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-body-md text-sm text-on-surface-variant">
                            {post.status === 'Scheduled' && post.scheduledAt 
                              ? `Sched: ${formatDate(post.scheduledAt)}` 
                              : formatDate(post.publishedAt || post.scheduledAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button 
                                onClick={() => handleEditClick(post)}
                                className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer" 
                                title="Edit Post"
                              >
                                <span className="material-symbols-outlined text-xl">edit</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(post.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer" 
                                title="Delete Post"
                              >
                                <span className="material-symbols-outlined text-xl">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Info bar */}
            <div className="px-6 py-4 bg-surface-container flex justify-between items-center border-t border-outline-variant/60">
              <span className="font-label-caps text-xs text-on-surface-variant font-bold">
                Showing {filteredPosts.length} of {posts.length} posts
              </span>
              <div className="flex gap-2">
                <button 
                  className="p-1.5 bg-surface-container-lowest border border-outline-variant rounded disabled:opacity-50 cursor-pointer" 
                  disabled
                >
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <button 
                  className="p-1.5 bg-surface-container-lowest border border-outline-variant rounded cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </AdminLayout>
  );
}

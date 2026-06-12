import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../context/AuthContext';

export default function CategoryFeed() {
  const { categoryName } = useParams();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubtag, setSelectedSubtag] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');
  const navigate = useNavigate();

  // Subcategory filters by category
  const subcategoryMap = {
    Tech: ['Artificial Intelligence', 'Cybersecurity', 'Hardware', 'Startups'],
    Politics: ['World News', 'Elections', 'Policy', 'Urbanism'],
    Sports: ['Football', 'Cricket', 'Olympics', 'Athletics'],
    Economy: ['Global Markets', 'Inflation', 'Trade', 'Finance']
  };

  const subtags = subcategoryMap[categoryName] || [];

  useEffect(() => {
    setLoading(true);
    setSelectedSubtag(null);
    fetch(`${API_BASE_URL}/news?category=${categoryName}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch news posts');
        return res.json();
      })
      .then(data => {
        setPosts(data);
        setFilteredPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [categoryName]);

  // Handle subtags filtering client-side
  const handleSubtagClick = (tag) => {
    if (selectedSubtag === tag) {
      setSelectedSubtag(null);
      setFilteredPosts(posts);
    } else {
      setSelectedSubtag(tag);
      const filtered = posts.filter(post => 
        (post.subcategory && post.subcategory.toLowerCase() === tag.toLowerCase()) ||
        (post.content && post.content.toLowerCase().includes(tag.toLowerCase())) ||
        (post.title && post.title.toLowerCase().includes(tag.toLowerCase()))
      );
      setFilteredPosts(filtered);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus('SUBSCRIBING...');
    setTimeout(() => {
      setSubscribeStatus('SUBSCRIBED');
      setEmail('');
      setTimeout(() => setSubscribeStatus(''), 3000);
    }, 1000);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Oct 24, 2026';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <TopAppBar />

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex-grow w-full">
        {/* Category Header */}
        <section className="mb-stack-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-stack-md">
            <div>
              <span className="font-label-caps text-label-caps text-primary mb-2 block font-semibold tracking-wider">
                CATEGORY ARCHIVE
              </span>
              <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-surface font-bold">
                {categoryName}
              </h1>
            </div>
            
            {/* Filter Tags */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar max-w-full">
              {subtags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleSubtagClick(tag)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubtag === tag 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center items-center py-40">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
            <span className="ml-2 font-bold font-label-caps">Loading {categoryName} archive...</span>
          </div>
        ) : error ? (
          <div className="bg-error-container p-6 rounded-lg my-12 text-center text-on-error-container">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <p className="font-bold">Error loading category feed: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            
            {/* Main Feed Column */}
            <div className="lg:col-span-8 flex flex-col gap-stack-lg">
              {filteredPosts.length === 0 ? (
                <div className="bg-surface-card border border-outline-variant p-10 rounded-lg text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl text-outline mb-2">newspaper</span>
                  <p className="font-bold">No articles found in this category.</p>
                  <p className="text-sm mt-1">Please check back later for updates or choose another tag.</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <article 
                    key={post.id}
                    className="group bg-surface-card border border-outline-variant p-4 md:p-6 rounded-lg transition-all hover:shadow-md"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      <div className="md:col-span-2 overflow-hidden rounded bg-surface-container h-48 md:h-full">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          src={post.image} 
                          alt={post.title}
                        />
                      </div>
                      <div className="md:col-span-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-3 text-on-surface-variant text-xs font-semibold">
                            <span className="font-label-caps text-primary uppercase">
                              {post.subcategory || post.category}
                            </span>
                            <span className="w-1 h-1 bg-outline rounded-full"></span>
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>
                          <h2 
                            onClick={() => navigate(`/news/${post.id}`)}
                            className="font-headline-sm text-headline-sm font-bold mb-3 group-hover:text-primary transition-colors cursor-pointer leading-snug hover:underline"
                          >
                            {post.title}
                          </h2>
                          <p className="font-body-md text-on-surface-variant text-sm line-clamp-3 mb-4 leading-relaxed">
                            {post.content}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-outline-variant/60 pt-4 mt-auto">
                          <span className="font-body-md text-xs text-outline flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span> {post.readTime} min read
                          </span>
                          <Link 
                            to={`/news/${post.id}`}
                            className="text-primary font-bold font-label-caps text-xs tracking-wider hover:underline"
                          >
                            READ FULL STORY
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 flex flex-col gap-stack-lg">
              
              {/* Sidebar Newsletter */}
              <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant">
                <h3 className="font-headline-sm text-lg font-bold mb-2">The Tech Brief</h3>
                <p className="font-body-md text-on-surface-variant text-sm mb-6 leading-relaxed">
                  Our daily curated briefing on the innovations that actually matter. Delivered every morning.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full px-4 py-3 bg-white border border-outline-variant rounded focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={subscribeStatus !== ''}
                    className="w-full bg-primary text-white font-bold font-label-caps text-xs tracking-widest py-3 rounded hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-85"
                  >
                    {subscribeStatus || 'SUBSCRIBE'}
                  </button>
                </form>
              </div>

              {/* More Categories */}
              <div className="bg-white border border-outline-variant p-6 rounded-lg">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant font-bold mb-6 border-b border-outline-variant pb-2">
                  MORE CATEGORIES
                </h3>
                <div className="flex flex-col gap-4">
                  {Object.keys(subcategoryMap)
                    .filter(cat => cat !== categoryName)
                    .map(cat => (
                      <Link 
                        key={cat}
                        to={`/category/${cat}`}
                        className="flex items-center justify-between group py-1 border-b border-outline-variant/30 last:border-none"
                      >
                        <span className="font-headline-sm text-base font-bold group-hover:text-primary transition-colors">
                          {cat}
                        </span>
                        <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                          chevron_right
                        </span>
                      </Link>
                    ))}
                </div>
              </div>

              {/* Trending side panel */}
              <div>
                <h3 className="font-label-caps text-label-caps text-on-surface-variant font-bold mb-6 border-b border-outline-variant pb-2">
                  TRENDING IN {categoryName.toUpperCase()}
                </h3>
                <div className="space-y-6">
                  {posts.slice(0, 3).map((post, idx) => (
                    <div key={post.id} className="flex gap-4">
                      <span className="font-headline-md text-outline-variant text-2xl font-bold opacity-50">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 
                          onClick={() => navigate(`/news/${post.id}`)}
                          className="font-body-lg font-bold leading-tight mb-1 hover:text-primary cursor-pointer hover:underline"
                        >
                          {post.title}
                        </h4>
                        <span className="text-[10px] text-outline font-label-caps font-bold uppercase">
                          {post.subcategory || post.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

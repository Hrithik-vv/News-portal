import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import Footer from '../components/Footer';
import { API_BASE_URL, AuthContext } from '../context/AuthContext';

export default function SingleArticle() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const navigate = useNavigate();

  // Scroll listener for reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height > 0) {
        const scrolled = (winScroll / height) * 100;
        setScrollProgress(scrolled);
      } else {
        setScrollProgress(0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLoading(true);
    // Fetch Single Article
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${API_BASE_URL}/news/${id}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Article not found or access denied');
        return res.json();
      })
      .then(articleData => {
        setPost(articleData);
        setLoading(false);
        // Load related articles in the same category
        fetch(`${API_BASE_URL}/news?category=${articleData.category}`)
          .then(r => r.json())
          .then(allCatPosts => {
            // Filter out current post
            const filtered = allCatPosts.filter(p => p.id !== articleData.id).slice(0, 2);
            setRelated(filtered);
          })
          .catch(err => console.error('Error fetching related posts:', err));
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id, token]);

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Pending Release';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <TopAppBar />

      {/* Reading Progress Indicator Bar */}
      <div className="fixed top-16 left-0 w-full h-1 z-40 bg-surface-container">
        <div 
          className="h-full bg-primary transition-all duration-100" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-40 flex-grow">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <span className="ml-2 font-bold font-label-caps">Loading article details...</span>
        </div>
      ) : error ? (
        <div className="bg-error-container p-6 rounded-lg my-12 text-center text-on-error-container max-w-lg mx-auto flex-grow flex flex-col justify-center items-center">
          <span className="material-symbols-outlined text-4xl mb-2">error_outline</span>
          <p className="font-bold">Error loading article: {error}</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-6 bg-primary text-on-primary px-6 py-2 font-label-caps text-xs tracking-wider"
          >
            Go Back Home
          </button>
        </div>
      ) : (
        <main className="pt-0 pb-24 md:pb-0 flex-grow">
          
          {/* Article Banner Header */}
          <div className="w-full h-[353px] md:h-[530px] relative overflow-hidden bg-black">
            <img 
              className="w-full h-full object-cover opacity-80" 
              src={post.image} 
              alt={post.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent" />
          </div>

          {/* Floating Article Card */}
          <article className="max-w-screen-md mx-auto px-margin-mobile md:px-0 -mt-24 relative z-10">
            <div className="bg-surface p-6 md:p-stack-lg border-x border-t border-outline-variant shadow-lg rounded-t-xl">
              
              <div className="mb-4">
                <span className="font-label-caps text-xs font-bold text-primary px-3 py-1 bg-primary-fixed rounded-full">
                  {post.subcategory ? `${post.category} & ${post.subcategory}` : post.category}
                </span>
                {post.status !== 'Published' && (
                  <span className="ml-2 font-label-caps text-xs font-bold text-white px-3 py-1 bg-status-review rounded-full">
                    {post.status} PREVIEW
                  </span>
                )}
              </div>

              <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg font-bold text-on-surface mb-6 leading-tight">
                {post.title}
              </h2>

              {/* Author and Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-outline-variant/60 py-4 mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-container overflow-hidden border border-outline-variant">
                    {post.author?.avatar ? (
                      <img src={post.author.avatar} alt="Author" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-2xl m-auto">person</span>
                    )}
                  </div>
                  <div>
                    <p className="font-status-label text-status-label font-bold text-on-surface">By {post.author?.name || 'Staff Writer'}</p>
                    <p className="text-xs text-on-surface-variant font-semibold">
                      Editorial Correspondent • {formatDate(post.publishedAt)} • {post.readTime} min read
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleShareClick}
                    className="p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer active:scale-90"
                    title="Share Link"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant">share</span>
                  </button>
                  <button 
                    onClick={handleBookmarkToggle}
                    className="p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer active:scale-90"
                    title="Bookmark"
                  >
                    <span className={`material-symbols-outlined ${isBookmarked ? 'text-primary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: `'FILL' ${isBookmarked ? 1 : 0}` }}>
                      bookmark
                    </span>
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer active:scale-90"
                    title="Print Page"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant">print</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Body content rendering with Drop Cap */}
              <div className="space-y-6 text-on-surface leading-relaxed text-body-lg">
                {post.content.split('\n\n').map((paragraph, index) => {
                  if (index === 0) {
                    return (
                      <p 
                        key={index}
                        className="font-body-lg text-body-lg first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:h-12 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    );
                  }
                  return (
                    <p key={index} className="font-body-md text-base leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {post.category === 'Tech' && (
                <div className="mt-8 pt-6 border-t border-outline-variant/60 flex flex-wrap gap-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-surface-container-high text-on-surface-variant rounded">#AI</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-surface-container-high text-on-surface-variant rounded">#TECHNOLOGY</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-surface-container-high text-on-surface-variant rounded">#INNOVATION</span>
                </div>
              )}
            </div>
          </article>

          {/* Related News Section */}
          {related.length > 0 && (
            <section className="max-w-screen-md mx-auto px-margin-mobile md:px-0 mt-12 mb-20">
              <h3 className="font-label-caps text-xs font-bold text-primary mb-4 border-b border-primary w-max pb-1 uppercase tracking-wider">
                RELATED NEWS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                {related.map(rel => (
                  <div 
                    key={rel.id}
                    onClick={() => navigate(`/news/${rel.id}`)}
                    className="bg-surface border border-outline-variant overflow-hidden flex flex-col hover:border-primary transition-colors cursor-pointer group rounded-lg shadow-sm"
                  >
                    <div className="h-40 overflow-hidden bg-surface-container">
                      <img 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        src={rel.image} 
                        alt={rel.title}
                      />
                    </div>
                    <div className="p-stack-md flex-grow flex flex-col justify-between">
                      <div>
                        <span className="font-label-caps text-[9px] font-bold text-primary mb-1 block uppercase">
                          {rel.subcategory || rel.category}
                        </span>
                        <h4 className="font-headline-sm text-base font-bold leading-snug text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                          {rel.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>
      )}

      <Footer />
    </div>
  );
}

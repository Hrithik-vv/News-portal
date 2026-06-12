import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../context/AuthContext';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/news`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch news posts');
        return res.json();
      })
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus('SUBSCRIBING...');
    setTimeout(() => {
      setSubscribeStatus('THANK YOU!');
      setEmail('');
      setTimeout(() => {
        setSubscribeStatus('');
      }, 3000);
    }, 1200);
  };

  // We split the posts:
  // - Hero: the first post (index 0)
  // - Latest insights: posts 1 to 4 (or up to 4)
  // - Editorial focus: post 5 or a default one
  const heroPost = posts[0];
  const latestInsights = posts.slice(1, 5);
  const editorialFocusPost = posts[5] || posts[posts.length - 1];

  const handleShareClick = (e, post) => {
    e.stopPropagation(); // prevent card click navigation
    if (navigator.share) {
      navigator.share({
        title: post.title,
        url: `${window.location.origin}/#/news/${post.id}`
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/#/news/${post.id}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <TopAppBar />

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-24 md:pb-12 flex-grow w-full">
        {loading ? (
          <div className="flex justify-center items-center py-40">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
            <span className="ml-2 font-bold font-label-caps">Loading editorial feed...</span>
          </div>
        ) : error ? (
          <div className="bg-error-container p-6 rounded-lg my-12 text-center text-on-error-container">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <p className="font-bold">Error loading news feed: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-primary text-on-primary px-6 py-2 font-label-caps text-xs"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            {heroPost && (
              <section className="relative w-full overflow-hidden rounded-lg mt-6 bg-black">
                <div className="relative w-full aspect-[4/5] md:aspect-[21/9] lg:aspect-[21/7]">
                  <img 
                    className="w-full h-full object-cover opacity-80" 
                    src={heroPost.image} 
                    alt={heroPost.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-margin-mobile md:p-margin-desktop">
                    <div className="max-w-3xl">
                      <span className="inline-block bg-breaking-red text-white px-3 py-1 font-label-caps text-[11px] mb-4 animate-pulse uppercase tracking-wider">
                        Breaking News
                      </span>
                      <h2 
                        onClick={() => navigate(`/news/${heroPost.id}`)}
                        className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-4 leading-tight cursor-pointer hover:underline"
                      >
                        {heroPost.title}
                      </h2>
                      <p className="text-white/90 font-body-lg text-body-lg max-w-2xl hidden md:block mb-6 line-clamp-2">
                        {heroPost.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <Link 
                          to={`/news/${heroPost.id}`}
                          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 font-label-caps text-xs tracking-wider transition-all active:scale-95"
                        >
                          Read Full Report
                        </Link>
                        <button 
                          onClick={(e) => handleShareClick(e, heroPost)}
                          className="text-white flex items-center gap-2 font-label-caps text-xs hover:underline cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">share</span> Share Article
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* General News Section (Latest Insights) */}
            <section className="mt-12">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold border-l-4 border-primary pl-4">Latest Insights</h3>
                  <p className="text-on-surface-variant font-body-md text-sm mt-1">Today's essential editorial picks</p>
                </div>
                <Link to="/category/Tech" className="text-primary font-label-caps text-xs hover:underline flex items-center gap-1">
                  View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              {/* News Grid (Horizontal scroll on mobile, 4-col on desktop) */}
              <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-gutter overflow-x-auto hide-scrollbar pb-4 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
                {latestInsights.map((post) => (
                  <article 
                    key={post.id}
                    onClick={() => navigate(`/news/${post.id}`)}
                    className="min-w-[280px] flex-shrink-0 md:min-w-0 bg-surface-card border border-outline-variant hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-video overflow-hidden bg-surface-container">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          src={post.image} 
                          alt={post.title}
                        />
                      </div>
                      <div className="p-stack-md">
                        <span className="font-label-caps text-[10px] font-bold text-primary mb-2 block uppercase">
                          {post.category}
                        </span>
                        <h4 className="font-headline-sm text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-on-surface-variant text-sm line-clamp-3 mb-4">
                          {post.content}
                        </p>
                      </div>
                    </div>
                    <div className="px-stack-md pb-4 pt-4 border-t border-outline-variant flex items-center justify-between mt-auto">
                      <span className="text-xs text-on-surface-variant">{post.readTime} Min Read</span>
                      <button 
                        onClick={(e) => handleShareClick(e, post)}
                        className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        title="Copy Share Link"
                      >
                        share
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Secondary Layout: Feature Bento */}
            <section className="mt-12">
              <h3 className="font-headline-md text-headline-md font-bold mb-6 border-l-4 border-primary pl-4">In-Depth Analysis</h3>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                
                {/* Large Feature (Col span 8) */}
                {editorialFocusPost ? (
                  <div 
                    onClick={() => navigate(`/news/${editorialFocusPost.id}`)}
                    className="lg:col-span-8 bg-surface-container-low p-stack-lg relative overflow-hidden flex flex-col justify-between min-h-[400px] border border-outline-variant hover:shadow-md cursor-pointer transition-all rounded-lg"
                  >
                    <div className="relative z-10">
                      <span className="bg-primary text-white px-2 py-1 font-label-caps text-[10px]">
                        Editorial Focus
                      </span>
                      <h3 className="font-headline-md text-headline-md font-bold mt-6 max-w-xl leading-tight">
                        {editorialFocusPost.title}
                      </h3>
                      <p className="text-on-surface-variant font-body-lg mt-4 max-w-lg line-clamp-3">
                        {editorialFocusPost.content}
                      </p>
                    </div>
                    <div className="relative z-10 mt-8">
                      <span className="border border-on-surface text-on-surface px-6 py-2 font-label-caps text-xs hover:bg-on-surface hover:text-white transition-colors">
                        Read Longform
                      </span>
                    </div>
                    {/* Decorative watermark image */}
                    <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-15 pointer-events-none">
                      <img src={editorialFocusPost.image} alt="" className="w-full h-full object-cover object-left" />
                    </div>
                  </div>
                ) : (
                  <div className="lg:col-span-8 bg-surface-container-low p-stack-lg rounded-lg border border-outline-variant flex items-center justify-center">
                    <p className="font-label-caps text-on-surface-variant text-sm">More analysis coming soon</p>
                  </div>
                )}

                {/* Vertical Sidebar Cards (Col span 4) */}
                <div className="lg:col-span-4 flex flex-col gap-gutter">
                  
                  {/* Briefing List */}
                  <div className="bg-surface-card border border-outline-variant p-stack-md rounded-lg flex-1">
                    <span className="font-label-caps text-[10px] text-tertiary mb-2 block uppercase font-bold">
                      The Weekly Briefing
                    </span>
                    <h4 className="font-headline-sm text-[20px] font-bold mb-4 leading-snug border-b border-outline-variant/60 pb-2">
                      5 Things You Need to Know Today
                    </h4>
                    <ul className="space-y-4">
                      <li className="flex gap-3 items-start group cursor-pointer">
                        <span className="text-primary font-bold">01</span>
                        <p className="text-sm group-hover:text-primary transition-colors leading-relaxed">
                          Global energy prices hit 2-year low as supply chains normalize.
                        </p>
                      </li>
                      <li className="flex gap-3 items-start group cursor-pointer">
                        <span className="text-primary font-bold">02</span>
                        <p className="text-sm group-hover:text-primary transition-colors leading-relaxed">
                          Tech giants agree on unified open-source safety standards.
                        </p>
                      </li>
                      <li className="flex gap-3 items-start group cursor-pointer">
                        <span className="text-primary font-bold">03</span>
                        <p className="text-sm group-hover:text-primary transition-colors leading-relaxed">
                          Rare planetary alignment visible tomorrow morning.
                        </p>
                      </li>
                    </ul>
                  </div>

                  {/* Newsletter Subscription */}
                  <div className="bg-primary-container text-on-primary-container p-stack-md rounded-lg flex flex-col justify-center items-center text-center border border-primary/10">
                    <span className="material-symbols-outlined text-4xl mb-2">mail</span>
                    <h4 className="font-headline-sm text-[18px] font-bold mb-1">PENOFT Daily Brief</h4>
                    <p className="text-xs mb-4 opacity-90 leading-relaxed max-w-xs">
                      Get the world's most critical stories delivered to your inbox every morning.
                    </p>
                    <form onSubmit={handleSubscribe} className="w-full space-y-2">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        required
                        className="w-full bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder:text-white/50 rounded focus:ring-2 focus:ring-white outline-none text-white text-center"
                      />
                      <button 
                        type="submit" 
                        disabled={subscribeStatus !== ''}
                        className="w-full bg-white text-primary font-label-caps text-xs font-bold py-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-80"
                      >
                        {subscribeStatus || 'SUBSCRIBE'}
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

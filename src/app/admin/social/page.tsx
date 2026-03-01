'use client';

import { useEffect, useState } from 'react';
import { PageHeader, Button, StatusBadge } from '@/components/ui';
import { format } from 'date-fns';
import {
  Twitter, MessageCircle, Globe, TrendingUp, RefreshCw,
  ThumbsUp, ThumbsDown, MapPin, ExternalLink,
} from 'lucide-react';

interface SocialPost {
  id: string;
  platform: 'twitter' | 'whatsapp' | 'news';
  author: string;
  handle?: string;
  content: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  location?: string;
  category?: string;
  engagementScore: number;
  linked: boolean;
  url?: string;
}

// Demo data for the social media ingestion pipeline
const DEMO_POSTS: SocialPost[] = [
  {
    id: 's1', platform: 'twitter', author: 'Ravi Kulkarni', handle: '@ravikulk',
    content: 'Massive pothole on Mira Road near station. Already 3 accidents this week. @MiraBhayMC when will this be fixed? #MiraBhayandar #RoadSafety',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    sentiment: 'negative', location: 'Mira Road', category: 'road-conditions',
    engagementScore: 87, linked: false, url: '#',
  },
  {
    id: 's2', platform: 'twitter', author: 'Sneha Joshi', handle: '@snehaj_mumbai',
    content: 'Great job by volunteers cleaning up Vasai Creek! The water quality has improved so much 🙌 #CleanVasai #CivicPride',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    sentiment: 'positive', location: 'Vasai', category: 'pollution',
    engagementScore: 65, linked: false, url: '#',
  },
  {
    id: 's3', platform: 'whatsapp', author: 'Palghar Citizens Group',
    content: 'Water supply has been irregular in Kelve Road for the past 5 days. Tankers are not coming. Residents are frustrated.',
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    sentiment: 'negative', location: 'Kelve Road', category: 'water-supply',
    engagementScore: 45, linked: true,
  },
  {
    id: 's4', platform: 'news', author: 'MMR Times',
    content: 'Boisar municipal council approves ₹2Cr budget for street lighting upgrade across 15 wards. Work to begin next month.',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    sentiment: 'positive', location: 'Boisar', category: 'street-lighting',
    engagementScore: 72, linked: false, url: '#',
  },
  {
    id: 's5', platform: 'twitter', author: 'Amit Patil', handle: '@amitpatil99',
    content: 'Garbage piling up near Dahisar checkpost again. The same spot that was cleaned last week. Need permanent solution! @BMCMumbai',
    timestamp: new Date(Date.now() - 18 * 3600000).toISOString(),
    sentiment: 'negative', location: 'Dahisar', category: 'garbage',
    engagementScore: 93, linked: true, url: '#',
  },
  {
    id: 's6', platform: 'whatsapp', author: 'Borivali East Residents',
    content: 'Drainage overflowing near IC Colony. Mosquito breeding is a serious health hazard. Multiple complaints filed but no action.',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    sentiment: 'negative', location: 'Borivali East', category: 'drainage',
    engagementScore: 58, linked: false,
  },
  {
    id: 's7', platform: 'news', author: 'Civic Mirror',
    content: 'Virar West road resurfacing project completed ahead of schedule. Residents express satisfaction with improved road quality.',
    timestamp: new Date(Date.now() - 30 * 3600000).toISOString(),
    sentiment: 'positive', location: 'Virar West', category: 'road-conditions',
    engagementScore: 44, linked: false, url: '#',
  },
  {
    id: 's8', platform: 'twitter', author: 'Prerna Desai', handle: '@prernadesai',
    content: 'Kandivali West still has broken street lights on Link Road. Women feel unsafe walking at night. @BMCMumbai please fix ASAP!',
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
    sentiment: 'negative', location: 'Kandivali West', category: 'street-lighting',
    engagementScore: 81, linked: false, url: '#',
  },
];

const platformIcons = {
  twitter: <Twitter size={16} />,
  whatsapp: <MessageCircle size={16} />,
  news: <Globe size={16} />,
};

const platformColors = {
  twitter: 'text-blue-400',
  whatsapp: 'text-green-500',
  news: 'text-gray-600',
};

const sentimentColors = {
  positive: { color: '#22c55e', bg: '#f0fdf4', label: 'Positive' },
  negative: { color: '#ef4444', bg: '#fef2f2', label: 'Negative' },
  neutral: { color: '#6b7280', bg: '#f9fafb', label: 'Neutral' },
};

export default function AdminSocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>(DEMO_POSTS);
  const [filter, setFilter] = useState<'all' | 'twitter' | 'whatsapp' | 'news'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = posts.filter(p => {
    if (filter !== 'all' && p.platform !== filter) return false;
    if (sentimentFilter !== 'all' && p.sentiment !== sentimentFilter) return false;
    return true;
  });

  const sentimentSummary = {
    positive: posts.filter(p => p.sentiment === 'positive').length,
    negative: posts.filter(p => p.sentiment === 'negative').length,
    neutral: posts.filter(p => p.sentiment === 'neutral').length,
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleLink = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, linked: true } : p));
  };

  return (
    <div>
      <PageHeader
        title="Social Media Intelligence"
        subtitle="Monitor civic complaints from Twitter, WhatsApp groups, and news sources"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
          <p className="text-xs text-gray-500">Total Posts</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{sentimentSummary.positive}</p>
          <p className="text-xs text-gray-500">Positive</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{sentimentSummary.negative}</p>
          <p className="text-xs text-gray-500">Negative</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{posts.filter(p => p.linked).length}</p>
          <p className="text-xs text-gray-500">Linked to Complaints</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">
            {Math.round(posts.reduce((s, p) => s + p.engagementScore, 0) / posts.length)}
          </p>
          <p className="text-xs text-gray-500">Avg Engagement</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({posts.length})
        </Button>
        <Button
          variant={filter === 'twitter' ? 'primary' : 'secondary'}
          size="sm"
          icon={<Twitter size={14} />}
          onClick={() => setFilter('twitter')}
        >
          Twitter
        </Button>
        <Button
          variant={filter === 'whatsapp' ? 'primary' : 'secondary'}
          size="sm"
          icon={<MessageCircle size={14} />}
          onClick={() => setFilter('whatsapp')}
        >
          WhatsApp
        </Button>
        <Button
          variant={filter === 'news' ? 'primary' : 'secondary'}
          size="sm"
          icon={<Globe size={14} />}
          onClick={() => setFilter('news')}
        >
          News
        </Button>

        <div className="border-l border-gray-200 h-6 mx-1" />

        <select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value as typeof sentimentFilter)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
        >
          <option value="all">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
          <option value="neutral">Neutral</option>
        </select>

        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filtered.map((post) => {
          const sentiment = sentimentColors[post.sentiment];
          return (
            <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition">
              <div className="flex items-start gap-3">
                {/* Platform Icon */}
                <div className={`mt-1 ${platformColors[post.platform]}`}>
                  {platformIcons[post.platform]}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{post.author}</span>
                    {post.handle && <span className="text-xs text-gray-400">{post.handle}</span>}
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{format(new Date(post.timestamp), 'MMM dd, h:mm a')}</span>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-700 mb-2">{post.content}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ color: sentiment.color, backgroundColor: sentiment.bg }}
                    >
                      {post.sentiment === 'positive' ? <ThumbsUp size={10} className="inline mr-1" /> : post.sentiment === 'negative' ? <ThumbsDown size={10} className="inline mr-1" /> : null}
                      {sentiment.label}
                    </span>

                    {post.location && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin size={10} />{post.location}
                      </span>
                    )}

                    {post.category && (
                      <span className="text-xs text-gray-400 capitalize">{post.category.replace('-', ' ')}</span>
                    )}

                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <TrendingUp size={10} />{post.engagementScore}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-3">
                  {post.linked ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap">✓ Linked</span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleLink(post.id)}
                    >
                      Link
                    </Button>
                  )}
                  {post.url && (
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Globe className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-500 text-sm">No posts match your filters</p>
        </div>
      )}
    </div>
  );
}

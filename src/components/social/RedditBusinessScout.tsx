
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Search, TrendingUp, Users, MessageCircle, ExternalLink, Copy } from 'lucide-react';

interface RedditForum {
  subreddit: string;
  title: string;
  members: number;
  description: string;
  relevanceScore: number;
  activityLevel: 'High' | 'Medium' | 'Low';
  businessOpportunity: string;
  samplePosts: string[];
  rules: string[];
}

interface RedditPost {
  title: string;
  subreddit: string;
  score: number;
  comments: number;
  created: string;
  content: string;
  businessRelevance: string;
}

export const RedditBusinessScout: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('Australia');
  const [industry, setIndustry] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [forums, setForums] = useState<RedditForum[]>([]);
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [selectedForum, setSelectedForum] = useState<string>('');
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a search term to find relevant forums",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);

    try {
      // Simulate API call - in real implementation this would call Reddit API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock data for demonstration
      const mockForums: RedditForum[] = [
        {
          subreddit: 'r/AustralianBusiness',
          title: 'Australian Business',
          members: 45000,
          description: 'A community for Australian business owners and entrepreneurs',
          relevanceScore: 95,
          activityLevel: 'High',
          businessOpportunity: 'Direct marketing to Australian business owners, networking opportunities',
          samplePosts: [
            'Looking for digital marketing services in Sydney',
            'Best accounting software for small Australian businesses',
            'How to navigate Australian business regulations'
          ],
          rules: [
            'No spam or self-promotion without value',
            'Must be Australia-specific',
            'Be respectful and professional'
          ]
        },
        {
          subreddit: 'r/australianbusiness',
          title: 'Australian Business Community',
          members: 28000,
          description: 'Discussion about Australian business environment and opportunities',
          relevanceScore: 88,
          activityLevel: 'Medium',
          businessOpportunity: 'Market research, industry insights, potential partnerships',
          samplePosts: [
            'Trends in Australian retail 2024',
            'Impact of interest rates on small business',
            'Government grants for Australian startups'
          ],
          rules: [
            'Quality content only',
            'No direct advertising',
            'Focus on Australian market'
          ]
        },
        {
          subreddit: 'r/melbourne',
          title: 'Melbourne Community',
          members: 180000,
          description: 'Everything Melbourne - local businesses welcome with valuable content',
          relevanceScore: 72,
          activityLevel: 'High',
          businessOpportunity: 'Local Melbourne market, community engagement, local partnerships',
          samplePosts: [
            'Best local Melbourne services',
            'Melbourne business networking events',
            'Supporting local Melbourne businesses'
          ],
          rules: [
            'Must be Melbourne-relevant',
            'No spam',
            'Community-focused content'
          ]
        }
      ];

      setForums(mockForums);

      toast({
        title: "Forums found",
        description: `Found ${mockForums.length} relevant forums for your search`,
      });

    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to search Reddit forums. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleForumAnalysis = async (subreddit: string) => {
    setSelectedForum(subreddit);
    
    // Mock recent posts analysis
    const mockPosts: RedditPost[] = [
      {
        title: 'Looking for reliable digital marketing agency in Sydney',
        subreddit: subreddit,
        score: 24,
        comments: 12,
        created: '2 hours ago',
        content: 'Small business owner here looking for help with online presence...',
        businessRelevance: 'Direct lead opportunity - business actively seeking services'
      },
      {
        title: 'Best practices for Australian business compliance',
        subreddit: subreddit,
        score: 45,
        comments: 8,
        created: '5 hours ago',
        content: 'What are the key compliance requirements for Australian businesses...',
        businessRelevance: 'Educational content opportunity - establish expertise'
      },
      {
        title: 'Networking events in Melbourne this month',
        subreddit: subreddit,
        score: 67,
        comments: 23,
        created: '1 day ago',
        content: 'Anyone know of good business networking events coming up...',
        businessRelevance: 'Community engagement opportunity - build local connections'
      }
    ];

    setPosts(mockPosts);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Reddit Business Scout
          </CardTitle>
          <CardDescription>
            Find Australian Reddit forums and communities where your business can connect with potential customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Term</Label>
              <Input
                id="search"
                placeholder="e.g., healthcare, dental, physio"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Australia, Sydney, Melbourne"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry (Optional)</Label>
              <Input
                id="industry"
                placeholder="healthcare, business, finance"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full"
          >
            {isSearching ? 'Searching Reddit...' : 'Find Business Opportunities'}
          </Button>
        </CardContent>
      </Card>

      {forums.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Relevant Reddit Communities</CardTitle>
            <CardDescription>
              Forums where your business could find opportunities in Australia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forums.map((forum, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{forum.subreddit}</h3>
                      <p className="text-sm text-muted-foreground">{forum.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={forum.relevanceScore > 90 ? "default" : "secondary"}>
                        {forum.relevanceScore}% match
                      </Badge>
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        {forum.members.toLocaleString()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Business Opportunity</h4>
                      <p className="text-sm text-muted-foreground">{forum.businessOpportunity}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Activity Level</h4>
                      <Badge variant={forum.activityLevel === 'High' ? 'default' : 'secondary'}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {forum.activityLevel}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium">Sample Recent Posts</h4>
                    {forum.samplePosts.map((post, postIndex) => (
                      <div key={postIndex} className="text-sm p-2 bg-muted rounded flex items-center justify-between">
                        <span>"{post}"</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(post)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleForumAnalysis(forum.subreddit)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Analyze Recent Posts
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://reddit.com/${forum.subreddit}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Forum
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {posts.length > 0 && selectedForum && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts Analysis - {selectedForum}</CardTitle>
            <CardDescription>
              Recent posts that might present business opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{post.title}</h3>
                    <Badge variant="outline">{post.created}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm">👍 {post.score}</span>
                    <span className="text-sm">💬 {post.comments}</span>
                  </div>

                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Business Opportunity:</strong> {post.businessRelevance}
                    </AlertDescription>
                  </Alert>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

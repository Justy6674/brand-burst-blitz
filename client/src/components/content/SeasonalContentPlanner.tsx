import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, TrendingUp, Zap, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

interface SeasonalEvent {
  id: string;
  name: string;
  date: string;
  type: "financial" | "holiday" | "industry" | "cultural" | "sporting";
  industry?: string[];
  description: string;
  contentIdeas: string[];
  keywords: string[];
  priority: "high" | "medium" | "low";
}

interface ContentPlan {
  month: string;
  events: SeasonalEvent[];
  contentSuggestions: {
    blog: string[];
    social: string[];
    email: string[];
  };
  keywords: string[];
}

const AUSTRALIAN_SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: "eofy",
    name: "End of Financial Year (EOFY)",
    date: "June 30",
    type: "financial",
    industry: ["all"],
    description: "Major tax and business planning period for all Australian businesses",
    contentIdeas: [
      "EOFY tax deduction checklist",
      "Business expense review guide",
      "Asset purchase timing tips",
      "Accounting software comparisons",
      "Cash flow preparation for new FY"
    ],
    keywords: ["EOFY", "tax deductions", "business expenses", "financial year", "Australian tax"],
    priority: "high"
  },
  {
    id: "christmas",
    name: "Christmas Season",
    date: "December 25",
    type: "holiday",
    industry: ["retail", "hospitality", "services"],
    description: "Peak shopping and social season in Australia",
    contentIdeas: [
      "Christmas opening hours announcement",
      "Holiday gift guides for local businesses",
      "Staff Christmas party planning",
      "Year-end customer appreciation",
      "Boxing Day sale preparation"
    ],
    keywords: ["Christmas", "holiday shopping", "gift guide", "Boxing Day", "festive season"],
    priority: "high"
  },
  {
    id: "australia-day",
    name: "Australia Day",
    date: "January 26",
    type: "cultural",
    industry: ["hospitality", "retail", "community"],
    description: "National day celebrating Australian culture and community",
    contentIdeas: [
      "Supporting local Australian businesses",
      "Community involvement and giving back",
      "Australian-made product showcases",
      "Local history and heritage content",
      "Australia Day event partnerships"
    ],
    keywords: ["Australia Day", "Australian-made", "local business", "community", "patriotic"],
    priority: "medium"
  },
  {
    id: "melbourne-cup",
    name: "Melbourne Cup",
    date: "First Tuesday November",
    type: "sporting",
    industry: ["hospitality", "fashion", "events"],
    description: "The race that stops a nation - major social and business event",
    contentIdeas: [
      "Melbourne Cup workplace celebrations",
      "Fashion and style guides for the races",
      "Corporate entertainment options",
      "Responsible gambling messaging",
      "Networking event opportunities"
    ],
    keywords: ["Melbourne Cup", "spring racing", "corporate events", "fashion", "networking"],
    priority: "medium"
  },
  {
    id: "tax-time",
    name: "Tax Time",
    date: "July-October",
    type: "financial",
    industry: ["accounting", "finance", "business services"],
    description: "Individual tax return period driving business service demand",
    contentIdeas: [
      "Tax return preparation checklists",
      "Deduction maximization strategies",
      "Document organization tips",
      "ATO updates and changes",
      "Small business tax obligations"
    ],
    keywords: ["tax return", "ATO", "deductions", "tax preparation", "Australian taxation"],
    priority: "high"
  },
  {
    id: "back-to-school",
    name: "Back to School",
    date: "January-February",
    type: "industry",
    industry: ["retail", "education", "families"],
    description: "Major shopping period for families and education sector",
    contentIdeas: [
      "School supply shopping guides",
      "Educational technology recommendations",
      "Budget-friendly back-to-school tips",
      "Workplace flexibility for parents",
      "Student discount programs"
    ],
    keywords: ["back to school", "education", "school supplies", "student", "family budget"],
    priority: "medium"
  }
];

const INDUSTRIES = [
  "Trades & Construction", "Retail & Ecommerce", "Hospitality & Food", 
  "Professional Services", "Health & Wellness", "Education & Training",
  "Accounting & Finance", "Real Estate", "Automotive", "Technology"
];

export function SeasonalContentPlanner() {
  const { toast } = useToast();
  const { currentProfile } = useBusinessProfile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessName, setBusinessName] = useState(currentProfile?.business_name || "");
  const [industry, setIndustry] = useState(currentProfile?.industry || "");
  const [location, setLocation] = useState("");
  const [contentPlan, setContentPlan] = useState<ContentPlan[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const generateAnnualPlan = async () => {
    if (!businessName || !industry) {
      toast({
        title: "Missing Information",
        description: "Please fill in business name and industry",
        variant: "destructive"
      });
      return;
    }

    if (!currentProfile) {
      toast({
        title: "Authentication Required",
        description: "Please log in and select a business profile",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Filter events relevant to the business
      const relevantEvents = AUSTRALIAN_SEASONAL_EVENTS.filter(event => 
        event.industry?.includes("all") || 
        event.industry?.some(ind => industry.toLowerCase().includes(ind.toLowerCase()))
      );

      // Generate monthly content plans
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      const yearPlan: ContentPlan[] = [];

      for (const month of months) {
        const monthEvents = relevantEvents.filter(event => {
          if (event.date.includes(month)) return true;
          if (month === "June" && event.id === "eofy") return true;
          if (month === "November" && event.id === "melbourne-cup") return true;
          if (month === "December" && event.id === "christmas") return true;
          if (month === "January" && (event.id === "australia-day" || event.id === "back-to-school")) return true;
          if (["July", "August", "September", "October"].includes(month) && event.id === "tax-time") return true;
          return false;
        });

        // Generate content suggestions based on events and industry
        const blogSuggestions = [];
        const socialSuggestions = [];
        const emailSuggestions = [];
        const monthKeywords = [];

        if (monthEvents.length > 0) {
          for (const event of monthEvents) {
            blogSuggestions.push(...event.contentIdeas.slice(0, 2));
            monthKeywords.push(...event.keywords);
            
            socialSuggestions.push(
              `Preparing for ${event.name}? Here's what ${businessName} recommends...`,
              `It's ${event.name} season! Time to ${event.contentIdeas[0].toLowerCase()}`,
              `${businessName} is ready for ${event.name}. Are you?`
            );

            emailSuggestions.push(
              `${event.name} Preparation Guide for ${industry} Businesses`,
              `Don't Miss Out: ${event.name} Opportunities for ${businessName} Clients`,
              `Your ${event.name} Action Plan from ${businessName}`
            );
          }
        } else {
          // General monthly content for the industry
          blogSuggestions.push(
            `${month} ${industry} Industry Trends and Insights`,
            `${businessName}: What to Focus on This ${month}`,
            `${month} Tips for ${industry} Success in Australia`
          );

          socialSuggestions.push(
            `Happy ${month}! What are your business goals this month?`,
            `${month} motivation: Let's make this month count!`,
            `${businessName} wishes you a productive ${month}`
          );

          emailSuggestions.push(
            `${businessName} ${month} Newsletter: Industry Updates`,
            `Your ${month} Business Success Guide`,
            `${month} Opportunities in the ${industry} Sector`
          );

          monthKeywords.push(
            `${month.toLowerCase()} ${industry.toLowerCase()}`,
            `australian ${industry.toLowerCase()}`,
            "business tips",
            "monthly planning"
          );
        }

        yearPlan.push({
          month,
          events: monthEvents,
          contentSuggestions: {
            blog: blogSuggestions.slice(0, 4),
            social: socialSuggestions.slice(0, 6),
            email: emailSuggestions.slice(0, 3)
          },
          keywords: [...new Set(monthKeywords)].slice(0, 8)
        });
      }

      setContentPlan(yearPlan);

      toast({
        title: "Annual Content Plan Generated!",
        description: `Created 12-month content strategy for ${businessName}`,
      });

    } catch (error) {
      console.error('Error generating content plan:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadContentPlan = () => {
    const planText = contentPlan.map(month => `
${month.month.toUpperCase()} ${selectedYear}
${'='.repeat(month.month.length + 5)}

SEASONAL EVENTS:
${month.events.length > 0 
  ? month.events.map(event => `• ${event.name} (${event.date}): ${event.description}`).join('\n')
  : '• No major seasonal events this month'
}

BLOG CONTENT IDEAS:
${month.contentSuggestions.blog.map(idea => `• ${idea}`).join('\n')}

SOCIAL MEDIA POSTS:
${month.contentSuggestions.social.map(idea => `• ${idea}`).join('\n')}

EMAIL CAMPAIGNS:
${month.contentSuggestions.email.map(idea => `• ${idea}`).join('\n')}

KEY KEYWORDS:
${month.keywords.map(keyword => `#${keyword.replace(/\s+/g, '')}`).join(', ')}

`).join('\n');

    const fullPlan = `
${businessName.toUpperCase()} - ANNUAL CONTENT PLAN ${selectedYear}
${'='.repeat(businessName.length + 30)}

Industry: ${industry}
Location: ${location || 'Australia'}
Generated: ${new Date().toLocaleDateString()}

This content plan is specifically designed for Australian businesses and includes:
- Seasonal Australian events and holidays
- Industry-specific content opportunities
- EOFY, tax time, and financial year considerations
- Local cultural and sporting events
- Monthly content suggestions across blog, social, and email

${planText}

CONTENT CREATION TIPS:
• Plan content 2-4 weeks in advance
• Customize each piece for your specific audience
• Monitor Australian trends and current events
• Engage with local community events
• Always include clear calls-to-action
• Track performance and adjust strategy

Generated by JBSAAS Seasonal Content Planner
Visit your dashboard to generate actual content from these ideas.
`;

    const blob = new Blob([fullPlan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName.replace(/\s+/g, '-')}-annual-content-plan-${selectedYear}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "financial": return "💰";
      case "holiday": return "🎄";
      case "cultural": return "🇦🇺";
      case "sporting": return "🏇";
      case "industry": return "🏢";
      default: return "📅";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Australian Seasonal Content Planner</h1>
        <p className="text-muted-foreground">
          Generate a 12-month content strategy based on Australian business calendar
        </p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Tell us about your business to create a personalized annual content plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business Name"
              />
            </div>
            
            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year">Planning Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Sydney, Melbourne, Brisbane"
            />
          </div>

          <Button 
            onClick={generateAnnualPlan} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Generating Annual Content Plan...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Generate 12-Month Content Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Content Plan Results */}
      {contentPlan.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your {selectedYear} Content Plan</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadContentPlan}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Plan
                </Button>
              </div>
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">12 Months Planned</Badge>
              <Badge variant="secondary">Australian Focused</Badge>
              <Badge variant="secondary">{industry} Optimized</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="monthly">Monthly Details</TabsTrigger>
                <TabsTrigger value="events">Seasonal Events</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contentPlan.map((month, index) => (
                    <Card key={index} className="relative">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{month.month}</CardTitle>
                        {month.events.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {month.events.map((event, eventIndex) => (
                              <Badge key={eventIndex} variant="outline" className="text-xs">
                                {getEventIcon(event.type)} {event.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Blog:</span> {month.contentSuggestions.blog.length} ideas
                          </div>
                          <div>
                            <span className="font-medium">Social:</span> {month.contentSuggestions.social.length} posts
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {month.contentSuggestions.email.length} campaigns
                          </div>
                          <div>
                            <span className="font-medium">Keywords:</span> {month.keywords.length} targets
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="mt-6">
                <div className="space-y-6">
                  {contentPlan.map((month, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {getEventIcon(month.events[0]?.type || "industry")} {month.month} {selectedYear}
                        </CardTitle>
                        {month.events.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Key Events: {month.events.map(e => e.name).join(", ")}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              📝 Blog Content Ideas
                            </h4>
                            <ul className="space-y-2 text-sm">
                              {month.contentSuggestions.blog.map((idea, ideaIndex) => (
                                <li key={ideaIndex} className="flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  {idea}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              📱 Social Media Posts
                            </h4>
                            <ul className="space-y-2 text-sm">
                              {month.contentSuggestions.social.map((post, postIndex) => (
                                <li key={postIndex} className="flex items-start gap-2">
                                  <span className="text-blue-500">•</span>
                                  {post}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              📧 Email Campaigns
                            </h4>
                            <ul className="space-y-2 text-sm">
                              {month.contentSuggestions.email.map((email, emailIndex) => (
                                <li key={emailIndex} className="flex items-start gap-2">
                                  <span className="text-green-500">•</span>
                                  {email}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-semibold mb-2">Target Keywords:</h4>
                          <div className="flex flex-wrap gap-1">
                            {month.keywords.map((keyword, keyIndex) => (
                              <Badge key={keyIndex} variant="outline" className="text-xs">
                                #{keyword.replace(/\s+/g, '')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="events" className="mt-6">
                <div className="space-y-4">
                  {AUSTRALIAN_SEASONAL_EVENTS
                    .filter(event => 
                      event.industry?.includes("all") || 
                      event.industry?.some(ind => industry.toLowerCase().includes(ind.toLowerCase()))
                    )
                    .map((event, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                              {getEventIcon(event.type)} {event.name}
                            </h3>
                            <p className="text-muted-foreground mb-3">{event.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline">{event.date}</Badge>
                              <Badge className={getPriorityColor(event.priority)}>
                                {event.priority} priority
                              </Badge>
                              <Badge variant="secondary">{event.type}</Badge>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium">Content Opportunities:</h4>
                              <ul className="text-sm space-y-1">
                                {event.contentIdeas.map((idea, ideaIndex) => (
                                  <li key={ideaIndex} className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    {idea}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="keywords" className="mt-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Annual Keyword Strategy</CardTitle>
                      <CardDescription>
                        All keywords from your 12-month content plan organized by frequency and relevance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* High Priority Keywords */}
                        <div>
                          <h4 className="font-semibold mb-3">🎯 High Priority Keywords (Year-round)</h4>
                          <div className="flex flex-wrap gap-2">
                            {[
                              `${industry.toLowerCase()}`,
                              "australian business",
                              "local service",
                              businessName.toLowerCase(),
                              "business tips"
                            ].map((keyword, index) => (
                              <Badge key={index} variant="default">
                                #{keyword.replace(/\s+/g, '')}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Seasonal Keywords */}
                        <div>
                          <h4 className="font-semibold mb-3">📅 Seasonal Keywords</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                              { season: "Q1 (Jan-Mar)", keywords: ["australia day", "back to school", "new year planning", "q1 goals"] },
                              { season: "Q2 (Apr-Jun)", keywords: ["eofy", "tax deductions", "business expenses", "financial planning"] },
                              { season: "Q3 (Jul-Sep)", keywords: ["tax time", "new financial year", "business strategy", "winter planning"] },
                              { season: "Q4 (Oct-Dec)", keywords: ["melbourne cup", "christmas", "holiday season", "year end review"] }
                            ].map((quarter, index) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <h5 className="font-medium mb-2">{quarter.season}</h5>
                                <div className="flex flex-wrap gap-1">
                                  {quarter.keywords.map((keyword, keyIndex) => (
                                    <Badge key={keyIndex} variant="outline" className="text-xs">
                                      #{keyword.replace(/\s+/g, '')}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Monthly Keyword Distribution */}
                        <div>
                          <h4 className="font-semibold mb-3">📊 Monthly Keyword Distribution</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {contentPlan.map((month, index) => (
                              <div key={index} className="text-center p-2 border rounded">
                                <div className="font-medium text-sm">{month.month.slice(0, 3)}</div>
                                <div className="text-xs text-muted-foreground">{month.keywords.length} keywords</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Calendar, 
  Sparkles, 
  FileText, 
  Image, 
  Video,
  Hash,
  Clock,
  Target,
  Coffee,
  Briefcase,
  Heart,
  Users,
  TrendingUp,
  Star,
  Download
} from 'lucide-react';

interface ContentTemplate {
  id: string;
  title: string;
  category: string;
  platform: string[];
  description: string;
  content: string;
  hashtags: string[];
  best_time: string;
  engagement_tip: string;
  australian_twist: string;
}

const AustralianContentTemplates = () => {
  const [selectedCategory, setSelectedCategory] = useState('business');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);

  const templates: ContentTemplate[] = [
    {
      id: 'monday-motivation',
      title: 'Monday Motivation - Australian Business',
      category: 'business',
      platform: ['Facebook', 'LinkedIn', 'Instagram'],
      description: 'Start the week with Australian business inspiration',
      content: `🇦🇺 MONDAY MOTIVATION - AUSTRALIAN BUSINESS SPIRIT! ☕

Starting a new week with purpose and determination. 💪

Whether you're running a business from the bustling streets of Sydney, the creative laneways of Melbourne, or anywhere in between, remember that every great Australian success story started with someone who took the initiative.

This week, challenge yourself to:
✅ Connect with one new potential customer
✅ Improve one aspect of your business
✅ Support a fellow Australian business owner

Success isn't about being perfect - it's about showing up consistently and giving your best effort.

What's your primary goal for this week? Share it in the comments and let's support each other! 👇

#MondayMotivation #AustralianBusiness #SmallBusinessAustralia #Entrepreneurship #BusinessGoals #SupportLocal`,
      hashtags: ['#MondayMotivation', '#AustralianBusiness', '#SmallBusinessAustralia', '#Entrepreneurship', '#BusinessGoals', '#SupportLocal'],
      best_time: '8:00 AM AEST',
      engagement_tip: 'Ask followers to share their weekly goals to boost comments',
      australian_twist: 'References Australian cities and business culture professionally'
    },
    {
      id: 'friday-feature',
      title: 'Friday Feature - Local Business Spotlight',
      category: 'community',
      platform: ['Instagram', 'Facebook'],
      description: 'Highlight amazing local Australian businesses',
      content: `🌟 FRIDAY FEATURE - LOCAL BUSINESS SPOTLIGHT! 🇦🇺

This week we're highlighting an exceptional local business that's making a real difference in our community! 

[Insert Local Business Name] has been serving [Location] with dedication and excellence, and they deserve recognition! 👏

What makes them special:
🔸 [Insert unique selling point]
🔸 [Insert community contribution]
🔸 [Insert quality/service highlight]

When you support local businesses like this, you're not just getting excellent [product/service] - you're investing in your community and helping build stronger Australian businesses.

Have you checked them out yet? Tag a friend who needs to know about this business! 💎

Show some appreciation in the comments for [Business Name]! 👇

#FridayFeature #SupportLocal #AustralianBusiness #CommunityLove #LocalBusiness #SmallBusiness #ProudlyAustralian`,
      hashtags: ['#FridayFeature', '#SupportLocal', '#AustralianBusiness', '#CommunityLove', '#LocalBusiness', '#SmallBusiness', '#ProudlyAustralian'],
      best_time: '5:00 PM AEST',
      engagement_tip: 'Tag the featured business and encourage followers to tag friends',
      australian_twist: 'Emphasises community support and local business culture'
    },
    {
      id: 'australia-day',
      title: 'Australia Day Business Celebration',
      category: 'seasonal',
      platform: ['Facebook', 'Instagram', 'LinkedIn'],
      description: 'Celebrate Australia Day with business pride',
      content: `🇦🇺 HAPPY AUSTRALIA DAY! 🇦🇺

Today we celebrate the land of opportunity, innovation, and the best business community in the world! 

As a proud Australian business, we're grateful to be part of a nation that encourages entrepreneurship, supports small business, and values dedicated hard work.

From the bustling business districts of our major cities to the innovative startups in regional towns, Australian businesses are making their mark on the world stage.

Today, let's celebrate:
🌟 The Australian spirit of initiative and innovation
🤝 Our supportive business community
💡 Innovation and creativity
🌏 Our global business success stories

Whether you're enjoying a barbecue, heading to a local event, or just taking a well-deserved break, take a moment to appreciate the incredible business opportunities we have in this great nation.

Cheers to Australia and all the amazing businesses that make it great! 🥂

What do you love most about doing business in Australia? Share below! 👇

#AustraliaDay #ProudlyAustralian #AustralianBusiness #BusinessCommunity #Innovation #Entrepreneurship`,
      hashtags: ['#AustraliaDay', '#ProudlyAustralian', '#AustralianBusiness', '#BusinessCommunity', '#Innovation', '#Entrepreneurship'],
      best_time: '10:00 AM AEST',
      engagement_tip: 'Ask what people love about Australian business culture',
      australian_twist: 'Australia Day theming with business focus and cultural references'
    },
    {
      id: 'coffee-culture',
      title: 'Australian Coffee Culture & Business',
      category: 'culture',
      platform: ['Instagram', 'Facebook'],
      description: 'Connect business networking with coffee culture',
      content: `☕ COFFEE & BUSINESS - THE AUSTRALIAN WAY! ☕

Some of the best business deals in Australia happen over a proper cup of coffee! ☕✨

There's something special about Australian coffee culture - whether it's a flat white in a Melbourne laneway café, a long black in a Sydney CBD spot, or a cappuccino at your local, coffee brings business people together.

Fun fact: Australia has one of the world's most sophisticated coffee cultures, and it shows in how we do business too! 🇦🇺

Here's why coffee meetings work so well for Australian businesses:
• Relaxed atmosphere encourages honest conversation
• Quality coffee shows you value the relationship
• Local cafés support community businesses
• Perfect for those quick catch-ups that turn into partnerships

This week's challenge: Instead of a formal meeting, invite a potential collaborator for coffee at a great local café. You'll be supporting local business while building your network! 

What's your go-to coffee order for business meetings? Share it below! 👇

#CoffeeCulture #AustralianBusinessNetworking #SupportLocal #BusinessMeetings #FlatWhite #Networking #CommunityBusiness`,
      hashtags: ['#CoffeeCulture', '#AustralianBusinessNetworking', '#SupportLocal', '#BusinessMeetings', '#FlatWhite', '#Networking', '#CommunityBusiness'],
      best_time: '7:30 AM AEST',
      engagement_tip: 'Ask about coffee preferences and favourite café meeting spots',
      australian_twist: 'Focuses on unique Australian coffee culture with specific coffee types like flat white'
    },
    {
      id: 'school-holidays',
      title: 'School Holidays & Business Flexibility',
      category: 'family',
      platform: ['LinkedIn', 'Facebook'],
      description: 'Address work-life balance during Australian school holidays',
      content: `🎒 SCHOOL HOLIDAYS ARE HERE! 🇦🇺

For many Australian business owners and employees, school holidays mean juggling work commitments with family time. And that's completely understandable! 

Australian businesses are increasingly recognising that flexibility isn't just a nice-to-have - it's essential for keeping our teams happy and productive.

Here's how smart Australian businesses handle school holiday season:
✅ Flexible working hours for parents
✅ Remote work options when possible
✅ Job sharing arrangements
✅ Understanding that children might occasionally appear on video calls (we've all been there!)

To our fellow business owners: Remember that supporting your team's family commitments builds incredible loyalty and reflects strong Australian values.

To working parents: Don't stress about achieving perfect balance - just do your best and communicate with your team.

The beauty of Australian business culture is that we understand families come first, and when we support each other, everyone wins! 

How does your business handle school holiday flexibility? Share your tips below! 👇

#SchoolHolidays #WorkLifeBalance #FlexibleWork #AustralianFamilies #BusinessCulture #SupportiveWorkplace`,
      hashtags: ['#SchoolHolidays', '#WorkLifeBalance', '#FlexibleWork', '#AustralianFamilies', '#BusinessCulture', '#SupportiveWorkplace'],
      best_time: '6:00 PM AEST',
      engagement_tip: 'Encourage sharing of family-friendly business practices',
      australian_twist: 'Addresses specifically Australian school holiday timing + family-first business culture'
    },
    {
      id: 'bushfire-support',
      title: 'Community Support During Tough Times',
      category: 'community',
      platform: ['Facebook', 'LinkedIn', 'Instagram'],
      description: 'Show business community support during Australian emergencies',
      content: `❤️ AUSTRALIAN BUSINESSES SUPPORTING COMMUNITIES ❤️

When times get tough, the Australian business community shows its true character - and it's inspiring to see! 🇦🇺

Whether it's bushfires, floods, or other challenges our communities face, Australian businesses consistently step up to support each other. This is what makes our business community special.

Ways businesses can support during tough times:
🤝 Donate a percentage of sales to relief efforts
💰 Offer services at cost or pro-bono to affected businesses
🛍️ Promote and buy from businesses in affected areas
📢 Use your platform to raise awareness
🏠 Provide temporary workspace for displaced businesses
❤️ Simply check in on your business network

It's not about the size of your contribution - it's about the Australian spirit of community and looking out for each other.

To businesses currently facing challenges: You're not alone. The Australian business community has your back.

To everyone else: Let's think about how we can support our fellow business owners who might be experiencing difficulties right now.

Together, we're stronger. That's the Australian way! 💪

#CommunitySupport #AustralianBusiness #Community #StrongerTogether #BusinessCommunity #SupportLocal`,
      hashtags: ['#CommunitySupport', '#AustralianBusiness', '#Community', '#StrongerTogether', '#BusinessCommunity', '#SupportLocal'],
      best_time: '12:00 PM AEST',
      engagement_tip: 'Ask how businesses can support each other in their community',
      australian_twist: 'Emphasises community support culture during natural disasters'
    }
  ];

  const categories = [
    { id: 'business', name: 'Business', icon: Briefcase },
    { id: 'community', name: 'Community', icon: Users },
    { id: 'seasonal', name: 'Seasonal', icon: Calendar },
    { id: 'culture', name: 'Culture', icon: Coffee },
    { id: 'family', name: 'Family', icon: Heart }
  ];

  const filteredTemplates = templates.filter(template => template.category === selectedCategory);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-primary" />
            Australian Content Templates
          </CardTitle>
          <p className="text-muted-foreground">
            Ready-to-use content templates tailored for Australian businesses and culture
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <div className="grid gap-4">
                  {filteredTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{template.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {template.platform.map((platform) => (
                              <Badge key={platform} variant="secondary" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Best time: {template.best_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-muted-foreground" />
                            <span>{template.hashtags.length} hashtags</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <span>Australian focus</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {selectedTemplate && (
            <Card className="mt-6 border-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    {selectedTemplate.title}
                  </CardTitle>
                  <Button className="bg-gradient-primary">
                    <Download className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Preview */}
                <div>
                  <h4 className="font-medium mb-3">Content Preview</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {selectedTemplate.content}
                    </pre>
                  </div>
                </div>

                {/* Template Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Hashtags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.hashtags.map((hashtag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {hashtag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Optimal Timing
                    </h4>
                    <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                      Post at: <strong>{selectedTemplate.best_time}</strong>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Engagement Tip
                    </h4>
                    <p className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      {selectedTemplate.engagement_tip}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Australian Twist
                    </h4>
                    <p className="text-sm bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                      {selectedTemplate.australian_twist}
                    </p>
                  </div>
                </div>

                {/* Customization Tips */}
                <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Customization Tips
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Replace [brackets] with your specific business details</li>
                      <li>• Add your local area or city references</li>
                      <li>• Include your brand voice and personality</li>
                      <li>• Adjust timing for your specific Australian timezone</li>
                      <li>• Add relevant industry-specific hashtags</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AustralianContentTemplates;
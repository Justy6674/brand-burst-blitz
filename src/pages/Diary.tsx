import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Calendar, Search, Star, Trash2 } from 'lucide-react';

export default function Diary() {
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: '2024-01-20',
      title: 'Business Strategy Meeting',
      content: 'Had a great meeting with the team today. Discussed Q1 objectives and new marketing strategies. Feeling optimistic about the direction we\'re heading.',
      mood: 'positive',
      tags: ['business', 'strategy', 'team']
    },
    {
      id: 2,
      date: '2024-01-19',
      title: 'Content Creation Ideas',
      content: 'Brainstormed some new content ideas for social media. Need to focus more on behind-the-scenes content and customer success stories.',
      mood: 'creative',
      tags: ['content', 'ideas', 'social media']
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral'
  });

  const [showNewEntry, setShowNewEntry] = useState(false);

  const handleAddEntry = () => {
    if (newEntry.title && newEntry.content) {
      const entry = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood,
        tags: []
      };
      setEntries([entry, ...entries]);
      setNewEntry({ title: '', content: '', mood: 'neutral' });
      setShowNewEntry(false);
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'creative': return 'bg-purple-100 text-purple-800';
      case 'productive': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
            Daily Diary
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Capture your daily thoughts, ideas, and business insights
          </p>
        </div>
        <Button 
          onClick={() => setShowNewEntry(!showNewEntry)}
          size="sm"
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* New Entry Form */}
      {showNewEntry && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Write New Entry</CardTitle>
            <CardDescription>What's on your mind today?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Entry title..."
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
            />
            <Textarea
              placeholder="Write your thoughts here..."
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              className="min-h-32"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <select
                  value={newEntry.mood}
                  onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="positive">😊 Positive</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="creative">🎨 Creative</option>
                  <option value="productive">⚡ Productive</option>
                  <option value="negative">😔 Challenging</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowNewEntry(false)} size="sm">
                  Cancel
                </Button>
                <Button onClick={handleAddEntry} size="sm">
                  Save Entry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your entries..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Entries Grid */}
      <div className="grid gap-4 md:gap-6">
        {entries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{entry.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                    <Badge className={getMoodColor(entry.mood)} variant="secondary">
                      {entry.mood}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {entry.content}
              </p>
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {entry.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {entries.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No entries yet</h3>
            <p className="text-muted-foreground mb-4">
              Start documenting your daily business insights and thoughts
            </p>
            <Button onClick={() => setShowNewEntry(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Write Your First Entry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
-- Healthcare Idea Concepts Table for Smart Ideas Sketchboard
-- This table stores voice, sketch, and text ideas captured by healthcare professionals
-- along with AI analysis and generated content suggestions

CREATE TABLE healthcare_idea_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_id TEXT NOT NULL, -- Can reference multiple practices
    
    -- Core idea data
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Original idea content
    type TEXT NOT NULL CHECK (type IN ('voice', 'sketch', 'text')),
    
    -- Type-specific data
    voice_transcript TEXT, -- For voice ideas
    sketch_data TEXT, -- Base64 canvas data for sketches
    
    -- AI processing results
    ai_analysis TEXT, -- AI interpretation of the idea
    content_suggestions JSONB, -- Platform-specific content suggestions
    ahpra_compliance_score INTEGER CHECK (ahpra_compliance_score >= 0 AND ahpra_compliance_score <= 100),
    
    -- Processing status
    status TEXT NOT NULL DEFAULT 'captured' CHECK (status IN ('captured', 'analyzed', 'converted', 'published')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX idx_healthcare_idea_concepts_user_id ON healthcare_idea_concepts(user_id);
CREATE INDEX idx_healthcare_idea_concepts_practice_id ON healthcare_idea_concepts(practice_id);
CREATE INDEX idx_healthcare_idea_concepts_type ON healthcare_idea_concepts(type);
CREATE INDEX idx_healthcare_idea_concepts_status ON healthcare_idea_concepts(status);
CREATE INDEX idx_healthcare_idea_concepts_created_at ON healthcare_idea_concepts(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE healthcare_idea_concepts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own idea concepts
CREATE POLICY "Users can view their own healthcare idea concepts" ON healthcare_idea_concepts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own healthcare idea concepts" ON healthcare_idea_concepts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own healthcare idea concepts" ON healthcare_idea_concepts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own healthcare idea concepts" ON healthcare_idea_concepts
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_healthcare_idea_concepts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_healthcare_idea_concepts_updated_at
    BEFORE UPDATE ON healthcare_idea_concepts
    FOR EACH ROW
    EXECUTE FUNCTION update_healthcare_idea_concepts_updated_at();

-- Comments for documentation
COMMENT ON TABLE healthcare_idea_concepts IS 'Stores healthcare professional ideas captured via voice, sketch, or text with AI analysis and content suggestions';
COMMENT ON COLUMN healthcare_idea_concepts.content_suggestions IS 'JSONB object containing AI-generated content for different platforms (blog_post, facebook_post, instagram_post, linkedin_post)';
COMMENT ON COLUMN healthcare_idea_concepts.ahpra_compliance_score IS 'AI-calculated compliance score (0-100) based on AHPRA advertising guidelines';
COMMENT ON COLUMN healthcare_idea_concepts.sketch_data IS 'Base64 encoded canvas image data for sketch-type ideas';
COMMENT ON COLUMN healthcare_idea_concepts.voice_transcript IS 'Transcribed text from voice recordings using OpenAI Whisper';

-- Sample content_suggestions structure for documentation:
/*
content_suggestions JSONB structure:
{
  "blog_post": "Full blog post content with title and body...",
  "facebook_post": "Facebook-optimized post with appropriate length...",
  "instagram_post": "Instagram post with hashtags and visual focus...",
  "linkedin_post": "Professional LinkedIn post for healthcare networking..."
}
*/ 
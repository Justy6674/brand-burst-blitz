-- Healthcare Video Tutorials Migration
-- Professional onboarding and training video system

-- Healthcare Video Tutorials Table
CREATE TABLE healthcare_video_tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER NOT NULL DEFAULT 0, -- seconds
    category TEXT NOT NULL CHECK (category IN ('onboarding', 'compliance', 'content_creation', 'platform_setup', 'advanced')),
    practice_types TEXT[] NOT NULL DEFAULT ARRAY['All'],
    difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    prerequisites TEXT[] DEFAULT '{}',
    learning_outcomes TEXT[] DEFAULT '{}',
    compliance_topics TEXT[] DEFAULT '{}',
    is_required BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Healthcare Video Progress Table
CREATE TABLE healthcare_video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tutorial_id UUID NOT NULL REFERENCES healthcare_video_tutorials(id) ON DELETE CASCADE,
    watched_duration INTEGER DEFAULT 0, -- seconds
    completed BOOLEAN DEFAULT false,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    quiz_score INTEGER,
    certificate_issued BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_tutorial_progress UNIQUE(user_id, tutorial_id)
);

-- Healthcare Video Quizzes Table
CREATE TABLE healthcare_video_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutorial_id UUID NOT NULL REFERENCES healthcare_video_tutorials(id) ON DELETE CASCADE,
    questions JSONB NOT NULL DEFAULT '[]',
    passing_score INTEGER DEFAULT 80,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_tutorial_quiz UNIQUE(tutorial_id)
);

-- Healthcare Video Quiz Attempts Table
CREATE TABLE healthcare_video_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES healthcare_video_quizzes(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    answers JSONB NOT NULL DEFAULT '[]',
    score INTEGER NOT NULL DEFAULT 0,
    passed BOOLEAN DEFAULT false,
    time_taken INTEGER, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_quiz_attempt UNIQUE(user_id, quiz_id, attempt_number)
);

-- Healthcare Training Certificates Table
CREATE TABLE healthcare_training_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tutorial_id UUID NOT NULL REFERENCES healthcare_video_tutorials(id) ON DELETE CASCADE,
    certificate_url TEXT,
    issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_date TIMESTAMP WITH TIME ZONE,
    verification_code TEXT UNIQUE,
    compliance_topics TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_certificate UNIQUE(user_id, tutorial_id)
);

-- Insert comprehensive healthcare video tutorials
INSERT INTO healthcare_video_tutorials (
    title, description, video_url, thumbnail_url, duration, category, 
    practice_types, difficulty_level, prerequisites, learning_outcomes, 
    compliance_topics, is_required, order_index
) VALUES 

-- Onboarding Category
('Welcome to JBSAAS Healthcare Platform', 
 'Introduction to the platform features and healthcare-specific compliance requirements',
 '/videos/healthcare/welcome-introduction.mp4',
 '/thumbnails/healthcare/welcome-thumb.jpg',
 480, 'onboarding', ARRAY['All'], 'beginner', ARRAY[],
 ARRAY['Understand platform overview', 'Identify key features', 'Recognize compliance importance'],
 ARRAY['Platform overview', 'General compliance'], true, 1),

('Setting Up Your Healthcare Profile', 
 'Complete guide to setting up your professional profile with AHPRA registration and specialties',
 '/videos/healthcare/profile-setup.mp4',
 '/thumbnails/healthcare/profile-setup-thumb.jpg',
 720, 'onboarding', ARRAY['All'], 'beginner', ARRAY['Welcome to JBSAAS Healthcare Platform'],
 ARRAY['Complete professional profile', 'Upload AHPRA credentials', 'Set practice specialties'],
 ARRAY['AHPRA registration', 'Professional credentials'], true, 2),

('Understanding Healthcare Practice Types', 
 'Learn about different practice types and their specific requirements and workflows',
 '/videos/healthcare/practice-types.mp4',
 '/thumbnails/healthcare/practice-types-thumb.jpg',
 900, 'onboarding', ARRAY['All'], 'beginner', ARRAY['Setting Up Your Healthcare Profile'],
 ARRAY['Identify practice type differences', 'Understand workflow variations', 'Select appropriate settings'],
 ARRAY['Practice classification', 'Workflow compliance'], true, 3),

-- Compliance Category
('AHPRA Advertising Guidelines Masterclass', 
 'Comprehensive training on AHPRA advertising standards for healthcare professionals',
 '/videos/healthcare/ahpra-guidelines.mp4',
 '/thumbnails/healthcare/ahpra-thumb.jpg',
 1800, 'compliance', ARRAY['All'], 'intermediate', ARRAY['Understanding Healthcare Practice Types'],
 ARRAY['Master AHPRA advertising rules', 'Identify compliant content', 'Avoid advertising violations'],
 ARRAY['AHPRA advertising', 'Content compliance', 'Professional standards'], true, 1),

('Patient Privacy and Social Media', 
 'Essential training on maintaining patient privacy while engaging on social media platforms',
 '/videos/healthcare/patient-privacy.mp4',
 '/thumbnails/healthcare/privacy-thumb.jpg',
 1200, 'compliance', ARRAY['All'], 'intermediate', ARRAY['AHPRA Advertising Guidelines Masterclass'],
 ARRAY['Understand privacy obligations', 'Implement privacy protections', 'Handle patient information correctly'],
 ARRAY['Patient privacy', 'HIPAA compliance', 'Social media guidelines'], true, 2),

('TGA Therapeutic Goods Advertising', 
 'Specialized training for healthcare professionals advertising therapeutic goods and treatments',
 '/videos/healthcare/tga-compliance.mp4',
 '/thumbnails/healthcare/tga-thumb.jpg',
 1500, 'compliance', ARRAY['GP', 'Specialist'], 'advanced', ARRAY['Patient Privacy and Social Media'],
 ARRAY['Understand TGA requirements', 'Compliant therapeutic advertising', 'Avoid TGA violations'],
 ARRAY['TGA compliance', 'Therapeutic advertising', 'Medicine promotion'], true, 3),

-- Platform Setup Category
('Connecting Your Social Media Accounts', 
 'Step-by-step guide to securely connecting Facebook, Instagram, and LinkedIn accounts',
 '/videos/healthcare/social-setup.mp4',
 '/thumbnails/healthcare/social-setup-thumb.jpg',
 960, 'platform_setup', ARRAY['All'], 'beginner', ARRAY['Patient Privacy and Social Media'],
 ARRAY['Connect social accounts', 'Configure privacy settings', 'Set up posting schedules'],
 ARRAY['Social media setup', 'Account security'], false, 1),

('WordPress Integration for Healthcare Blogs', 
 'Complete guide to connecting your WordPress website for automated blog publishing',
 '/videos/healthcare/wordpress-integration.mp4',
 '/thumbnails/healthcare/wordpress-thumb.jpg',
 1080, 'platform_setup', ARRAY['All'], 'intermediate', ARRAY['Connecting Your Social Media Accounts'],
 ARRAY['Integrate WordPress site', 'Set up automated publishing', 'Configure SEO settings'],
 ARRAY['Website integration', 'Content management'], false, 2),

('Google My Business for Healthcare Practices', 
 'Optimize your Google My Business listing for healthcare practices with compliance considerations',
 '/videos/healthcare/google-my-business.mp4',
 '/thumbnails/healthcare/gmb-thumb.jpg',
 900, 'platform_setup', ARRAY['GP', 'Allied Health', 'Specialist'], 'beginner', ARRAY['WordPress Integration for Healthcare Blogs'],
 ARRAY['Optimize GMB listing', 'Manage patient reviews', 'Maintain accurate information'],
 ARRAY['Local SEO', 'Online reputation'], false, 3),

-- Content Creation Category
('Creating AHPRA-Compliant Social Media Content', 
 'Learn to create engaging social media content that meets all AHPRA advertising requirements',
 '/videos/healthcare/compliant-content.mp4',
 '/thumbnails/healthcare/compliant-content-thumb.jpg',
 1440, 'content_creation', ARRAY['All'], 'intermediate', ARRAY['AHPRA Advertising Guidelines Masterclass'],
 ARRAY['Create compliant content', 'Use approved language', 'Design engaging posts'],
 ARRAY['Content compliance', 'Social media marketing'], true, 1),

('Patient Education Content Strategy', 
 'Develop effective patient education content that informs without providing medical advice',
 '/videos/healthcare/patient-education.mp4',
 '/thumbnails/healthcare/education-thumb.jpg',
 1200, 'content_creation', ARRAY['All'], 'intermediate', ARRAY['Creating AHPRA-Compliant Social Media Content'],
 ARRAY['Design educational content', 'Balance information and compliance', 'Engage patients effectively'],
 ARRAY['Patient education', 'Health information'], false, 2),

('Building Professional Referral Networks', 
 'Content strategies for building and maintaining professional referral relationships',
 '/videos/healthcare/referral-networks.mp4',
 '/thumbnails/healthcare/referral-thumb.jpg',
 1080, 'content_creation', ARRAY['Specialist', 'Allied Health'], 'advanced', ARRAY['Patient Education Content Strategy'],
 ARRAY['Build referral relationships', 'Create professional content', 'Network effectively'],
 ARRAY['Professional networking', 'Referral marketing'], false, 3),

-- Advanced Category
('Advanced Analytics for Healthcare Marketing', 
 'Deep dive into analytics and performance tracking for healthcare marketing campaigns',
 '/videos/healthcare/advanced-analytics.mp4',
 '/thumbnails/healthcare/analytics-thumb.jpg',
 1800, 'advanced', ARRAY['All'], 'advanced', ARRAY['Building Professional Referral Networks'],
 ARRAY['Interpret marketing data', 'Optimize campaign performance', 'Measure ROI effectively'],
 ARRAY['Analytics', 'Performance optimization'], false, 1),

('Multi-Location Practice Management', 
 'Advanced strategies for managing marketing across multiple practice locations',
 '/videos/healthcare/multi-location.mp4',
 '/thumbnails/healthcare/multi-location-thumb.jpg',
 1500, 'advanced', ARRAY['Group Practice', 'Healthcare Network'], 'advanced', ARRAY['Advanced Analytics for Healthcare Marketing'],
 ARRAY['Coordinate multi-location marketing', 'Maintain brand consistency', 'Manage compliance across locations'],
 ARRAY['Multi-location management', 'Brand consistency'], false, 2),

('Crisis Communication for Healthcare Practices', 
 'Advanced training on managing communication during practice crises or reputation challenges',
 '/videos/healthcare/crisis-communication.mp4',
 '/thumbnails/healthcare/crisis-thumb.jpg',
 1200, 'advanced', ARRAY['All'], 'advanced', ARRAY['Multi-Location Practice Management'],
 ARRAY['Handle crisis situations', 'Protect practice reputation', 'Communicate effectively under pressure'],
 ARRAY['Crisis management', 'Reputation protection'], false, 3);

-- Insert quiz data for required tutorials
INSERT INTO healthcare_video_quizzes (tutorial_id, questions, passing_score, max_attempts) 
SELECT 
    t.id,
    CASE t.title
        WHEN 'Welcome to JBSAAS Healthcare Platform' THEN '[
            {
                "id": "q1",
                "question": "What is the primary purpose of the JBSAAS Healthcare Platform?",
                "options": ["Social media automation", "AHPRA-compliant healthcare marketing", "Patient management", "Billing software"],
                "correct_answer": 1,
                "explanation": "JBSAAS Healthcare Platform is specifically designed for AHPRA-compliant healthcare marketing and content creation."
            },
            {
                "id": "q2",
                "question": "Why is compliance important in healthcare marketing?",
                "options": ["It improves SEO", "It is required by AHPRA and TGA", "It increases engagement", "It reduces costs"],
                "correct_answer": 1,
                "explanation": "Compliance with AHPRA and TGA regulations is legally required for healthcare professionals in Australia.",
                "compliance_reference": "AHPRA Guidelines Section 3.1"
            }
        ]'::jsonb
        WHEN 'AHPRA Advertising Guidelines Masterclass' THEN '[
            {
                "id": "q1",
                "question": "According to AHPRA guidelines, can healthcare professionals make claims about treatment outcomes?",
                "options": ["Yes, always", "No, never", "Only with evidence", "Only for cosmetic procedures"],
                "correct_answer": 2,
                "explanation": "Claims about treatment outcomes must be supported by appropriate evidence and comply with AHPRA guidelines.",
                "compliance_reference": "AHPRA Guidelines Section 5.2"
            },
            {
                "id": "q2",
                "question": "What type of patient testimonials are allowed under AHPRA guidelines?",
                "options": ["All testimonials", "None", "General experience only", "Treatment-specific results"],
                "correct_answer": 2,
                "explanation": "Only general testimonials about patient experience are allowed, not specific treatment outcomes.",
                "compliance_reference": "AHPRA Guidelines Section 6.1"
            },
            {
                "id": "q3",
                "question": "When advertising therapeutic services, what must be included?",
                "options": ["Price information", "Practitioner qualifications", "Patient photos", "Treatment guarantees"],
                "correct_answer": 1,
                "explanation": "Practitioner qualifications and registration status must be clearly displayed when advertising therapeutic services.",
                "compliance_reference": "AHPRA Guidelines Section 4.3"
            }
        ]'::jsonb
        WHEN 'Creating AHPRA-Compliant Social Media Content' THEN '[
            {
                "id": "q1",
                "question": "What should you avoid when creating social media content for your practice?",
                "options": ["Educational information", "Practice updates", "Before/after photos", "General health tips"],
                "correct_answer": 2,
                "explanation": "Before/after photos are generally not permitted under AHPRA guidelines as they can be misleading.",
                "compliance_reference": "AHPRA Guidelines Section 7.2"
            },
            {
                "id": "q2",
                "question": "How should you handle patient questions on social media?",
                "options": ["Provide detailed medical advice", "Ignore them", "Direct them to book an appointment", "Answer with general information only"],
                "correct_answer": 2,
                "explanation": "Patient questions should be directed to book an appointment for proper consultation, not answered with medical advice on social media.",
                "compliance_reference": "AHPRA Guidelines Section 8.1"
            }
        ]'::jsonb
        ELSE '[]'::jsonb
    END,
    80,
    3
FROM healthcare_video_tutorials t
WHERE t.is_required = true;

-- Row Level Security Policies

-- Healthcare Video Tutorials RLS
ALTER TABLE healthcare_video_tutorials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view active tutorials" ON healthcare_video_tutorials
    FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admin can manage tutorials" ON healthcare_video_tutorials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare Video Progress RLS
ALTER TABLE healthcare_video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own video progress" ON healthcare_video_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all video progress" ON healthcare_video_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare Video Quizzes RLS
ALTER TABLE healthcare_video_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view quizzes" ON healthcare_video_quizzes
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage quizzes" ON healthcare_video_quizzes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare Video Quiz Attempts RLS
ALTER TABLE healthcare_video_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own quiz attempts" ON healthcare_video_quiz_attempts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all quiz attempts" ON healthcare_video_quiz_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Healthcare Training Certificates RLS
ALTER TABLE healthcare_training_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" ON healthcare_training_certificates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can issue certificates" ON healthcare_training_certificates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all certificates" ON healthcare_training_certificates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Indexes for Performance
CREATE INDEX idx_video_tutorials_category ON healthcare_video_tutorials(category);
CREATE INDEX idx_video_tutorials_practice_types ON healthcare_video_tutorials USING GIN(practice_types);
CREATE INDEX idx_video_tutorials_required ON healthcare_video_tutorials(is_required) WHERE is_required = true;
CREATE INDEX idx_video_tutorials_active ON healthcare_video_tutorials(is_active) WHERE is_active = true;
CREATE INDEX idx_video_progress_user ON healthcare_video_progress(user_id);
CREATE INDEX idx_video_progress_tutorial ON healthcare_video_progress(tutorial_id);
CREATE INDEX idx_video_progress_completed ON healthcare_video_progress(completed) WHERE completed = true;
CREATE INDEX idx_quiz_attempts_user ON healthcare_video_quiz_attempts(user_id);
CREATE INDEX idx_certificates_user ON healthcare_training_certificates(user_id);
CREATE INDEX idx_certificates_verification ON healthcare_training_certificates(verification_code);

-- Functions for Video Tutorial Management

-- Function to get user's tutorial progress summary
CREATE OR REPLACE FUNCTION get_user_tutorial_progress(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    total_tutorials INTEGER;
    completed_tutorials INTEGER;
    required_completed INTEGER;
    required_total INTEGER;
    total_watch_time INTEGER;
    certificates_earned INTEGER;
BEGIN
    -- Get total tutorials for user's practice type
    SELECT COUNT(*) INTO total_tutorials
    FROM healthcare_video_tutorials t
    LEFT JOIN healthcare_professionals p ON p.id = user_uuid
    WHERE t.is_active = true
    AND (t.practice_types @> ARRAY[p.profession_type] OR t.practice_types @> ARRAY['All']);
    
    -- Get completed tutorials
    SELECT COUNT(*) INTO completed_tutorials
    FROM healthcare_video_progress vp
    JOIN healthcare_video_tutorials t ON t.id = vp.tutorial_id
    LEFT JOIN healthcare_professionals p ON p.id = user_uuid
    WHERE vp.user_id = user_uuid 
    AND vp.completed = true
    AND t.is_active = true
    AND (t.practice_types @> ARRAY[p.profession_type] OR t.practice_types @> ARRAY['All']);
    
    -- Get required tutorial stats
    SELECT 
        COUNT(*) FILTER (WHERE vp.completed = true),
        COUNT(*)
    INTO required_completed, required_total
    FROM healthcare_video_tutorials t
    LEFT JOIN healthcare_video_progress vp ON vp.tutorial_id = t.id AND vp.user_id = user_uuid
    LEFT JOIN healthcare_professionals p ON p.id = user_uuid
    WHERE t.is_required = true 
    AND t.is_active = true
    AND (t.practice_types @> ARRAY[p.profession_type] OR t.practice_types @> ARRAY['All']);
    
    -- Get total watch time
    SELECT COALESCE(SUM(watched_duration), 0) INTO total_watch_time
    FROM healthcare_video_progress
    WHERE user_id = user_uuid;
    
    -- Get certificates earned
    SELECT COUNT(*) INTO certificates_earned
    FROM healthcare_training_certificates
    WHERE user_id = user_uuid;
    
    RETURN jsonb_build_object(
        'total_tutorials', COALESCE(total_tutorials, 0),
        'completed_tutorials', COALESCE(completed_tutorials, 0),
        'completion_percentage', CASE WHEN total_tutorials > 0 THEN (completed_tutorials::DECIMAL / total_tutorials * 100) ELSE 0 END,
        'required_completed', COALESCE(required_completed, 0),
        'required_total', COALESCE(required_total, 0),
        'required_completion_percentage', CASE WHEN required_total > 0 THEN (required_completed::DECIMAL / required_total * 100) ELSE 0 END,
        'total_watch_time_minutes', COALESCE(total_watch_time / 60, 0),
        'certificates_earned', COALESCE(certificates_earned, 0),
        'training_complete', COALESCE(required_completed, 0) = COALESCE(required_total, 0) AND required_total > 0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate certificate verification code
CREATE OR REPLACE FUNCTION generate_certificate_verification_code()
RETURNS TEXT AS $$
BEGIN
    RETURN 'HC-' || UPPER(SUBSTR(gen_random_uuid()::TEXT, 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_healthcare_video_tutorials_updated_at
    BEFORE UPDATE ON healthcare_video_tutorials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_video_progress_updated_at
    BEFORE UPDATE ON healthcare_video_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_video_quizzes_updated_at
    BEFORE UPDATE ON healthcare_video_quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to generate verification code for certificates
CREATE OR REPLACE FUNCTION set_certificate_verification_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_code IS NULL THEN
        NEW.verification_code = generate_certificate_verification_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_certificate_verification_code_trigger
    BEFORE INSERT ON healthcare_training_certificates
    FOR EACH ROW
    EXECUTE FUNCTION set_certificate_verification_code();

-- Grant necessary permissions
GRANT SELECT ON healthcare_video_tutorials TO authenticated;
GRANT SELECT, INSERT, UPDATE ON healthcare_video_progress TO authenticated;
GRANT SELECT ON healthcare_video_quizzes TO authenticated;
GRANT SELECT, INSERT ON healthcare_video_quiz_attempts TO authenticated;
GRANT SELECT, INSERT ON healthcare_training_certificates TO authenticated;

-- Comments for documentation
COMMENT ON TABLE healthcare_video_tutorials IS 'Video tutorial library for healthcare professional training and onboarding';
COMMENT ON TABLE healthcare_video_progress IS 'Individual user progress tracking for video tutorials';
COMMENT ON TABLE healthcare_video_quizzes IS 'Quiz questions and settings for tutorial assessments';
COMMENT ON TABLE healthcare_video_quiz_attempts IS 'User quiz attempt records for compliance tracking';
COMMENT ON TABLE healthcare_training_certificates IS 'Issued training certificates for completed tutorials';

COMMENT ON FUNCTION get_user_tutorial_progress(UUID) IS 'Returns comprehensive tutorial progress statistics for a healthcare professional';
COMMENT ON FUNCTION generate_certificate_verification_code() IS 'Generates unique verification codes for training certificates'; 
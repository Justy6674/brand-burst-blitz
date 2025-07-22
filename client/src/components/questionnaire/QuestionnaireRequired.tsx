import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, CheckCircle, Target, MessageSquare, TrendingUp } from 'lucide-react';

const QuestionnaireRequired: React.FC = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Target className="h-5 w-5 text-primary" />,
      title: 'Strategic Content Planning',
      description: 'Get personalized content strategies based on your business goals and target audience.'
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-secondary" />,
      title: 'AI-Powered Generation',
      description: 'Generate content that matches your brand voice and resonates with your audience.'
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-success" />,
      title: 'Competitive Intelligence',
      description: 'Analyze your competitors and identify content opportunities to stay ahead.'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gradient-primary mb-4">
            Complete Your Business Intelligence Profile
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of AI-driven content strategy by completing our comprehensive business questionnaire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="glass hover-lift">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {benefit.icon}
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-strong border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                Required
              </Badge>
              <Badge variant="secondary" className="bg-success/20 text-success">
                5 Minutes
              </Badge>
            </div>
            <CardTitle className="text-2xl text-gradient-primary">
              Business Intelligence Questionnaire
            </CardTitle>
            <p className="text-muted-foreground">
              Answer strategic questions about your business to unlock personalized AI content generation.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>What You'll Define:</span>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Business goals & target audience</li>
                  <li>• Brand voice & personality</li>
                  <li>• Content topics & platforms</li>
                  <li>• Competitive landscape</li>
                  <li>• Budget & time preferences</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>What You'll Get:</span>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Personalized content strategies</li>
                  <li>• AI-generated content that converts</li>
                  <li>• Competitive analysis insights</li>
                  <li>• Strategic content calendar</li>
                  <li>• Performance optimization tips</li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/questionnaire')}
                  className="bg-gradient-primary hover:scale-105 transition-all flex items-center space-x-2 px-8 py-3 text-lg"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Start Questionnaire</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3 text-lg"
                >
                  Continue to Dashboard
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Complete the questionnaire anytime to unlock all features
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Questions? Check out our{' '}
            <Button variant="link" className="p-0 h-auto text-primary">
              help documentation
            </Button>
            {' '}or{' '}
            <Button variant="link" className="p-0 h-auto text-primary">
              contact support
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireRequired;
export { QuestionnaireRequired };
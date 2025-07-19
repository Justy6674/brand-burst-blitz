import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { StandardButton } from "./StandardButton";

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for small businesses getting started",
    features: [
      "Up to 3 social media accounts",
      "50 posts per month",
      "Basic analytics",
      "Email support",
      "Content templates"
    ],
    popular: false
  },
  {
    name: "Professional",
    price: "$79", 
    period: "/month",
    description: "Ideal for growing businesses",
    features: [
      "Up to 10 social media accounts",
      "Unlimited posts",
      "Advanced analytics",
      "Priority support",
      "AI content generation",
      "Team collaboration",
      "Custom branding"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month", 
    description: "For large organizations",
    features: [
      "Unlimited social media accounts",
      "Unlimited posts",
      "Enterprise analytics",
      "24/7 phone support",
      "Advanced AI features",
      "Multi-team management",
      "White-label solution",
      "Custom integrations"
    ],
    popular: false
  }
];

export const PricingSection = () => {
  return (
    <section id="pricing" data-section="pricing" className="pricing-section py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="bg-black/40 backdrop-blur-sm text-white border-white/30 font-semibold mb-4">
            Transparent Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when ready. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-xl scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <StandardButton 
                  action="waitlist" 
                  variant="primary"
                  className="w-full"
                >
                  Join Waitlist
                </StandardButton>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            Need a custom solution? We can help with that too.
          </p>
          <StandardButton action="waitlist" variant="secondary">
            Contact Sales
          </StandardButton>
        </div>
      </div>
    </section>
  );
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { StandardButton } from "./StandardButton";

const pricingPlans = [
  {
    name: "Standard",
    price: "$49",
    period: "/month",
    description: "Up to 3 businesses - Opening sale price",
    features: [
      "Up to 3 businesses",
      "Unlimited posts",
      "Advanced analytics", 
      "AI content generation",
      "Priority support",
      "Content templates",
      "Australian compliance"
    ],
    popular: true,
    originalPrice: "$79"
  },
  {
    name: "Large",
    price: "$179",
    period: "/month",
    description: "More than 3 businesses - Opening sale price",
    features: [
      "Unlimited businesses",
      "Unlimited posts",
      "Advanced analytics",
      "AI content generation",
      "Priority support",
      "Team collaboration",
      "Custom branding"
    ],
    popular: false,
    originalPrice: "$249"
  },
  {
    name: "Enterprise",
    price: "Coming 2026",
    period: "",
    description: "Advanced enterprise features",
    features: [
      "Everything in Large",
      "White-label solution",
      "Custom integrations",
      "24/7 phone support",
      "Dedicated account manager",
      "Custom compliance",
      "SLA guarantees"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative flex flex-col h-full ${plan.popular ? 'ring-2 ring-primary shadow-xl scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-2 flex-shrink-0">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                  {plan.originalPrice && (
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="line-through">{plan.originalPrice}/month</span>
                      <span className="text-primary ml-2 font-semibold">Opening Sale!</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between pt-4">
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <StandardButton 
                    action="waitlist" 
                    variant="primary"
                    className="w-full"
                  >
                    Join Waitlist
                  </StandardButton>
                </div>
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
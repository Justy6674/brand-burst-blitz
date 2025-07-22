import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicHeader from "@/components/layout/PublicHeader";
import { Users, FileSearch, ArrowRight, Building, Heart } from "lucide-react";

const AustralianServices = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-green-500 text-white text-lg px-6 py-2">
            🏥 Australian Healthcare Services
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Professional <span className="text-green-600">Healthcare Setup Services</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            AHPRA-compliant social media setup and business name research specifically for Australian healthcare professionals. 
            Skip the compliance headaches - we handle everything.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/aussie-setup-service">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                <Heart className="w-5 h-5 mr-2" />
                Healthcare Social Setup
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              <FileSearch className="w-5 h-5 mr-2" />
              Practice Name Scout
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            
            {/* Healthcare Social Setup */}
            <Card className="p-8 hover-lift border-green-200">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Healthcare Social Setup</h3>
                <p className="text-muted-foreground mb-6">
                  Complete AHPRA-compliant social media setup for Australian healthcare professionals. 
                  Facebook Business Manager, Instagram Business, LinkedIn optimization.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <ArrowRight className="w-4 h-4 text-green-600 mr-2" />
                    AHPRA advertising guidelines compliance
                  </li>
                  <li className="flex items-center text-sm">
                    <ArrowRight className="w-4 h-4 text-green-600 mr-2" />
                    Professional healthcare profile setup
                  </li>
                  <li className="flex items-center text-sm">
                    <ArrowRight className="w-4 h-4 text-green-600 mr-2" />
                    Meta Business Manager configuration
                  </li>
                </ul>
                <Link to="/aussie-setup-service">
                  <Button className="w-full">
                    Get Healthcare Setup - $199-299
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Practice Name Scout */}
            <Card className="p-8 hover-lift border-blue-200">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <FileSearch className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Practice Name Scout</h3>
                <p className="text-muted-foreground mb-6">
                  Professional business name research for Australian healthcare practices. 
                  ASIC availability, domain research, trademark screening.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <ArrowRight className="w-4 h-4 text-blue-600 mr-2" />
                    ASIC business name availability
                  </li>
                  <li className="flex items-center text-sm">
                    <ArrowRight className="w-4 h-4 text-blue-600 mr-2" />
                    Healthcare domain availability
                  </li>
                  <li className="flex items-center text-sm">
                    <ArrowRight className="w-4 h-4 text-blue-600 mr-2" />
                    Trademark screening for practices
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Get Name Research - $69-99
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AustralianServices;
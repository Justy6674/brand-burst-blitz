import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessComparison } from "@/components/business/BusinessComparison";
import { UnifiedReporting } from "@/components/business/UnifiedReporting";
import { CrossBusinessTemplates } from "@/components/business/CrossBusinessTemplates";

export default function CrossBusinessFeatures() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cross-Business Features</h1>
        <p className="text-muted-foreground">
          Manage and analyze performance across all your business profiles
        </p>
      </div>

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Business Comparison</TabsTrigger>
          <TabsTrigger value="unified">Unified Reporting</TabsTrigger>
          <TabsTrigger value="templates">Cross-Business Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <BusinessComparison />
        </TabsContent>

        <TabsContent value="unified" className="space-y-4">
          <UnifiedReporting />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <CrossBusinessTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
}
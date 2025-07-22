import React from "react";
import { ContentGenerator } from "../content/ContentGenerator";

interface AdvancedContentEngineProps {
  onContentGenerated?: (content: string, metadata: any) => void;
}

export const AdvancedContentEngine: React.FC<AdvancedContentEngineProps> = ({
  onContentGenerated
}) => {
  return (
    <ContentGenerator onContentGenerated={onContentGenerated} />
  );
};
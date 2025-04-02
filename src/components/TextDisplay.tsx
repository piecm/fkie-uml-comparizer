
import React from "react";
import { Card } from "@/components/ui/card";

interface TextDisplayProps {
  content: string;
  isVisible: boolean;
}

const TextDisplay: React.FC<TextDisplayProps> = ({ content, isVisible }) => {
  return (
    <div 
      className={`transition-all duration-500 ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-10"
      }`}
    >
      <Card className="bg-secondary/30 border p-4 rounded-lg shadow-lg h-[300px] overflow-auto">
        <div className="prose prose-invert max-w-none">
          <p className="text-foreground/90 whitespace-pre-wrap">{content}</p>
        </div>
      </Card>
    </div>
  );
};

export default TextDisplay;

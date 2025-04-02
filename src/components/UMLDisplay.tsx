
import React from "react";
import { Card } from "@/components/ui/card";

interface UMLDisplayProps {
  type: "human" | "llm";
  content: string;
  isVisible: boolean;
}

const UMLDisplay: React.FC<UMLDisplayProps> = ({ type, content, isVisible }) => {
  return (
    <div 
      className={`transition-all duration-500 ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-10"
      }`}
    >
      <Card className={`uml-display-container ${
        type === "human" ? "uml-display-human" : "uml-display-llm"
      } h-[500px] shadow-lg`}>
        <pre>{content}</pre>
      </Card>
    </div>
  );
};

export default UMLDisplay;

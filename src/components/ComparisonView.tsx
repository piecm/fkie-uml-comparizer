import React, { useState } from "react";
import UMLDisplay from "./UMLDisplay";
import TextDisplay from "./TextDisplay";
import { ArrowDown } from "lucide-react";

interface ComparisonViewProps {
  textContent: string;
  humanUML: string;
  llmUML: string;
  isTextVisible: boolean;
  areUMLsVisible: boolean;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  textContent,
  humanUML,
  llmUML,
  isTextVisible,
  areUMLsVisible,
}) => {
  const [localHumanUML, setLocalHumanUML] = useState(humanUML);
  const [localLLMUML, setLocalLLMUML] = useState(llmUML);

  const handleHumanUMLChange = (newContent: string) => {
    setLocalHumanUML(newContent);
  };

  const handleLLMUMLChange = (newContent: string) => {
    setLocalLLMUML(newContent);
  };

  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-uml-human flex items-center space-x-2 opacity-90">
            <span>Human UML</span>
          </h3>
          <UMLDisplay 
            type="human" 
            content={localHumanUML} 
            isVisible={areUMLsVisible} 
            onContentChange={handleHumanUMLChange}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-uml-llm flex items-center space-x-2 opacity-90">
            <span>LLM UML</span>
          </h3>
          <UMLDisplay 
            type="llm" 
            content={localLLMUML} 
            isVisible={areUMLsVisible} 
            onContentChange={handleLLMUMLChange}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <div className="animate-bounce bg-secondary/50 p-2 w-10 h-10 ring-1 ring-primary/20 shadow-lg rounded-full flex items-center justify-center">
          <ArrowDown className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center space-x-2 opacity-90">
          <span>Text Description</span>
        </h3>
        <TextDisplay content={textContent} isVisible={isTextVisible} />
      </div>
    </div>
  );
};

export default ComparisonView;

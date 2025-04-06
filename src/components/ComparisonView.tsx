import React, { useState } from "react";
import UMLDisplay from "./UMLDisplay";
import TextDisplay from "./TextDisplay";

interface ComparisonViewProps {
  textContent: string;
  humanUML: string;
  llmUML: string;
  isTextVisible: boolean;
  areUMLsVisible: boolean;
  isXMI?: boolean;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  textContent,
  humanUML,
  llmUML,
  isTextVisible,
  areUMLsVisible,
  isXMI = false,
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
            <span>{isXMI ? "Eingabe-XMI" : "Mensch UML"}</span>
          </h3>
          <UMLDisplay
            type="human"
            content={localHumanUML}
            isVisible={areUMLsVisible}
            onContentChange={handleHumanUMLChange}
            isXMI={isXMI}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-uml-llm flex items-center space-x-2 opacity-90">
            <span>{isXMI ? "Ausgabe-XMI" : "LLM UML"}</span>
          </h3>
          <UMLDisplay
            type="llm"
            content={localLLMUML}
            isVisible={areUMLsVisible}
            onContentChange={handleLLMUMLChange}
            isXMI={isXMI}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center space-x-2 opacity-90">
          <span>{isXMI ? "XMI Beschreibung" : "Text"}</span>
        </h3>
        <TextDisplay content={textContent} isVisible={isTextVisible} />
      </div>
    </div>
  );
};

export default ComparisonView;

import React, { useState, useEffect } from "react";
import UMLDisplay from "./UMLDisplay";
import TextDisplay from "./TextDisplay";
import XMIDiffVisualizer from "./XMIDiffVisualizer";
import { Button } from "@/components/ui/button";
import { Diff } from "lucide-react";

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
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    if (isXMI && showDiff) {
      console.log("Debug - ComparisonView - showDiff aktiviert");
      console.log("Debug - ComparisonView - humanUML Länge:", localHumanUML ? localHumanUML.length : 0);
      console.log("Debug - ComparisonView - llmUML Länge:", localLLMUML ? localLLMUML.length : 0);
      console.log("Debug - ComparisonView - humanUML Start:", localHumanUML ? localHumanUML.substring(0, 100) : "leer");
      console.log("Debug - ComparisonView - llmUML Start:", localLLMUML ? localLLMUML.substring(0, 100) : "leer");
    }
  }, [isXMI, showDiff, localHumanUML, localLLMUML]);

  const handleHumanUMLChange = (newContent: string) => {
    console.log("Debug - ComparisonView - humanUML geändert, neue Länge:", newContent.length);
    setLocalHumanUML(newContent);
  };

  const handleLLMUMLChange = (newContent: string) => {
    console.log("Debug - ComparisonView - llmUML geändert, neue Länge:", newContent.length);
    setLocalLLMUML(newContent);
  };

  const toggleDiffView = () => {
    console.log("Debug - ComparisonView - toggleDiffView aufgerufen, neuer Wert:", !showDiff);
    setShowDiff(!showDiff);
  };

  return (
    <div className="w-full space-y-8">
      {isXMI && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={toggleDiffView}
            className="flex items-center gap-2"
          >
            <Diff className="h-4 w-4" />
            {showDiff ? "Normale Ansicht" : "Unterschiede anzeigen"}
          </Button>
        </div>
      )}

      {isXMI && showDiff ? (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center space-x-2 opacity-90">
            <span>XMI Unterschiedsvisualisierung</span>
          </h3>
          <div 
            className="h-[700px] border-2 border-slate-300 dark:border-slate-600 rounded-md shadow-lg"
            style={{
              opacity: areUMLsVisible ? 1 : 0,
              transform: areUMLsVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 500ms, transform 500ms'
            }}
          >
            <XMIDiffVisualizer 
              originalXmi={localHumanUML} 
              generatedXmi={localLLMUML} 
            />
          </div>
        </div>
      ) : (
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
      )}

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

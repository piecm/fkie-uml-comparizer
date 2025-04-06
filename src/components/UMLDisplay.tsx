import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { encode } from "plantuml-encoder";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";

interface UMLDisplayProps {
  type: "human" | "llm";
  content: string;
  isVisible: boolean;
  isXMI?: boolean;
  onContentChange?: (newContent: string) => void;
}

const highlightUMLSyntax = (code: string, isXMI: boolean): string => {
  if (isXMI) {
    // XML/XMI Syntax-Highlighting
    return code
      .split("\n")
      .map((line) => {
        // XML-Tags
        line = line.replace(
          /(&lt;|<)(\/?)([\w:-]+)([^>]*?)(\/?)(>|&gt;)/g,
          '$1$2<span class="text-blue-400">$3</span>$4$5$6'
        );
        
        // XML-Attribute
        line = line.replace(
          /(\s+)([\w:-]+)(=)(".*?")/g,
          '$1<span class="text-green-400">$2</span>$3<span class="text-orange-400">$4</span>'
        );
        
        // XML-Kommentare
        line = line.replace(
          /(&lt;!--|<!--)(.*?)(-->|&gt;)/g,
          '<span class="text-yellow-400">$1$2$3</span>'
        );
        
        return line;
      })
      .join("\n");
  }
  
  // Standard UML Syntax-Highlighting
  return code
    .split("\n")
    .map((line) => {
      // Kommentare
      if (line.trim().startsWith("'") || line.trim().startsWith("note")) {
        return `<span class="text-yellow-400">${line}</span>`;
      }

      // Schlüsselwörter für Kontrollfluss
      line = line.replace(
        /(^|\s)(if|else|endif|alt|end|then|elseif)(\s|$)/g,
        '$1<span class="text-purple-400">$2</span>$3'
      );

      // PlantUML-Befehle
      line = line.replace(
        /(^|\s)(@startuml|@enduml|title|start|stop)(\s|$)/g,
        '$1<span class="text-blue-400">$2</span>$3'
      );

      // Akteure und Teilnehmer
      line = line.replace(
        /(^|\s)(actor|participant|boundary|control|entity|database)(\s|$)/g,
        '$1<span class="text-green-400">$2</span>$3'
      );

      // Pfeile und Beziehungen
      line = line.replace(
        /(-+>|-->|\.|:|=+>)/g,
        '<span class="text-orange-400">$1</span>'
      );

      // Klammern und Strukturen
      line = line.replace(
        /([{}()\[\]])/g,
        '<span class="text-pink-400">$1</span>'
      );

      return line;
    })
    .join("\n");
};

const UMLDisplay: React.FC<UMLDisplayProps> = ({
  type,
  content,
  isVisible,
  isXMI = false,
  onContentChange,
}) => {
  const [isEditing, setIsEditing] = useState(true);
  const [localContent, setLocalContent] = useState(content);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    if (onContentChange) {
      onContentChange(e.target.value);
    }
  };

  const toggleView = () => {
    setIsEditing(!isEditing);
  };

  // Wenn es eine XMI-Datei ist, zeigen wir keine PlantUML-Vorschau an
  const showPlantUML = !isXMI && !isEditing;
  
  const encodedUml = !isXMI ? encode(localContent) : "";
  const plantUmlUrl = !isXMI ? `https://www.plantuml.com/plantuml/svg/${encodedUml}` : "";

  return (
    <div
      className={`transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="flex justify-end mb-2">
        {!isXMI && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleView}
            className="flex items-center gap-1"
          >
            {isEditing ? (
              <Eye className="h-4 w-4" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
            <span>{isEditing ? "Vorschau" : "Bearbeiten"}</span>
          </Button>
        )}
      </div>

      <Card
        className={`uml-display-container ${
          type === "human"
            ? "uml-display-human border-uml-human/30"
            : "uml-display-llm border-uml-llm/30"
        } h-[500px] shadow-lg overflow-hidden border-2`}
      >
        {isEditing || isXMI ? (
          <div className="relative w-full h-full">
            <textarea
              className="absolute inset-0 w-full h-full p-4 bg-transparent text-foreground font-mono resize-none outline-none opacity-0"
              value={localContent}
              onChange={handleTextChange}
              spellCheck={false}
            />
            <pre
              className="w-full h-full p-4 font-mono text-foreground overflow-auto whitespace-pre"
              dangerouslySetInnerHTML={{
                __html: highlightUMLSyntax(localContent, isXMI),
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-[#f8f9fa] overflow-y-auto">
            <div
              className="w-full min-h-full p-4"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(100, 100, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 100, 255, 0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0",
              }}
            >
              <img
                src={plantUmlUrl}
                alt="UML Diagram"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UMLDisplay;

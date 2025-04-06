import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { encode } from "plantuml-encoder";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import XMIVisualizer from "./XMIVisualizer";

interface UMLDisplayProps {
  type: "human" | "llm";
  content: string;
  isVisible: boolean;
  isXMI?: boolean;
  onContentChange?: (newContent: string) => void;
}

const highlightUMLSyntax = (code: string, isXMI: boolean): string => {
  if (isXMI) {
    // Escape HTML-Entities
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    
    // XML-Tags hervorheben (einschließlich Namespaces mit Punkten wie XMI.header)
    let result = escaped.replace(
      /&lt;(\/?)([\w:.-]+)([^&gt;]*?)(\/?&gt;)/g,
      '<span style="color: #60a5fa;">&lt;$1$2$3$4</span>'
    );
    
    // XML-Attribute hervorheben
    result = result.replace(
      /(\s+)([\w:.-]+)(=)(&quot;.*?&quot;)/g,
      '$1<span style="color: #4ade80;">$2</span>$3<span style="color: #f97316;">$4</span>'
    );
    
    // XML-Kommentare hervorheben
    result = result.replace(
      /(&lt;!--)(.*?)(--&gt;)/g,
      '<span style="color: #facc15;">$1$2$3</span>'
    );
    
    return result;
  }
  
  // Standard UML Syntax-Highlighting
  // Escape HTML-Entities
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  
  let result = "";
  const lines = escaped.split("\n");
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Kommentare
    if (line.trim().startsWith("'") || line.trim().startsWith("note")) {
      line = `<span style="color: #facc15;">${line}</span>`;
    } else {
      // Schlüsselwörter für Kontrollfluss
      line = line.replace(
        /(^|\s)(if|else|endif|alt|end|then|elseif)(\s|$)/g,
        '$1<span style="color: #c084fc;">$2</span>$3'
      );

      // PlantUML-Befehle
      line = line.replace(
        /(^|\s)(@startuml|@enduml|title|start|stop)(\s|$)/g,
        '$1<span style="color: #60a5fa;">$2</span>$3'
      );

      // Akteure und Teilnehmer
      line = line.replace(
        /(^|\s)(actor|participant|boundary|control|entity|database)(\s|$)/g,
        '$1<span style="color: #4ade80;">$2</span>$3'
      );

      // Pfeile und Beziehungen
      line = line.replace(
        /(-+&gt;|--&gt;|\.|:|=+&gt;)/g,
        '<span style="color: #f97316;">$1</span>'
      );

      // Klammern und Strukturen
      line = line.replace(
        /([{}()\[\]])/g,
        '<span style="color: #ec4899;">$1</span>'
      );
    }
    
    result += line + "\n";
  }
  
  return result;
};

const UMLDisplay: React.FC<UMLDisplayProps> = ({
  type,
  content,
  isVisible,
  isXMI = false,
  onContentChange,
}) => {
  const [isEditing, setIsEditing] = useState(!isXMI);
  const [localContent, setLocalContent] = useState(content);
  const [showPreview, setShowPreview] = useState(false);

  // Wenn sich isXMI oder content ändert, aktualisiere den lokalen Zustand
  useEffect(() => {
    if (isXMI) {
      setIsEditing(false);
    }
    setLocalContent(content);
  }, [isXMI, content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    if (onContentChange) {
      onContentChange(e.target.value);
    }
  };

  const toggleView = () => {
    if (isXMI) {
      setShowPreview(!showPreview);
    } else {
      setIsEditing(!isEditing);
    }
  };

  // Für PlantUML 
  const encodedUml = !isXMI ? encode(localContent) : "";
  const plantUmlUrl = !isXMI ? `https://www.plantuml.com/plantuml/svg/${encodedUml}` : "";

  return (
    <div
      className={`transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleView}
          className="flex items-center gap-1"
        >
          {(isEditing || (!isXMI && !isEditing) || (isXMI && !showPreview)) ? (
            <Eye className="h-4 w-4" />
          ) : (
            <Edit className="h-4 w-4" />
          )}
          <span>
            {isXMI 
              ? (showPreview ? "Quellcode" : "Vorschau") 
              : (isEditing ? "Vorschau" : "Bearbeiten")}
          </span>
        </Button>
      </div>

      <Card
        className={`uml-display-container ${
          type === "human"
            ? "uml-display-human border-uml-human/30"
            : "uml-display-llm border-uml-llm/30"
        } h-[500px] shadow-lg border-2`}
      >
        {/* XMI Code-Ansicht */}
        {isXMI && !showPreview && (
          <div className="w-full h-full overflow-auto">
            <pre
              className="p-4 font-mono text-foreground whitespace-pre text-sm"
              dangerouslySetInnerHTML={{
                __html: highlightUMLSyntax(localContent, true),
              }}
            />
          </div>
        )}

        {/* XMI Vorschau-Ansicht */}
        {isXMI && showPreview && (
          <div className="w-full h-full bg-[#f8f9fa] overflow-y-auto">
            <XMIVisualizer xmiContent={localContent} />
          </div>
        )}

        {/* UML Editor Ansicht */}
        {!isXMI && isEditing && (
          <div className="w-full h-full">
            <textarea
              className="w-full h-full p-4 bg-background text-foreground font-mono resize-none outline-none border-none text-sm"
              value={localContent}
              onChange={handleTextChange}
              spellCheck={false}
            />
          </div>
        )}

        {/* UML Diagramm Vorschau */}
        {!isXMI && !isEditing && (
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

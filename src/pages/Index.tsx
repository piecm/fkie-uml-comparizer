import React, { useState, useEffect } from "react";
import FileUploader from "@/components/FileUploader";
import XMISelector from "@/components/XMISelector";
import ComparisonView from "@/components/ComparisonView";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableOfContents, ArrowRight, RefreshCcw, DatabaseBackup } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index: React.FC = () => {
  // States für File Upload
  const [textContent, setTextContent] = useState<string>("");
  const [humanUML, setHumanUML] = useState<string>("");
  const [llmUML, setLlmUML] = useState<string>("");
  
  const [textFileName, setTextFileName] = useState<string | null>(null);
  const [humanUMLFileName, setHumanUMLFileName] = useState<string | null>(null);
  const [llmUMLFileName, setLlmUMLFileName] = useState<string | null>(null);
  
  // State für XMI Auswahl
  const [selectedXMI, setSelectedXMI] = useState<string | null>(null);
  
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [textVisible, setTextVisible] = useState<boolean>(false);
  const [umlsVisible, setUmlsVisible] = useState<boolean>(false);
  
  // State für Eingabemethode (Upload oder XMI)
  const [inputMethod, setInputMethod] = useState<"upload" | "xmi">("upload");
  
  const { toast } = useToast();

  const handleTextUpload = (content: string, fileName?: string) => {
    setTextContent(content);
    setTextFileName(fileName || "text-description.txt");
  };

  const handleHumanUMLUpload = (content: string, fileName?: string) => {
    setHumanUML(content);
    setHumanUMLFileName(fileName || "human-uml.puml");
  };

  const handleLLMUMLUpload = (content: string, fileName?: string) => {
    setLlmUML(content);
    setLlmUMLFileName(fileName || "llm-uml.puml");
  };

  const handleXMISelect = (fileName: string) => {
    setSelectedXMI(fileName);
  };

  const resetAll = () => {
    setTextContent("");
    setHumanUML("");
    setLlmUML("");
    setTextFileName(null);
    setHumanUMLFileName(null);
    setLlmUMLFileName(null);
    setSelectedXMI(null);
    setShowComparison(false);
    setTextVisible(false);
    setUmlsVisible(false);
  };

  const handleCompare = () => {
    if (inputMethod === "upload") {
      if (!textContent || !humanUML || !llmUML) {
        toast({
          title: "Fehlende Dateien",
          description: "Bitte laden Sie alle drei erforderlichen Dateien hoch, um zu vergleichen.",
          variant: "destructive",
        });
        return;
      }
    } else if (inputMethod === "xmi") {
      if (!selectedXMI) {
        toast({
          title: "Keine XMI ausgewählt",
          description: "Bitte wählen Sie eine XMI-Datei aus der Datenbank aus.",
          variant: "destructive",
        });
        return;
      }
      
      // Laden der XMI-Dateien aus dem data-Ordner
      const loadInputXMI = fetch(`/data/input/${selectedXMI}.xmi`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Konnte Eingabe-XMI nicht laden: ${response.statusText}`);
          }
          return response.text();
        });
      
      const loadOutputXMI = fetch(`/data/output/${selectedXMI}.xmi`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Konnte Ausgabe-XMI nicht laden: ${response.statusText}`);
          }
          return response.text();
        })
        .catch(() => {
          // Fallback, falls die Ausgabe-XMI nicht gefunden wird
          return `<?xml version="1.0" encoding="UTF-8"?>\n<xmi:XMI xmlns:xmi="http://www.omg.org/XMI">\n  <message>Keine Ausgabe-XMI gefunden für ${selectedXMI}</message>\n</xmi:XMI>`;
        });
      
      // Beide Dateien laden und dann fortfahren
      Promise.all([loadInputXMI, loadOutputXMI])
        .then(([inputContent, outputContent]) => {
          setTextContent(inputContent);
          setHumanUML(inputContent);
          setLlmUML(outputContent);
          
          // Setze die Dateinamen
          setTextFileName(`${selectedXMI}.xmi`);
          setHumanUMLFileName(`${selectedXMI}_input.xmi`);
          setLlmUMLFileName(`${selectedXMI}_output.xmi`);
          
          // Animation starten
          showComparisonUI();
        })
        .catch(error => {
          toast({
            title: "Fehler beim Laden der XMI-Dateien",
            description: error.message,
            variant: "destructive",
          });
        });
      
      return; // Frühzeitig beenden, da wir die Animation erst nach dem Laden starten
    }

    showComparisonUI();
  };
  
  // Hilfsfunktion für die Animation
  const showComparisonUI = () => {
    setShowComparison(true);
    
    // Animate in sequence
    setTimeout(() => {
      setUmlsVisible(true);
      setTimeout(() => {
        setTextVisible(true);
      }, 500);
    }, 300);
  };

  // Example data for demonstration
  const loadExampleData = () => {
    setInputMethod("upload");
    
    const exampleText = 
      "The passenger enters the plane where they are welcomed by a stewardess who then indicates their seat. If the passenger's hand luggage fits in the storage space, they stow it themselves. Otherwise, the stewardess helps pack the hand luggage under the seat. The passenger then sits down while the stewardess checks and arranges the seat belt. If the seat belt is unfastened, the stewardess ensures safety and the passenger buckles up. Once safety is confirmed, the stewardess demonstrates the safety demo. Following this, the pilot welcomes the passengers, introduces himself and the crew, and flies off.";
    
    const exampleHumanUML = 
      "@startuml\n\ntitle Passenger Boarding Process\n\nparticipant Passenger\nparticipant Stewardess\nparticipant Pilot\n\npassenger -> stewardess: Enter plane\nstewardess -> passenger: Welcome, indicate seat\nnote right: If hand luggage fits\\nin storage space\nalt Fits in storage space\npassenger -> stewardess: Stow luggage\nelse Does not fit in storage space\nstewardess -> passenger: Help pack under seat\nend\n\npassenger -> stewardess: Sit down\nstewardess -> passenger: Check seat belt\nnote right: If seat belt unfastened\nalt Seat belt unfastened\nstewardess -> passenger: Ensure safety\\nPassenger buckles up\nelse Seat belt fastened\nstewardess -> passenger: Confirm safety\nend\n\nstewardess -> passenger: Demonstrate safety demo\npilot -> Passenger: Welcome, introduce crew\npilot -> Passenger: Fly off\n\n@enduml";
    
    const exampleLLMUML = 
      "@startuml !theme cyborg\n\ntitle Boarding- Activity Diagram\n\nstart\n\n:Passenger enters the plane;\n\n:Stewardess Welcomes;\n\n:Stewardess indicates seat;\n\n:Passenger stows hand luggage;\n\nif (enough storage space) then (yes)\n  :Stow luggage;\nelse (no)\n  :Stewardess packs hand luggage under the seat;\nendif\n\n:Passenger sits down;\n\n:Stewardess checks seat belt;\nif (seat belt unfastened) then (yes)\n  :Stewardess arranges safety;\n  :Passenger buckles up;\nendif\n\n:Stewardess confirms safety;\n:Stewardess demonstrates safety demo;\n:Pilot welcomes passengers and introduces himself and crew;\n:Pilot flies off;\n\nstop\n@enduml"
    
    handleTextUpload(exampleText, "example-description.txt");
    handleHumanUMLUpload(exampleHumanUML, "example-human-uml.puml");
    handleLLMUMLUpload(exampleLLMUML, "example-llm-uml.puml");
    
    toast({
      title: "Beispieldaten geladen",
      description: "Beispieltext und UML-Diagramme wurden geladen.",
    });
  };

  // Reset animation states when files change
  useEffect(() => {
    if (showComparison) {
      setShowComparison(false);
      setTextVisible(false);
      setUmlsVisible(false);
    }
  }, [textContent, humanUML, llmUML, selectedXMI]);

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="mt-8">
          {!showComparison ? (
            <Card className="bg-card/90 backdrop-blur">
              <CardContent className="pt-6">
                <Tabs
                  defaultValue="upload"
                  value={inputMethod}
                  onValueChange={(value) => setInputMethod(value as "upload" | "xmi")}
                  className="w-full mb-6"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Datei Upload</TabsTrigger>
                    <TabsTrigger value="xmi">XMI aus Datenbank</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FileUploader
                        fileType="text"
                        onFileUpload={(content) => handleTextUpload(content)}
                        uploadedFileName={textFileName}
                        onClearFile={() => {
                          setTextContent("");
                          setTextFileName(null);
                        }}
                      />
                      
                      <FileUploader
                        fileType="human-puml"
                        onFileUpload={(content) => handleHumanUMLUpload(content)}
                        uploadedFileName={humanUMLFileName}
                        onClearFile={() => {
                          setHumanUML("");
                          setHumanUMLFileName(null);
                        }}
                      />
                      
                      <FileUploader
                        fileType="llm-puml"
                        onFileUpload={(content) => handleLLMUMLUpload(content)}
                        uploadedFileName={llmUMLFileName}
                        onClearFile={() => {
                          setLlmUML("");
                          setLlmUMLFileName(null);
                        }}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="xmi">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-full max-w-md">
                        <XMISelector
                          onXMISelect={handleXMISelect}
                          selectedXMI={selectedXMI}
                          onClearXMI={() => setSelectedXMI(null)}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
                  <Button 
                    onClick={handleCompare} 
                    disabled={(inputMethod === "upload" && (!textContent || !humanUML || !llmUML)) || 
                             (inputMethod === "xmi" && !selectedXMI)}
                    className="w-full sm:w-auto"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    UML-Diagramme vergleichen
                  </Button>
                  
                  {inputMethod === "upload" && (
                    <Button 
                      variant="outline" 
                      onClick={loadExampleData}
                      className="w-full sm:w-auto"
                    >
                      <TableOfContents className="mr-2 h-4 w-4" />
                      Beispieldaten laden
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button variant="outline" onClick={resetAll} size="sm">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Neue Dateien hochladen
                </Button>
              </div>
              
              <ComparisonView
                textContent={textContent}
                humanUML={humanUML}
                llmUML={llmUML}
                isTextVisible={textVisible}
                areUMLsVisible={umlsVisible}
                isXMI={inputMethod === "xmi"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

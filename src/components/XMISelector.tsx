import React, { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Database, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AVAILABLE_XMI_FILES } from "@/data/availableFiles";

interface XMISelectorProps {
  onXMISelect: (fileName: string) => void;
  selectedXMI: string | null;
  onClearXMI: () => void;
}

// Diese Liste enthält alle verfügbaren XMI-Dateien aus dem data/input Verzeichnis
// ohne die .xmi Endung
 

const XMISelector: React.FC<XMISelectorProps> = ({
  onXMISelect,
  selectedXMI,
  onClearXMI
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredFiles, setFilteredFiles] = useState<string[]>(AVAILABLE_XMI_FILES);

  useEffect(() => {
    if (searchTerm) {
      const filtered = AVAILABLE_XMI_FILES.filter(file => 
        file.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(filtered);
    } else {
      setFilteredFiles(AVAILABLE_XMI_FILES);
    }
  }, [searchTerm]);

  return (
    <div className="animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
      {!selectedXMI ? (
        <div className="border-2 rounded-lg p-6 transition-all bg-secondary/10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Database className="h-12 w-12 text-blue-500" />
            <p className="text-center font-medium">XMI aus Datenbank auswählen</p>
            
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach XMI Dateien..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select onValueChange={onXMISelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="XMI Datei auswählen" />
              </SelectTrigger>
              <SelectContent>
                {filteredFiles.map((file) => (
                  <SelectItem key={file} value={file}>
                    {file}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-secondary/30 transition-all animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <span className="font-medium truncate max-w-[200px]">{selectedXMI}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-destructive/20"
              onClick={onClearXMI}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">XMI entfernen</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default XMISelector; 
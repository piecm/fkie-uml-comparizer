
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileType, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  fileType: "text" | "human-puml" | "llm-puml";
  onFileUpload: (content: string) => void;
  uploadedFileName: string | null;
  onClearFile: () => void;
}

const FileUploader = ({
  fileType,
  onFileUpload,
  uploadedFileName,
  onClearFile,
}: FileUploaderProps) => {
  const acceptedFileTypes = fileType === "text" ? ".txt" : ".puml";
  const fileTypeLabel = fileType === "text" ? "Text Description" : 
    fileType === "human-puml" ? "Human UML" : "LLM UML";
  
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onFileUpload(e.target.result as string);
          }
        };
        reader.readAsText(file);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      "text/plain": fileType === "text" ? [".txt"] : [],
      "application/x-plantuml": fileType !== "text" ? [".puml"] : []
    },
    maxFiles: 1,
  });

  const getColor = () => {
    if (fileType === "text") return "text-yellow-500";
    if (fileType === "human-puml") return "text-uml-human";
    return "text-uml-llm";
  };

  return (
    <div className="animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
      {!uploadedFileName ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
            ${isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-secondary/30"}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className={`h-12 w-12 ${getColor()}`} />
            <p className="text-center font-medium">{`Upload ${fileTypeLabel}`}</p>
            <p className="text-center text-muted-foreground text-sm">
              {`Drag & drop a${fileType === "text" ? " .txt" : " .puml"} file here, or click to select one`}
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-secondary/30 transition-all animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileType className={`h-5 w-5 ${getColor()}`} />
              <span className="font-medium truncate max-w-[200px]">{uploadedFileName}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-destructive/20"
              onClick={onClearFile}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;


import React from "react";
import { Activity, Code, Cpu } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="py-6 flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Code className="h-8 w-8 text-uml-human" />
          <Cpu className="h-8 w-8 text-uml-llm absolute -top-1 -right-1 transform rotate-12" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">UML Whisper Viz</h1>
      </div>
      <p className="text-muted-foreground text-center max-w-xl">
        Visualize and compare human-created and AI-generated UML diagrams from text descriptions
      </p>
    </header>
  );
};

export default Header;

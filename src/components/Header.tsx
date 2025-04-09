import React from "react";
import { Activity, Code, Cpu } from "lucide-react";
import { ThemeSwitch } from "./theme-switch";

const Header: React.FC = () => {
  return (
    <header className="py-6 flex flex-col items-center space-y-2">
      <div className="flex items-center justify-between w-full max-w-4xl">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Code className="h-8 w-8 text-uml-human opacity-0" />
            <Cpu className="h-8 w-8 text-uml-llm absolute -top-1 -right-1 transform rotate-12" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            re2text UML Vergleich
          </h1>
        </div>
        <ThemeSwitch />
      </div>
      <p className="text-muted-foreground text-center max-w-xl">
        Visualisiere und Vergleiche Menschliche mit KI-Generierten
        UML-Diagrammen aus Textbeschreibungen
      </p>
    </header>
  );
};

export default Header;

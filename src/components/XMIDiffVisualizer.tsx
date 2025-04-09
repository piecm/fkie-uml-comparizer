import React, { useEffect, useRef, useState } from "react";
import { XMLParser } from "fast-xml-parser";
import * as d3 from "d3";
import { useTheme } from "next-themes";

interface XMIDiffVisualizerProps {
  originalXmi: string;
  generatedXmi: string;
}

const XMIDiffVisualizer: React.FC<XMIDiffVisualizerProps> = ({ originalXmi, generatedXmi }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme } = useTheme();
  const [diffElements, setDiffElements] = useState<{classes: any[], associations: any[]}>({classes: [], associations: []});

  // Debug-Logs
  useEffect(() => {
    console.log("Debug - XMIDiffVisualizer - Komponente geladen");
    console.log("Debug - XMIDiffVisualizer - originalXmi vorhanden:", !!originalXmi);
    console.log("Debug - XMIDiffVisualizer - generatedXmi vorhanden:", !!generatedXmi);
    console.log("Debug - XMIDiffVisualizer - originalXmi Länge:", originalXmi?.length || 0);
    console.log("Debug - XMIDiffVisualizer - generatedXmi Länge:", generatedXmi?.length || 0);
    
    if (originalXmi) {
      console.log("Debug - XMIDiffVisualizer - originalXmi Start:", originalXmi.substring(0, 100));
    }
    
    if (generatedXmi) {
      console.log("Debug - XMIDiffVisualizer - generatedXmi Start:", generatedXmi.substring(0, 100));
    }
    
    if (!svgRef.current) {
      console.log("Debug - XMIDiffVisualizer - svgRef ist null");
    } else {
      console.log("Debug - XMIDiffVisualizer - svgRef ist vorhanden");
    }
  }, [originalXmi, generatedXmi]);

  // Light Mode Farbpalette
  const lightColors = {
    background: "#ffffff",
    surface: "#f8fafc",
    border: "#e2e8f0",
    text: "#1e293b",
    textMuted: "#64748b",
    added: "#10b981",    // grün für hinzugefügte Elemente
    removed: "#ef4444",  // rot für entfernte Elemente
    modified: "#f59e0b", // orange für modifizierte Elemente
    unchanged: "#64748b" // grau für unveränderte Elemente
  };

  // Dark Mode Farbpalette
  const darkColors = {
    background: "#0f172a",
    surface: "#1e293b",
    border: "#475569",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    added: "#34d399",    // grün für hinzugefügte Elemente
    removed: "#f87171",  // rot für entfernte Elemente
    modified: "#fbbf24", // orange für modifizierte Elemente
    unchanged: "#94a3b8" // grau für unveränderte Elemente
  };

  // Wähle die passende Farbpalette basierend auf dem Theme
  const colors = theme === "dark" ? darkColors : lightColors;

  useEffect(() => {
    if (!originalXmi || !generatedXmi || !svgRef.current) {
      console.log("Debug - XMIDiffVisualizer - Bedingungen für Rendering nicht erfüllt");
      console.log("Debug - XMIDiffVisualizer - originalXmi:", !!originalXmi);
      console.log("Debug - XMIDiffVisualizer - generatedXmi:", !!generatedXmi);
      console.log("Debug - XMIDiffVisualizer - svgRef.current:", !!svgRef.current);
      return;
    }

    try {
      console.log("Debug - XMIDiffVisualizer - Beginne mit Verarbeitung der XMI-Dateien");
      // XML Parser Options
      const options = {
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        isArray: (name: string) => {
          return [
            'UML:Class',
            'UML:Association',
            'UML:Attribute',
            'UML:Operation',
            'UML:Model',
            'UML:Package',
            'UML:Namespace.ownedElement',
            'UML:Generalization',
            'UML:DataType'
          ].includes(name);
        }
      };

      const parser = new XMLParser(options);
      console.log("Debug - XMIDiffVisualizer - Parser erstellt");
      
      try {
        const originalResult = parser.parse(originalXmi);
        console.log("Debug - XMIDiffVisualizer - Original XMI erfolgreich geparst");
        // Log die XMI-Struktur für Debugging
        console.log("Debug - XMIDiffVisualizer - Original XMI Struktur:", JSON.stringify(Object.keys(originalResult)).substring(0, 200));
        if (originalResult.XMI) {
          console.log("Debug - XMIDiffVisualizer - Original XMI.keys:", JSON.stringify(Object.keys(originalResult.XMI)).substring(0, 200));
        }
        
        const generatedResult = parser.parse(generatedXmi);
        console.log("Debug - XMIDiffVisualizer - Generated XMI erfolgreich geparst");
        // Log die XMI-Struktur für Debugging
        console.log("Debug - XMIDiffVisualizer - Generated XMI Struktur:", JSON.stringify(Object.keys(generatedResult)).substring(0, 200));
        if (generatedResult.XMI) {
          console.log("Debug - XMIDiffVisualizer - Generated XMI.keys:", JSON.stringify(Object.keys(generatedResult.XMI)).substring(0, 200));
        }
        
        // Clear the SVG
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        console.log("Debug - XMIDiffVisualizer - SVG bereinigt");
        
        // Extrahiere UML-Elemente aus beiden XMI-Dateien
        const originalElements = extractUMLElements(originalResult);
        console.log("Debug - XMIDiffVisualizer - Originale Elemente extrahiert:", 
          originalElements.classes.length, "Klassen,", 
          originalElements.associations.length, "Assoziationen");
        
        const generatedElements = extractUMLElements(generatedResult);
        console.log("Debug - XMIDiffVisualizer - Generierte Elemente extrahiert:", 
          generatedElements.classes.length, "Klassen,", 
          generatedElements.associations.length, "Assoziationen");
        
        // Vergleiche die Elemente und markiere Unterschiede
        const diffResult = compareUMLElements(originalElements, generatedElements);
        console.log("Debug - XMIDiffVisualizer - Vergleich abgeschlossen, Ergebnis:", 
          diffResult.classes.length, "Klassen,", 
          diffResult.associations.length, "Assoziationen");
        
        // Speichere die Differenzelemente im State
        setDiffElements(diffResult);
        
        // Generiere die Visualisierung
        renderDiffVisualization(svg, diffResult);
        console.log("Debug - XMIDiffVisualizer - Visualisierung gerendert");
      } catch (parseError) {
        console.error("Debug - XMIDiffVisualizer - Fehler beim Parsen:", parseError);
        
        // Show error message in SVG
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        
        svg.append("text")
          .attr("x", "50%")
          .attr("y", "50%")
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
          .text("Fehler beim Parsen der XMI-Dateien: " + String(parseError).substring(0, 50));
      }
    } catch (error) {
      console.error("Debug - XMIDiffVisualizer - Allgemeiner Fehler:", error);
      
      // Show error message in SVG
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      
      svg.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("Fehler beim Verarbeiten der XMI-Dateien: " + String(error).substring(0, 50));
    }
  }, [originalXmi, generatedXmi, theme]);

  // Extrahiert UML-Elemente aus dem geparsten XML
  const extractUMLElements = (parsedXml: any) => {
    // Log für die Debug-Analyse der XMI-Struktur
    console.log("Debug - XMIDiffVisualizer - Extrahiere Elemente aus:", JSON.stringify(Object.keys(parsedXml)).substring(0, 100));
    
    // Verschiedene mögliche XMI-Strukturen unterstützen
    let content = null;
    
    // ArgoUML/Standard XMI-Format
    if (parsedXml.XMI && parsedXml.XMI["XMI.content"]) {
      content = parsedXml.XMI["XMI.content"];
      console.log("Debug - XMIDiffVisualizer - XMI.content gefunden");
    } 
    // EA-Format
    else if (parsedXml.XMI && parsedXml.XMI["XMI.header"] && parsedXml.XMI["UML:Model"]) {
      content = parsedXml.XMI;
      console.log("Debug - XMIDiffVisualizer - UML:Model direkt im XMI-Root gefunden");
    }
    // Visual Paradigm/Anderes Format
    else if (parsedXml.XMI) {
      content = parsedXml.XMI;
      console.log("Debug - XMIDiffVisualizer - Verwende XMI-Root als Content");
    }
    // Unbekanntes Format, verwende Root
    else {
      content = parsedXml;
      console.log("Debug - XMIDiffVisualizer - Verwende Root als Content");
    }
    
    if (!content) {
      console.error("Debug - XMIDiffVisualizer - Kein XMI-Content gefunden");
      return { classes: [], associations: [] };
    }
    
    // Log die Struktur des Contents
    console.log("Debug - XMIDiffVisualizer - Content-Struktur:", JSON.stringify(Object.keys(content)).substring(0, 200));
    
    // Extrahiere alle Klassen, Assoziationen und Generalisierungen rekursiv
    const elements = findAllUMLElements(content);
    console.log("Debug - XMIDiffVisualizer - Gefundene Elemente:", 
      elements.classes.length, "Klassen,", 
      elements.associations.length, "Assoziationen,",
      elements.generalizations.length, "Generalisierungen");
    
    if (elements.classes.length > 0) {
      console.log("Debug - XMIDiffVisualizer - Erste Klasse:", JSON.stringify(elements.classes[0]).substring(0, 200));
    }
    
    // Verarbeite Generalisierungen zu speziellen Assoziationen
    elements.generalizations.forEach(gen => {
      elements.associations.push({
        id: gen.id,
        name: "inherits",
        type: "generalization",
        sourceId: gen.childId,
        targetId: gen.parentId,
        sourceMultiplicity: "",
        targetMultiplicity: ""
      });
    });
    
    return {
      classes: elements.classes,
      associations: elements.associations
    };
  };
  
  // Extrahiert UML-Elemente aus dem XMI-Inhalt
  const findAllUMLElements = (content: any) => {
    const classes: any[] = [];
    const associations: any[] = [];
    const generalizations: any[] = [];

    // Debugging-Funktion zum Ausgeben einer Objektstruktur
    const logObjectStructure = (obj: any, path: string = "", maxDepth: number = 2, depth: number = 0) => {
      if (depth >= maxDepth) return;
      
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          const newPath = path ? `${path}.${key}` : key;
          console.log(`Debug - XMIDiffVisualizer - Struktur [Tiefe ${depth}]: ${newPath}`);
          
          if (key.includes('Class') || key.includes('UML:Class')) {
            console.log(`Debug - XMIDiffVisualizer - Potenzielle Klasse gefunden bei: ${newPath}`);
          }
          
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            logObjectStructure(obj[key], newPath, maxDepth, depth + 1);
          }
        });
      }
    };
    
    // Log die Struktur der eingegeben Daten
    console.log("Debug - XMIDiffVisualizer - Analysiere Content-Struktur:");
    logObjectStructure(content);

    const processElement = (element: any, path: string = "") => {
      if (!element) return;
      
      // Verarbeite Objekt als Array, wenn es eines ist
      if (Array.isArray(element)) {
        console.log(`Debug - XMIDiffVisualizer - Array mit ${element.length} Elementen bei ${path} gefunden`);
        element.forEach((item, index) => processElement(item, `${path}[${index}]`));
        return;
      }
      
      // Wenn es kein Objekt ist, beende
      if (typeof element !== 'object' || element === null) return;

      // Suche nach Klassen in verschiedenen XMI-Formatvarianten
      // ArgoUML-Format
      if (element["UML:Class"]) {
        console.log(`Debug - XMIDiffVisualizer - UML:Class bei ${path} gefunden`);
        const umlClasses = Array.isArray(element["UML:Class"]) 
          ? element["UML:Class"] 
          : [element["UML:Class"]];
        
        umlClasses.forEach((cls: any) => {
          if (!cls) return;
          
          console.log(`Debug - XMIDiffVisualizer - Klasse verarbeiten:`, JSON.stringify(cls).substring(0, 100));
          
          try {
            const classObj = {
              id: cls["@_xmi.id"] || cls["@_id"] || `class_${classes.length}`,
              name: cls["@_name"] || "Unnamed Class",
              visibility: cls["@_visibility"] || 'public',
              isAbstract: cls["@_isAbstract"] === 'true',
              attributes: [],
              operations: []
            };
            
            // Verarbeite Attribute
            if (cls["UML:Attribute"] || (cls["UML:Classifier.feature"] && cls["UML:Classifier.feature"]["UML:Attribute"])) {
              const attributes = cls["UML:Attribute"] 
                ? (Array.isArray(cls["UML:Attribute"]) ? cls["UML:Attribute"] : [cls["UML:Attribute"]])
                : (Array.isArray(cls["UML:Classifier.feature"]["UML:Attribute"]) 
                    ? cls["UML:Classifier.feature"]["UML:Attribute"] 
                    : [cls["UML:Classifier.feature"]["UML:Attribute"]]);
              
              classObj.attributes = attributes.map((attr: any) => ({
                id: attr["@_xmi.id"] || attr["@_id"] || `attr_${Math.random().toString(36).substr(2, 9)}`,
                name: attr["@_name"] || "unnamed",
                type: attr["@_type"] || 'string',
                visibility: attr["@_visibility"] || 'private'
              }));
            }
            
            // Verarbeite Operationen
            if (cls["UML:Operation"] || (cls["UML:Classifier.feature"] && cls["UML:Classifier.feature"]["UML:Operation"])) {
              const operations = cls["UML:Operation"] 
                ? (Array.isArray(cls["UML:Operation"]) ? cls["UML:Operation"] : [cls["UML:Operation"]])
                : (Array.isArray(cls["UML:Classifier.feature"]["UML:Operation"]) 
                    ? cls["UML:Classifier.feature"]["UML:Operation"] 
                    : [cls["UML:Classifier.feature"]["UML:Operation"]]);
              
              classObj.operations = operations.map((op: any) => ({
                id: op["@_xmi.id"] || op["@_id"] || `op_${Math.random().toString(36).substr(2, 9)}`,
                name: op["@_name"] || "unnamed",
                type: op["@_type"] || 'void',
                visibility: op["@_visibility"] || 'public'
              }));
            }
            
            classes.push(classObj);
            console.log(`Debug - XMIDiffVisualizer - Klasse ${classObj.name} mit ${classObj.attributes.length} Attributen und ${classObj.operations.length} Operationen hinzugefügt`);
          } catch (error) {
            console.error(`Debug - XMIDiffVisualizer - Fehler beim Verarbeiten der Klasse:`, error);
          }
        });
      }
      
      // EA-Format für Klassen (variation)
      if (element["UML:Model"] && element["UML:Model"]["UML:Namespace.ownedElement"]) {
        console.log(`Debug - XMIDiffVisualizer - UML:Model bei ${path} gefunden`);
        processElement(element["UML:Model"]["UML:Namespace.ownedElement"], `${path}.UML:Model.UML:Namespace.ownedElement`);
      }

      // Verarbeite Assoziationen in verschiedenen Formaten
      if (element["UML:Association"]) {
        console.log(`Debug - XMIDiffVisualizer - UML:Association bei ${path} gefunden`);
        const umlAssociations = Array.isArray(element["UML:Association"]) 
          ? element["UML:Association"] 
          : [element["UML:Association"]];
        
        umlAssociations.forEach((assoc: any) => {
          if (!assoc) return;
          
          try {
            const associationObj = {
              id: assoc["@_xmi.id"] || assoc["@_id"] || `assoc_${associations.length}`,
              name: assoc["@_name"] || '',
              type: 'association',
              sourceId: '',
              targetId: '',
              sourceMultiplicity: '',
              targetMultiplicity: ''
            };
            
            // Verarbeite Assoziationsenden
            if (assoc["UML:Association.connection"]) {
              let ends;
              
              if (Array.isArray(assoc["UML:Association.connection"])) {
                // Wenn es ein Array von Verbindungen ist
                if (assoc["UML:Association.connection"].length > 0 && 
                    assoc["UML:Association.connection"][0]["UML:AssociationEnd"]) {
                  ends = assoc["UML:Association.connection"].map((conn: any) => conn["UML:AssociationEnd"]);
                }
              } else if (assoc["UML:Association.connection"]["UML:AssociationEnd"]) {
                // Wenn es direkt UML:AssociationEnd enthält
                ends = Array.isArray(assoc["UML:Association.connection"]["UML:AssociationEnd"])
                  ? assoc["UML:Association.connection"]["UML:AssociationEnd"]
                  : [assoc["UML:Association.connection"]["UML:AssociationEnd"]];
              }
              
              if (ends && ends.length >= 2) {
                // Extrahiere Source/Target IDs aus verschiedenen möglichen Positionen
                const getEndpointId = (end: any) => {
                  if (end["@_type"]) return end["@_type"];
                  if (end["UML:AssociationEnd.participant"] && end["UML:AssociationEnd.participant"]["UML:Class"]) {
                    return end["UML:AssociationEnd.participant"]["UML:Class"]["@_xmi.idref"] || 
                           end["UML:AssociationEnd.participant"]["UML:Class"]["@_idref"];
                  }
                  return '';
                };
                
                associationObj.sourceId = getEndpointId(ends[0]);
                associationObj.targetId = getEndpointId(ends[1]);
                
                // Extrahiere Multiplizitäten, wenn vorhanden
                if (ends[0]["@_multiplicity"]) {
                  associationObj.sourceMultiplicity = ends[0]["@_multiplicity"];
                }
                if (ends[1]["@_multiplicity"]) {
                  associationObj.targetMultiplicity = ends[1]["@_multiplicity"];
                }
                
                if (associationObj.sourceId && associationObj.targetId) {
                  associations.push(associationObj);
                  console.log(`Debug - XMIDiffVisualizer - Assoziation ${associationObj.name} hinzugefügt, Source: ${associationObj.sourceId}, Target: ${associationObj.targetId}`);
                }
              }
            }
          } catch (error) {
            console.error(`Debug - XMIDiffVisualizer - Fehler beim Verarbeiten der Assoziation:`, error);
          }
        });
      }
      
      // Verarbeite Generalisierungen
      if (element["UML:Generalization"]) {
        console.log(`Debug - XMIDiffVisualizer - UML:Generalization bei ${path} gefunden`);
        const umlGeneralizations = Array.isArray(element["UML:Generalization"]) 
          ? element["UML:Generalization"] 
          : [element["UML:Generalization"]];
        
        umlGeneralizations.forEach((gen: any) => {
          if (!gen) return;
          
          try {
            const genObj = {
              id: gen["@_xmi.id"] || gen["@_id"] || `gen_${generalizations.length}`,
              childId: gen["@_child"] || '',
              parentId: gen["@_parent"] || ''
            };
            
            // Alternative Wege um Child/Parent-IDs zu erhalten
            if (!genObj.childId && gen["UML:Generalization.child"]) {
              const child = gen["UML:Generalization.child"];
              if (child["UML:Class"]) {
                genObj.childId = child["UML:Class"]["@_xmi.idref"] || child["UML:Class"]["@_idref"];
              }
            }
            
            if (!genObj.parentId && gen["UML:Generalization.parent"]) {
              const parent = gen["UML:Generalization.parent"];
              if (parent["UML:Class"]) {
                genObj.parentId = parent["UML:Class"]["@_xmi.idref"] || parent["UML:Class"]["@_idref"];
              }
            }
            
            if (genObj.childId && genObj.parentId) {
              generalizations.push(genObj);
              console.log(`Debug - XMIDiffVisualizer - Generalisierung hinzugefügt, Child: ${genObj.childId}, Parent: ${genObj.parentId}`);
            }
          } catch (error) {
            console.error(`Debug - XMIDiffVisualizer - Fehler beim Verarbeiten der Generalisierung:`, error);
          }
        });
      }
      
      // Rekursiv in verschachtelten UML:Namespace.ownedElement-Elementen suchen
      if (element["UML:Namespace.ownedElement"]) {
        console.log(`Debug - XMIDiffVisualizer - UML:Namespace.ownedElement bei ${path} gefunden`);
        processElement(element["UML:Namespace.ownedElement"], `${path}.UML:Namespace.ownedElement`);
      }
      
      // Rekursiv alle Schlüssel durchlaufen
      Object.keys(element).forEach(key => {
        // Überspringe bereits verarbeitete Schlüssel
        if (key === "UML:Class" || key === "UML:Association" || 
            key === "UML:Generalization" || key === "UML:Namespace.ownedElement") {
          return;
        }
        
        if (typeof element[key] === 'object' && element[key] !== null) {
          processElement(element[key], `${path}.${key}`);
        }
      });
    };

    // Verarbeitung starten
    processElement(content);

    return { classes, associations, generalizations };
  };

  // Vergleicht UML-Elemente und markiert Unterschiede
  const compareUMLElements = (original: any, generated: any) => {
    const diffClasses = compareClasses(original.classes, generated.classes);
    const diffAssociations = compareAssociations(original.associations, generated.associations);

    return {
      classes: diffClasses,
      associations: diffAssociations
    };
  };

  // Vergleicht Klassen und markiert Unterschiede
  const compareClasses = (originalClasses: any[], generatedClasses: any[]) => {
    const diffClasses = [];
    const originalMap = new Map(originalClasses.map(c => [c.id, c]));
    const generatedMap = new Map(generatedClasses.map(c => [c.id, c]));

    // Prüfe auf hinzugefügte Klassen
    for (const [id, cls] of generatedMap) {
      if (!originalMap.has(id)) {
        diffClasses.push({ ...cls, status: 'added' });
      }
    }

    // Prüfe auf entfernte Klassen
    for (const [id, cls] of originalMap) {
      if (!generatedMap.has(id)) {
        diffClasses.push({ ...cls, status: 'removed' });
      }
    }

    // Prüfe auf modifizierte Klassen
    for (const [id, originalCls] of originalMap) {
      const generatedCls = generatedMap.get(id);
      if (generatedCls) {
        if (hasClassChanged(originalCls, generatedCls)) {
          diffClasses.push({ ...generatedCls, status: 'modified' });
        } else {
          diffClasses.push({ ...generatedCls, status: 'unchanged' });
        }
      }
    }

    return diffClasses;
  };

  // Vergleicht Assoziationen und markiert Unterschiede
  const compareAssociations = (originalAssociations: any[], generatedAssociations: any[]) => {
    const diffAssociations = [];
    const originalMap = new Map(originalAssociations.map(a => [a.id, a]));
    const generatedMap = new Map(generatedAssociations.map(a => [a.id, a]));

    // Prüfe auf hinzugefügte Assoziationen
    for (const [id, assoc] of generatedMap) {
      if (!originalMap.has(id)) {
        diffAssociations.push({ ...assoc, status: 'added' });
      }
    }

    // Prüfe auf entfernte Assoziationen
    for (const [id, assoc] of originalMap) {
      if (!generatedMap.has(id)) {
        diffAssociations.push({ ...assoc, status: 'removed' });
      }
    }

    // Prüfe auf modifizierte Assoziationen
    for (const [id, originalAssoc] of originalMap) {
      const generatedAssoc = generatedMap.get(id);
      if (generatedAssoc) {
        if (hasAssociationChanged(originalAssoc, generatedAssoc)) {
          diffAssociations.push({ ...generatedAssoc, status: 'modified' });
        } else {
          diffAssociations.push({ ...generatedAssoc, status: 'unchanged' });
        }
      }
    }

    return diffAssociations;
  };

  // Prüft, ob sich eine Klasse geändert hat
  const hasClassChanged = (original: any, generated: any) => {
    return original.name !== generated.name ||
           original.visibility !== generated.visibility ||
           original.isAbstract !== generated.isAbstract ||
           JSON.stringify(original.attributes) !== JSON.stringify(generated.attributes) ||
           JSON.stringify(original.operations) !== JSON.stringify(generated.operations);
  };

  // Prüft, ob sich eine Assoziation geändert hat
  const hasAssociationChanged = (original: any, generated: any) => {
    return original.name !== generated.name ||
           original.type !== generated.type ||
           original.sourceId !== generated.sourceId ||
           original.targetId !== generated.targetId ||
           original.sourceMultiplicity !== generated.sourceMultiplicity ||
           original.targetMultiplicity !== generated.targetMultiplicity;
  };

  // Rendert die Visualisierung der Unterschiede
  const renderDiffVisualization = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, diffElements: any) => {
    const { classes, associations } = diffElements;
    
    // SVG-Hintergrund einstellen
    svg.attr("style", `background-color: ${colors.background}`);
    
    const width = svg.node()?.clientWidth || 800;
    const height = svg.node()?.clientHeight || 600;
    
    // Container für zoombare Inhalte erstellen
    const container = svg.append("g")
      .attr("class", "zoom-container");
    
    // Zoom-Verhalten hinzufügen
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });
    
    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.scale(0.8).translate(width * 0.1, height * 0.1));
    
    // Erstelle ein D3 Force Layout
    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id((d: any) => d.id).distance(300))
      .force("charge", d3.forceManyBody().strength(-1200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.02))
      .force("y", d3.forceY(height / 2).strength(0.02))
      .force("collision", d3.forceCollide().radius((d: any) => Math.max(d.width, d.height) / 1.5));
    
    simulation.alphaDecay(0.01);
    simulation.alphaTarget(0.1).restart();
    
    setTimeout(() => {
      simulation.alphaTarget(0);
    }, 3000);
    
    // Definiere Marker für Pfeile
    const defs = svg.append("defs");
    
    // Marker für verschiedene Status
    const markerTypes = ['added', 'removed', 'modified', 'unchanged'];
    markerTypes.forEach(type => {
      defs.append("marker")
        .attr("id", `arrow-${type}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", colors[type as keyof typeof colors]);
    });
    
    // Zeichne Assoziationen
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(associations)
      .enter()
      .append("line")
      .attr("stroke", (d: any) => colors[d.status as keyof typeof colors])
      .attr("stroke-width", 1.5)
      .attr("marker-end", (d: any) => `url(#arrow-${d.status})`);
    
    // Zeichne Klassen
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(classes)
      .enter()
      .append("g")
      .attr("class", "uml-class");
    
    // Berechne die Größe jeder Klasse
    classes.forEach((cls: any) => {
      const headerHeight = 30;
      const rowHeight = 18;
      const attributesHeight = Math.max(cls.attributes.length * rowHeight, 10);
      const operationsHeight = Math.max(cls.operations.length * rowHeight, 10);
      
      cls.width = 160;
      cls.height = Math.max(headerHeight + attributesHeight + operationsHeight, 90);
    });
    
    // Zeichne Klassenrechtecke
    node.append("rect")
      .attr("width", (d: any) => d.width)
      .attr("height", (d: any) => d.height)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", colors.surface)
      .attr("stroke", (d: any) => colors[d.status as keyof typeof colors])
      .attr("stroke-width", 2);
    
    // Zeichne Klassennamen
    node.append("text")
      .attr("x", (d: any) => d.width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("fill", (d: any) => colors[d.status as keyof typeof colors])
      .text((d: any) => d.name);
    
    // Zeichne Trennlinie nach Klassenname
    node.append("line")
      .attr("x1", 0)
      .attr("y1", 30)
      .attr("x2", (d: any) => d.width)
      .attr("y2", 30)
      .attr("stroke", colors.border)
      .attr("stroke-width", 1);
    
    // Zeichne Attribute und Operationen
    node.each(function(d: any) {
      const group = d3.select(this);
      const attributesHeight = Math.max(d.attributes.length * 18, 18);
      
      // Attribute
      if (d.attributes.length === 0) {
        group.append("text")
          .attr("x", 10)
          .attr("y", 45)
          .attr("font-size", "10px")
          .attr("font-style", "italic")
          .attr("fill", colors.textMuted)
          .text("keine Attribute");
      } else {
        d.attributes.forEach((attr: any, index: number) => {
          const visibilitySymbol = attr.visibility === "public" ? "+" : 
                                 attr.visibility === "protected" ? "#" : 
                                 attr.visibility === "private" ? "-" : "";
          
          group.append("text")
            .attr("x", 10)
            .attr("y", 30 + 18 * (index + 1))
            .attr("font-size", "11px")
            .attr("fill", colors.text)
            .text(`${visibilitySymbol} ${attr.name}: ${attr.type}`);
        });
      }
      
      // Trennlinie
      group.append("line")
        .attr("x1", 0)
        .attr("y1", 30 + attributesHeight)
        .attr("x2", d.width)
        .attr("y2", 30 + attributesHeight)
        .attr("stroke", colors.border)
        .attr("stroke-width", 1);
      
      // Operationen
      if (d.operations.length === 0) {
        group.append("text")
          .attr("x", 10)
          .attr("y", 30 + attributesHeight + 18)
          .attr("font-size", "10px")
          .attr("font-style", "italic")
          .attr("fill", colors.textMuted)
          .text("keine Operationen");
      } else {
        d.operations.forEach((op: any, index: number) => {
          group.append("text")
            .attr("x", 10)
            .attr("y", 30 + attributesHeight + 18 * (index + 1))
            .attr("font-size", "11px")
            .attr("fill", colors.text)
            .text(`${op.name}(): ${op.type}`);
        });
      }
    });
    
    // Aktualisiere die Position bei jedem Tick
    simulation
      .nodes(classes)
      .on("tick", () => {
        link
          .attr("x1", (d: any) => {
            const source = classes.find((c: any) => c.id === d.sourceId);
            return source ? source.x + source.width / 2 : 0;
          })
          .attr("y1", (d: any) => {
            const source = classes.find((c: any) => c.id === d.sourceId);
            return source ? source.y + source.height / 2 : 0;
          })
          .attr("x2", (d: any) => {
            const target = classes.find((c: any) => c.id === d.targetId);
            return target ? target.x + target.width / 2 : 0;
          })
          .attr("y2", (d: any) => {
            const target = classes.find((c: any) => c.id === d.targetId);
            return target ? target.y + target.height / 2 : 0;
          });
        
        node.attr("transform", (d: any) => `translate(${d.x - d.width / 2}, ${d.y - d.height / 2})`);
      });
    
    // Füge Legende hinzu
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 200}, 20)`);
    
    const legendItems = [
      { status: 'added', label: 'Hinzugefügt' },
      { status: 'removed', label: 'Entfernt' },
      { status: 'modified', label: 'Modifiziert' },
      { status: 'unchanged', label: 'Unverändert' }
    ];
    
    legendItems.forEach((item, i) => {
      const itemGroup = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);
      
      itemGroup.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colors.surface)
        .attr("stroke", colors[item.status as keyof typeof colors])
        .attr("stroke-width", 2);
      
      itemGroup.append("text")
        .attr("x", 25)
        .attr("y", 12)
        .attr("font-size", "12px")
        .attr("fill", colors.text)
        .text(item.label);
    });
  };

  // Erstelle eine Funktion, um die Statusfarbe abzurufen
  const getStatusColor = (status: string) => {
    return colors[status as keyof typeof colors] || colors.text;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <svg 
          ref={svgRef} 
          width="100%" 
          height="100%" 
          className="w-full h-full"
        />
      </div>
      
      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 overflow-auto max-h-[200px]">
        <h3 className="text-base font-semibold mb-2">Text-Vergleich:</h3>
        
        {diffElements.classes.length === 0 && diffElements.associations.length === 0 ? (
          <p className="text-sm italic text-slate-500 dark:text-slate-400">Keine Unterschiede gefunden.</p>
        ) : (
          <div className="space-y-1">
            {diffElements.classes.filter(cls => cls.status !== 'unchanged').map((cls, index) => (
              <div key={`class-${index}`} className="text-sm" style={{ color: getStatusColor(cls.status) }}>
                {cls.status === 'added' ? '+' : cls.status === 'removed' ? '-' : '~'} Klasse: {cls.name}
              </div>
            ))}
            
            {diffElements.associations.filter(assoc => assoc.status !== 'unchanged').map((assoc, index) => (
              <div key={`assoc-${index}`} className="text-sm" style={{ color: getStatusColor(assoc.status) }}>
                {assoc.status === 'added' ? '+' : assoc.status === 'removed' ? '-' : '~'} Assoziation: {assoc.name || 'unnamed'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default XMIDiffVisualizer; 
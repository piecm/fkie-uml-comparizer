import React, { useEffect, useRef } from "react";
import { XMLParser } from "fast-xml-parser";
import * as d3 from "d3";

interface XMIVisualizerProps {
  xmiContent: string;
}

const XMIVisualizer: React.FC<XMIVisualizerProps> = ({ xmiContent }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!xmiContent || !svgRef.current) return;

    try {
      // Log the original content for debugging
      console.log("Original XMI content:", xmiContent.substring(0, 500) + "...");
      
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
      const result = parser.parse(xmiContent);

      // Log the parsed result
      console.log("Parsed XML:", result);

      // Clear the SVG
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // Extract UML elements
      const xmiData = extractUMLElements(result);
      
      // Generate visualization
      renderUMLVisualization(svg, xmiData);
    } catch (error) {
      console.error("Error parsing XMI:", error);
      
      // Show error message in SVG
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      
      svg.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("Fehler beim Parsen der XMI-Datei");
        
      svg.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("dy", "25px")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#666")
        .text(String(error).substring(0, 100));
    }
  }, [xmiContent]);

  // Extracts UML elements from the parsed XML
  const extractUMLElements = (parsedXml: any) => {
    try {
      console.log("Parsed XML structure:", JSON.stringify(parsedXml, null, 2).substring(0, 500) + "...");
      
      // Navigiere zur XMI.content
      const content = parsedXml.XMI?.["XMI.content"];
      
      if (!content) {
        console.error("No XMI.content found in XML");
        return {
          classes: [],
          associations: []
        };
      }
      
      // Extrahiere alle Klassen, Assoziationen und Generalisierungen rekursiv
      const { classes, associations, generalizations } = findAllUMLElements(content);
      
      console.log(`Found ${classes.length} classes, ${associations.length} associations, and ${generalizations.length} generalizations`);
      
      // Log detailed information about classes
      classes.forEach(cls => {
        console.log(`Class: ${cls.name}, ID: ${cls.id}, Attributes: ${cls.attributes.length}, Operations: ${cls.operations.length}`);
      });
      
      // Process generalizations to add them as special associations
      generalizations.forEach(gen => {
        associations.push({
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
        classes,
        associations
      };
    } catch (error) {
      console.error("Error extracting UML elements:", error);
      return {
        classes: [],
        associations: []
      };
    }
  };
  
  // Recursive function to find all UML elements in the XMI structure
  const findAllUMLElements = (node: any, path: string = ""): { classes: any[], associations: any[], generalizations: any[] } => {
    const classes: any[] = [];
    const associations: any[] = [];
    const generalizations: any[] = [];
    
    console.log(`Searching in path: ${path}, node keys: ${Object.keys(node).join(', ')}`);
    
    // Wenn node ein Array ist, verarbeite jeden Eintrag im Array
    if (Array.isArray(node)) {
      console.log(`Found array with ${node.length} items at ${path}`);
      node.forEach((item, index) => {
        const subResult = findAllUMLElements(item, `${path}[${index}]`);
        classes.push(...subResult.classes);
        associations.push(...subResult.associations);
        generalizations.push(...subResult.generalizations);
      });
      return { classes, associations, generalizations };
    }
    
    // Wenn node kein Objekt ist, beende die Rekursion
    if (typeof node !== 'object' || node === null) {
      return { classes, associations, generalizations };
    }
    
    // Direkter Check auf UML:Class
    if (node["UML:Class"]) {
      const umlClasses = Array.isArray(node["UML:Class"]) 
        ? node["UML:Class"] 
        : [node["UML:Class"]];
      
      for (const cls of umlClasses) {
        const classInfo = {
          id: cls["@_xmi.id"] || cls["@_id"] || `class_${classes.length}`,
          name: cls["@_name"] || "Unnamed Class",
          type: "class",
          attributes: extractAttributesFlexible(cls),
          operations: extractOperationsFlexible(cls)
        };
        console.log(`Found class: ${classInfo.name} with ${classInfo.attributes.length} attributes and ${classInfo.operations.length} operations`);
        classes.push(classInfo);
      }
    }
    
    // Check für UML:Generalization
    if (node["UML:Generalization"]) {
      const umlGeneralizations = Array.isArray(node["UML:Generalization"]) 
        ? node["UML:Generalization"] 
        : [node["UML:Generalization"]];
      
      for (const gen of umlGeneralizations) {
        // ArgoUML verwendet parent und child Attribute
        const parentId = gen["@_parent"] || "";
        const childId = gen["@_child"] || "";
        
        // Manche XMI-Formate verwenden UML:Generalization.parent/child
        let finalParentId = parentId;
        let finalChildId = childId;
        
        if (!parentId && gen["UML:Generalization.parent"]) {
          const parent = gen["UML:Generalization.parent"];
          if (parent["UML:GeneralizableElement"]) {
            const element = parent["UML:GeneralizableElement"];
            finalParentId = element["@_xmi.idref"] || element["@_idref"] || "";
          }
        }
        
        if (!childId && gen["UML:Generalization.child"]) {
          const child = gen["UML:Generalization.child"];
          if (child["UML:GeneralizableElement"]) {
            const element = child["UML:GeneralizableElement"];
            finalChildId = element["@_xmi.idref"] || element["@_idref"] || "";
          }
        }
        
        // Nur gültige Generalisierungen hinzufügen
        if (finalParentId && finalChildId) {
          const generalization = {
            id: gen["@_xmi.id"] || gen["@_id"] || `gen_${generalizations.length}`,
            parentId: finalParentId,
            childId: finalChildId
          };
          console.log(`Found generalization: ${generalization.id}, Parent: ${generalization.parentId}, Child: ${generalization.childId}`);
          generalizations.push(generalization);
        } else {
          console.log(`Skipping invalid generalization - missing parent or child ID`);
        }
      }
    }
    
    // Check für UML:Association
    if (node["UML:Association"]) {
      const umlAssociations = Array.isArray(node["UML:Association"]) 
        ? node["UML:Association"] 
        : [node["UML:Association"]];
      
      for (const assoc of umlAssociations) {
        const connection = assoc["UML:Association.connection"];
        if (connection && connection["UML:AssociationEnd"]) {
          const ends = Array.isArray(connection["UML:AssociationEnd"]) 
            ? connection["UML:AssociationEnd"] 
            : [connection["UML:AssociationEnd"]];
          
          if (ends.length >= 2) {
            const sourceId = getParticipantId(ends[0]);
            const targetId = getParticipantId(ends[1]);
            
            console.log(`Found association: ${assoc["@_xmi.id"] || assoc["@_id"]}, Source: ${sourceId}, Target: ${targetId}`);
            
            associations.push({
              id: assoc["@_xmi.id"] || assoc["@_id"] || `assoc_${associations.length}`,
              name: assoc["@_name"] || "",
              type: "association",
              sourceId: sourceId,
              targetId: targetId,
              sourceMultiplicity: getMultiplicity(ends[0]),
              targetMultiplicity: getMultiplicity(ends[1])
            });
          }
        }
      }
    }
    
    // Spezialfall für UML:Namespace.ownedElement
    if (node["UML:Namespace.ownedElement"]) {
      console.log(`Found UML:Namespace.ownedElement at ${path}`);
      const subElements = findAllUMLElements(node["UML:Namespace.ownedElement"], `${path}.UML:Namespace.ownedElement`);
      classes.push(...subElements.classes);
      associations.push(...subElements.associations);
      generalizations.push(...subElements.generalizations);
    }
    
    // Rekursiv alle Schlüssel durchsuchen
    for (const key in node) {
      // Überspringe bereits verarbeitete Schlüssel
      if (key === "UML:Class" || key === "UML:Association" || key === "UML:Generalization" || key === "UML:Namespace.ownedElement") {
        continue;
      }
      
      if (typeof node[key] === 'object' && node[key] !== null) {
        // Prüfen, ob das ein Container sein könnte
        const isContainer = 
          key.includes("Package") || 
          key.includes("Model") || 
          key.includes("View") || 
          key.includes("LogicalView") ||
          key.startsWith("UML:");
        
        if (isContainer) {
          console.log(`Recursing into ${key} at ${path}`);
          const subElements = findAllUMLElements(node[key], `${path}.${key}`);
          classes.push(...subElements.classes);
          associations.push(...subElements.associations);
          generalizations.push(...subElements.generalizations);
        }
      }
    }
    
    return { classes, associations, generalizations };
  };
  
  // More flexible attribute extraction that handles direct attributes and UML:Classifier.feature
  const extractAttributesFlexible = (cls: any): any[] => {
    const attributes = [];
    
    // Direkte UML:Attribute Elemente (ArgoUML-Stil)
    if (cls["UML:Attribute"]) {
      const umlAttributes = Array.isArray(cls["UML:Attribute"]) 
        ? cls["UML:Attribute"] 
        : [cls["UML:Attribute"]];
      
      for (const attr of umlAttributes) {
        attributes.push({
          name: attr["@_name"] || "unnamed",
          type: attr["@_type"] ? findTypeName(attr["@_type"]) : "unknown"
        });
      }
    }
    
    // Klassische UML:Classifier.feature Struktur
    if (cls["UML:Classifier.feature"]) {
      const features = cls["UML:Classifier.feature"];
      
      if (features["UML:Attribute"]) {
        const umlAttributes = Array.isArray(features["UML:Attribute"]) 
          ? features["UML:Attribute"] 
          : [features["UML:Attribute"]];
        
        for (const attr of umlAttributes) {
          attributes.push({
            name: attr["@_name"] || "unnamed",
            type: extractType(attr)
          });
        }
      }
    }
    
    return attributes;
  };
  
  // Find type name from an ID reference
  const findTypeName = (typeId: string): string => {
    // Hier könnte man später eine Map von IDs zu Typnamen pflegen
    // Für jetzt geben wir nur den ID-String zurück
    return typeId.split("#").pop() || typeId;
  };
  
  // More flexible operation extraction
  const extractOperationsFlexible = (cls: any): any[] => {
    const operations = [];
    
    // Direct UML:Operation elements
    if (cls["UML:Operation"]) {
      const umlOperations = Array.isArray(cls["UML:Operation"]) 
        ? cls["UML:Operation"] 
        : [cls["UML:Operation"]];
      
      for (const op of umlOperations) {
        operations.push({
          name: op["@_name"] || "unnamed",
          type: "void"
        });
      }
    }
    
    // Classical UML:Classifier.feature structure
    if (cls["UML:Classifier.feature"]) {
      const features = cls["UML:Classifier.feature"];
      
      if (features["UML:Operation"]) {
        const umlOperations = Array.isArray(features["UML:Operation"]) 
          ? features["UML:Operation"] 
          : [features["UML:Operation"]];
        
        for (const op of umlOperations) {
          operations.push({
            name: op["@_name"] || "unnamed",
            type: extractType(op)
          });
        }
      }
    }
    
    return operations;
  };
  
  const findUMLModel = (content: any): any => {
    // Versuche, UML:Model direkt zu finden
    if (content["UML:Model"]) {
      return Array.isArray(content["UML:Model"]) 
        ? content["UML:Model"][0] 
        : content["UML:Model"];
    }
    
    // Suche nach allen Schlüsseln, die mit UML beginnen
    for (const key in content) {
      if (key.startsWith("UML:")) {
        return content[key];
      }
    }
    
    return null;
  };
  
  const extractClasses = (namespace: any): any[] => {
    const classes = [];
    
    // Suche nach UML:Class Elementen
    if (namespace["UML:Class"]) {
      const umlClasses = Array.isArray(namespace["UML:Class"]) 
        ? namespace["UML:Class"] 
        : [namespace["UML:Class"]];
      
      for (const cls of umlClasses) {
        classes.push({
          id: cls["@_xmi.id"] || cls["@_id"] || `class_${classes.length}`,
          name: cls["@_name"] || "Unnamed Class",
          type: "class",
          attributes: extractAttributes(cls),
          operations: extractOperations(cls)
        });
      }
    }
    
    return classes;
  };
  
  const extractAttributes = (cls: any): any[] => {
    const attributes = [];
    
    if (cls["UML:Classifier.feature"]) {
      const features = cls["UML:Classifier.feature"];
      
      if (features["UML:Attribute"]) {
        const umlAttributes = Array.isArray(features["UML:Attribute"]) 
          ? features["UML:Attribute"] 
          : [features["UML:Attribute"]];
        
        for (const attr of umlAttributes) {
          attributes.push({
            name: attr["@_name"] || "unnamed",
            type: extractType(attr)
          });
        }
      }
    }
    
    return attributes;
  };
  
  const extractOperations = (cls: any): any[] => {
    const operations = [];
    
    if (cls["UML:Classifier.feature"]) {
      const features = cls["UML:Classifier.feature"];
      
      if (features["UML:Operation"]) {
        const umlOperations = Array.isArray(features["UML:Operation"]) 
          ? features["UML:Operation"] 
          : [features["UML:Operation"]];
        
        for (const op of umlOperations) {
          operations.push({
            name: op["@_name"] || "unnamed",
            type: extractType(op)
          });
        }
      }
    }
    
    return operations;
  };
  
  const extractType = (element: any): string => {
    if (element["UML:StructuralFeature.type"]) {
      const typeFeature = element["UML:StructuralFeature.type"];
      if (typeFeature["UML:DataType"]) {
        return typeFeature["UML:DataType"]["@_name"] || "unknown";
      }
    }
    return "void";
  };
  
  const extractAssociations = (namespace: any): any[] => {
    const associations = [];
    
    // Suche nach UML:Association Elementen
    if (namespace["UML:Association"]) {
      const umlAssociations = Array.isArray(namespace["UML:Association"]) 
        ? namespace["UML:Association"] 
        : [namespace["UML:Association"]];
      
      for (const assoc of umlAssociations) {
        const connection = assoc["UML:Association.connection"];
        if (connection && connection["UML:AssociationEnd"]) {
          const ends = Array.isArray(connection["UML:AssociationEnd"]) 
            ? connection["UML:AssociationEnd"] 
            : [connection["UML:AssociationEnd"]];
          
          if (ends.length >= 2) {
            associations.push({
              id: assoc["@_xmi.id"] || assoc["@_id"] || `assoc_${associations.length}`,
              name: assoc["@_name"] || "",
              type: "association",
              sourceId: getParticipantId(ends[0]),
              targetId: getParticipantId(ends[1]),
              sourceMultiplicity: getMultiplicity(ends[0]),
              targetMultiplicity: getMultiplicity(ends[1])
            });
          }
        }
      }
    }
    
    return associations;
  };
  
  const getParticipantId = (end: any): string => {
    // Direct type attribute (common in ArgoUML)
    if (end["@_type"]) {
      return end["@_type"];
    }
    
    // Standard UML participant structure
    if (end["UML:AssociationEnd.participant"] && end["UML:AssociationEnd.participant"]["UML:Class"]) {
      const cls = end["UML:AssociationEnd.participant"]["UML:Class"];
      return cls["@_xmi.idref"] || cls["@_idref"] || "";
    }
    
    return "";
  };
  
  const getMultiplicity = (end: any): string => {
    if (end["UML:AssociationEnd.multiplicity"] && end["UML:AssociationEnd.multiplicity"]["UML:Multiplicity"]) {
      const multiplicity = end["UML:AssociationEnd.multiplicity"]["UML:Multiplicity"];
      if (multiplicity["UML:Multiplicity.range"] && multiplicity["UML:Multiplicity.range"]["UML:MultiplicityRange"]) {
        const range = multiplicity["UML:Multiplicity.range"]["UML:MultiplicityRange"];
        const lower = range["@_lower"] || "0";
        const upper = range["@_upper"] || "*";
        return lower === upper ? lower : `${lower}..${upper}`;
      }
    }
    return "";
  };

  // Renders the UML visualization using D3
  const renderUMLVisualization = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: any) => {
    const { classes, associations } = data;
    
    // Dark Mode Farbpalette
    const colors = {
      background: "#0f172a", // slate-900
      surface: "#1e293b",    // slate-800
      border: "#475569",     // slate-600
      text: "#e2e8f0",       // slate-200
      textMuted: "#94a3b8",  // slate-400
      accent: "#60a5fa",     // blue-400
      link: "#94a3b8",       // slate-400
      inheritance: "#94a3b8" // slate-400
    };
    
    // SVG-Hintergrund einstellen
    svg.attr("style", `background-color: ${colors.background}`);
    
    if (classes.length === 0) {
      svg.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", colors.text)
        .text("Keine UML-Klassen in der XMI-Datei gefunden");
      return;
    }
    
    const width = svg.node()?.clientWidth || 800;
    const height = svg.node()?.clientHeight || 600;
    
    console.log(`Rendering ${classes.length} classes and ${associations.length} associations`);
    console.log("Classes to render:", classes.map(c => c.name));
    
    // Container für zoombare Inhalte erstellen
    const container = svg.append("g")
      .attr("class", "zoom-container");
    
    // Zoom-Verhalten hinzufügen
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3]) // Zoom-Bereich: 20% bis 300%
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });
    
    // Zoom zum SVG hinzufügen
    svg.call(zoom);
    
    // Initial auf 80% zoomen für bessere Übersicht
    svg.call(zoom.transform, d3.zoomIdentity.scale(0.8).translate(width * 0.1, height * 0.1));
    
    // Erstelle ein D3 Force Layout mit mehr Abstand zwischen Klassen
    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id((d: any) => d.id).distance(300)) // Noch größerer Abstand
      .force("charge", d3.forceManyBody().strength(-1200)) // Deutlich stärkere Abstoßung
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.02)) // Noch schwächere X-Kraft
      .force("y", d3.forceY(height / 2).strength(0.02)) // Noch schwächere Y-Kraft
      .force("collision", d3.forceCollide().radius((d: any) => Math.max(d.width, d.height) / 1.5)); // Kollisionsabstand
    
    // Verbessertes Alpha-Verhalten für gleichmäßigere Verteilung
    simulation.alphaDecay(0.01); // Langsameres Abklingen für bessere Positionierung
    simulation.alphaTarget(0.1).restart();
    
    // Nach 3 Sekunden auf 0 setzen, um CPU-Last zu reduzieren
    setTimeout(() => {
      simulation.alphaTarget(0);
    }, 3000);
    
    // Teile Assoziationen in reguläre und Generalisierungen
    const regularAssociations = associations.filter(a => a.type !== "generalization");
    const generalizations = associations.filter(a => a.type === "generalization");
    
    // Spezielle Marker für Pfeile definieren
    const defs = svg.append("defs");
    
    // Marker für reguläre Assoziationen
    defs.append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", colors.link);
    
    // Marker für Generalisierungen (Vererbung)
    defs.append("marker")
      .attr("id", "inheritance")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
        .attr("d", "M0,-5L10,0L0,5Z")
        .attr("fill", colors.background)
        .attr("stroke", colors.inheritance)
        .attr("stroke-width", 1);
    
    // Zeichne Generalisierungen als Linien mit speziellen Pfeilen
    const generalizationLines = container.append("g")
      .attr("class", "generalizations")
      .selectAll("line")
      .data(generalizations)
      .enter()
      .append("line")
      .attr("stroke", colors.inheritance)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4")
      .attr("marker-end", "url(#inheritance)");
    
    // Zeichne reguläre Assoziationen als Linien
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(regularAssociations)
      .enter()
      .append("line")
      .attr("stroke", colors.link)
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrow)");
    
    // Zeichne Beschriftungen für Assoziationen
    const linkText = container.append("g")
      .attr("class", "link-labels")
      .selectAll("text")
      .data(regularAssociations.filter(d => d.name))
      .enter()
      .append("text")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("fill", colors.textMuted)
      .text(d => d.name);
    
    // Zeichne Klassendiagramme als Rechtecke mit Inhalt
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(classes)
      .enter()
      .append("g")
      .attr("class", "uml-class");
    
    // Berechne die Größe jeder Klasse basierend auf Anzahl der Attribute und Operationen
    classes.forEach((cls: any) => {
      const headerHeight = 30;
      const rowHeight = 18; // Zeilenhöhe reduziert
      const attributesHeight = Math.max(cls.attributes.length * rowHeight, 10);
      const operationsHeight = Math.max(cls.operations.length * rowHeight, 10);
      
      // Stelle sicher, dass die Klasse eine Mindestgröße hat
      cls.width = 160; // Breite reduziert
      cls.height = Math.max(headerHeight + attributesHeight + operationsHeight, 90); // Höhe reduziert
      
      console.log(`Class ${cls.name} size: ${cls.width}x${cls.height}, with ${cls.attributes.length} attributes and ${cls.operations.length} operations`);
    });
    
    // Zeichne Klassenrechtecke mit abgerundeten Ecken
    node.append("rect")
      .attr("width", d => d.width)
      .attr("height", d => d.height)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", colors.surface)
      .attr("stroke", colors.border)
      .attr("stroke-width", 1);
    
    // Zeichne Klassennamen
    node.append("text")
      .attr("x", d => d.width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("fill", colors.accent)
      .text(d => d.name);
    
    // Zeichne Trennlinie nach Klassenname
    node.append("line")
      .attr("x1", 0)
      .attr("y1", 30)
      .attr("x2", d => d.width)
      .attr("y2", 30)
      .attr("stroke", colors.border)
      .attr("stroke-width", 1);
    
    // Zeichne Attribute
    node.each(function(d, i) {
      const group = d3.select(this);
      
      // Kein Attribut vorhanden - zeige "keine Attribute" an
      if (d.attributes.length === 0) {
        group.append("text")
          .attr("x", 10)
          .attr("y", 45) // Leicht angepasst
          .attr("font-size", "10px")
          .attr("font-style", "italic")
          .attr("fill", colors.textMuted)
          .text("keine Attribute");
      } else {
        d.attributes.forEach((attr: any, index: number) => {
          group.append("text")
            .attr("x", 10)
            .attr("y", 30 + 18 * (index + 1)) // Zeilenhöhe angepasst
            .attr("font-size", "11px") // Schriftgröße reduziert
            .attr("fill", colors.text)
            .text(`${attr.name}: ${attr.type}`);
        });
      }
      
      // Trennlinie zwischen Attributen und Operationen zeichnen
      const attributesHeight = Math.max(d.attributes.length * 18, 18); // Zeilenhöhe angepasst
      group.append("line")
        .attr("x1", 0)
        .attr("y1", 30 + attributesHeight)
        .attr("x2", d.width)
        .attr("y2", 30 + attributesHeight)
        .attr("stroke", colors.border)
        .attr("stroke-width", 1);
      
      // Operationen zeichnen
      if (d.operations.length === 0) {
        group.append("text")
          .attr("x", 10)
          .attr("y", 30 + attributesHeight + 18) // Zeilenhöhe angepasst
          .attr("font-size", "10px")
          .attr("font-style", "italic")
          .attr("fill", colors.textMuted)
          .text("keine Operationen");
      } else {
        d.operations.forEach((op: any, index: number) => {
          group.append("text")
            .attr("x", 10)
            .attr("y", 30 + attributesHeight + 18 * (index + 1)) // Zeilenhöhe angepasst
            .attr("font-size", "11px") // Schriftgröße reduziert
            .attr("fill", colors.text)
            .text(`${op.name}(): ${op.type}`);
        });
      }
    });
    
    // Aktualisiere die Position bei jedem Tick des Force-Layouts
    simulation
      .nodes(classes)
      .on("tick", () => {
        // Aktualisiere Generalisierungslinien
        generalizationLines
          .attr("x1", d => {
            const source = classes.find((c: any) => c.id === d.sourceId);
            return source ? source.x + source.width / 2 : 0;
          })
          .attr("y1", d => {
            const source = classes.find((c: any) => c.id === d.sourceId);
            return source ? source.y + source.height / 2 : 0;
          })
          .attr("x2", d => {
            const target = classes.find((c: any) => c.id === d.targetId);
            return target ? target.x + target.width / 2 : 0;
          })
          .attr("y2", d => {
            const target = classes.find((c: any) => c.id === d.targetId);
            return target ? target.y + target.height / 2 : 0;
          });
        
        link
          .attr("x1", d => {
            const source = classes.find((c: any) => c.id === d.sourceId);
            return source ? source.x + source.width / 2 : 0;
          })
          .attr("y1", d => {
            const source = classes.find((c: any) => c.id === d.sourceId);
            return source ? source.y + source.height / 2 : 0;
          })
          .attr("x2", d => {
            const target = classes.find((c: any) => c.id === d.targetId);
            return target ? target.x + target.width / 2 : 0;
          })
          .attr("y2", d => {
            const target = classes.find((c: any) => c.id === d.targetId);
            return target ? target.y + target.height / 2 : 0;
          });
        
        linkText
          .attr("x", d => {
            const source = classes.find((c: any) => c.id === d.sourceId);
            const target = classes.find((c: any) => c.id === d.targetId);
            return source && target ? (source.x + target.x) / 2 + 10 : 0;
          })
          .attr("y", d => {
            const source = classes.find((c: any) => c.id === d.sourceId);
            const target = classes.find((c: any) => c.id === d.targetId);
            return source && target ? (source.y + target.y) / 2 - 5 : 0;
          });
        
        // Erweiterte Spanne für die Klassen
        classes.forEach((d: any) => {
          // Sehr großer Raum für die Verteilung
          d.x = Math.max(-width * 2, Math.min(width * 3, d.x));
          d.y = Math.max(-height * 2, Math.min(height * 3, d.y));
        });
        
        node.attr("transform", d => `translate(${d.x - d.width / 2}, ${d.y - d.height / 2})`);
      });
    
    // Verbinde die Assoziationen mit dem Force-Layout
    if (simulation.force("link")) {
      const linkForce = simulation.force("link") as d3.ForceLink<any, any>;
      
      // Kombiniere alle Assoziationen und Generalisierungen
      const linkData = [...regularAssociations, ...generalizations]
        .map(assoc => {
          const source = classes.find((c: any) => c.id === assoc.sourceId);
          const target = classes.find((c: any) => c.id === assoc.targetId);
          
          // Setze spezifische Abstände für verschiedene Beziehungstypen
          const distance = assoc.type === "generalization" ? 350 : 300;
          
          return {
            source,
            target,
            distance
          };
        })
        .filter(link => link.source && link.target);
      
      console.log(`Creating ${linkData.length} force links`);
      linkForce.links(linkData);
      
      // Passe den Abstand für jede Verbindung individuell an
      linkForce.distance((d: any) => d.distance);
    }
    
    // Ein Drag-Verhalten, das während des Drags das Zoom-Verhalten deaktiviert
    const dragHandler = d3.drag<SVGGElement, any>()
      .on("start", function(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        // Während des Drags kein Zoomen/Pannen zulassen
        svg.on(".zoom", null);
      })
      .on("drag", function(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", function(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        // Zoom-Verhalten wiederherstellen
        svg.call(zoom);
      });
    
    // Wende das Drag-Verhalten auf die Knoten an
    node.call(dragHandler);
    
    // Zoom-Hilfsinformationen
    svg.append("text")
      .attr("x", 10)
      .attr("y", height - 30)
      .attr("font-size", "12px")
      .attr("fill", colors.textMuted)
      .text("Zoom: Mausrad | Verschieben: Ziehen mit Maus");
      
    // Klassenbewegung-Hilfsinformation
    svg.append("text")
      .attr("x", 10)
      .attr("y", height - 10)
      .attr("font-size", "12px")
      .attr("fill", colors.textMuted)
      .text("Klassen verschieben: Drag & Drop auf Klassen");
  };

  return (
    <div className="w-full h-full">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        className="border border-slate-600 shadow-sm rounded-md"
      />
    </div>
  );
};

export default XMIVisualizer; 
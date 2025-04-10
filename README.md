# UML-Whisper-Viz: XMI-Diagramm Visualisierungs- und Vergleichswerkzeug

Ein modernes Werkzeug zur Visualisierung und zum Vergleich von UML-Diagrammen und XMI-Dateien.

## Funktionalität

### Überblick

UML-Whisper-Viz ermöglicht es, UML-Diagramme zu visualisieren und zu vergleichen - sowohl manuell erstellte als auch durch KI generierte Diagramme. Die Anwendung unterstützt:

- Visualisierung von PlantUML-Dateien
- Visualisierung von XMI-Dateien (UML-Klassendiagramme)
- Vergleich zwischen zwei XMI-Dateien mit Hervorhebung der Unterschiede
- Dunkles und helles Farbschema

### Hauptfunktionen

#### Datei-Upload

Die Anwendung unterstützt den Upload von drei Typen von Dateien:
- **Text**: Beschreibungstexte, die als Grundlage für UML-Diagramme dienen
- **Mensch-UML**: Von Menschen erstellte UML-Diagramme (PlantUML oder XMI)
- **KI-UML**: Durch KI generierte UML-Diagramme (PlantUML oder XMI)

#### XMI-Datenbank

Alternativ zum Datei-Upload können Sie vordefinierte XMI-Dateien aus der integrierten Datenbank auswählen.

#### UML-Visualisierung

Die hochgeladenen UML-Diagramme werden direkt visualisiert:
- PlantUML-Dateien werden über den PlantUML-Server gerendert
- XMI-Dateien werden mit einer interaktiven Visualisierung dargestellt, die Klassendiagramme, Assoziationen und Vererbungsbeziehungen zeigt

#### XMI-Vergleich

Bei XMI-Dateien können Sie mit dem "Unterschiede anzeigen"-Button eine vergleichende Ansicht öffnen:

- Klassen, die hinzugefügt wurden, werden **grün** markiert
- Klassen, die entfernt wurden, werden **rot** markiert
- Klassen, die modifiziert wurden, werden **orange** markiert
- Unveränderte Klassen werden in Standardfarben angezeigt

Der Text-Vergleich unterhalb der grafischen Darstellung listet alle Unterschiede auf und verwendet die gleiche Farbcodierung.

## Installation und Start

### Voraussetzungen

- Node.js (Version 16 oder höher)
- npm (Version 7 oder höher) oder yarn

### Installation

1. Klonen Sie das Repository:
   ```bash
   git clone https://github.com/username/uml-whisper-viz.git
   cd uml-whisper-viz
   ```

2. Installieren Sie die Abhängigkeiten:
   ```bash
   npm install
   # oder
   yarn install
   ```

3. Starten Sie den Entwicklungsserver:
   ```bash
   npm run dev
   # oder
   yarn dev
   ```

4. Öffnen Sie die Anwendung in Ihrem Browser:
   ```
   http://localhost:3000
   ```

### Produktionsbuild

Um einen Produktionsbuild zu erstellen:

```bash
npm run build
npm start
# oder
yarn build
yarn start
```

## Verwendung

### Schritt 1: Dateien auswählen

1. Wählen Sie auf der Startseite entweder:
   - **Datei Upload**: Laden Sie eigene Dateien hoch
   - **XMI aus Datenbank**: Wählen Sie vordefinierte XMI-Dateien

2. Bei **Datei Upload**:
   - Laden Sie einen Textbeschreibung, ein manuell erstelltes UML und ein KI-generiertes UML hoch
   - Oder klicken Sie auf "Beispieldaten laden", um Testdaten zu verwenden

3. Bei **XMI aus Datenbank**:
   - Wählen Sie eine der verfügbaren XMI-Dateien aus dem Dropdown-Menü

4. Klicken Sie auf "UML-Diagramme vergleichen"

### Schritt 2: Vergleichen und Analysieren

- Sie sehen die visualisierten UML-Diagramme Seite an Seite (links menschlich, rechts KI)
- Für jedes Diagramm können Sie zwischen **Quellcode** und **Vorschau** wechseln
- Bei XMI-Dateien können Sie auf "Unterschiede anzeigen" klicken, um eine vergleichende Ansicht zu öffnen
- Der Text-Vergleich unter der Grafik zeigt alle Unterschiede in einer scrollbaren Liste

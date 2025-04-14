# UML-Diagramm Visualisierungs- und Vergleichswerkzeug

Ein modernes Tool zur Visualisierung und zum Vergleich von UML-Diagrammen und XMI-Dateien – einfach und intuitiv.

## Funktionalität

### Überblick

Mit dieser Anwendung kannst du:

- PlantUML-Dateien visualisieren
- XMI-Dateien (UML-Klassendiagramme) anzeigen
- Zwei XMI-Dateien vergleichen und Unterschiede hervorheben
- Zwischen hellem und dunklem Farbschema umschalten

### Hauptfunktionen

#### Datei-Upload

Du kannst drei Arten von Dateien hochladen:

- **Text**: Beschreibungstexte, aus denen UML-Diagramme entstehen
- **Mensch-UML**: Von Menschen erstellte UML-Diagramme (PlantUML oder XMI)
- **KI-UML**: Von einer KI generierte UML-Diagramme (PlantUML oder XMI)

#### XMI-Datenbank

Alternativ kannst du auch auf vordefinierte XMI-Dateien aus einer integrierten Datenbank zugreifen.

#### UML-Visualisierung

Alle hochgeladenen UML-Diagramme werden direkt angezeigt:

- PlantUML-Dateien werden über einen PlantUML-Server gerendert
- XMI-Dateien werden interaktiv dargestellt, inklusive Klassendiagrammen, Assoziationen und Vererbungen

#### XMI-Vergleich

Wenn du zwei XMI-Dateien vergleichst, kannst du über den Button **„Unterschiede anzeigen“** eine visuelle Vergleichsansicht öffnen:

- **Grün** = Neue Klassen
- **Rot** = Entfernte Klassen
- **Orange** = Geänderte Klassen
- **Standardfarben** = Unveränderte Klassen

Zusätzlich zeigt ein Textvergleich unterhalb der Visualisierung alle Unterschiede farblich markiert an.

## Installation und Start

### Voraussetzungen

- Node.js (ab Version 16)
- npm (ab Version 7) oder yarn

### Installation

1. Installiere die Abhängigkeiten:

   ```bash
   npm install
   # oder
   yarn install
   ```

2. Starte den Entwicklungsserver:

   ```bash
   npm run dev
   # oder
   yarn dev
   ```

3. Öffne deinen Browser und gehe zu:
   ```
   http://localhost:3000
   ```

### Produktionsbuild

Um einen Produktionsbuild zu erstellen und zu starten:

```bash
npm run build
npm start
# oder
yarn build
yarn start
```

## Verwendung

### Schritt 1: Dateien auswählen

1. Auf der Startseite hast du zwei Möglichkeiten:

   - **Datei-Upload**: Lade eigene Dateien hoch
   - **XMI aus Datenbank**: Wähle eine vorgefertigte Datei aus

2. Wenn du den Datei-Upload nutzt:

   - Lade einen Beschreibungstext, ein manuell erstelltes UML und ein KI-generiertes UML hoch
   - Oder klick auf **„Beispieldaten laden“**, um Testdaten zu verwenden

3. Wenn du XMI aus der Datenbank nutzen willst:

   - Wähle im Dropdown-Menü eine Datei aus

4. Klick auf **„UML-Diagramme vergleichen“**

### Schritt 2: Vergleichen und Analysieren

- Du siehst beide UML-Diagramme nebeneinander (links: Mensch, rechts: KI)
- Du kannst zwischen **Quellcode** und **Vorschau** wechseln
- Bei XMI-Dateien kannst du **„Unterschiede anzeigen“** anklicken, um die Änderungen hervorzuheben
- Der Textvergleich darunter zeigt alle Unterschiede in einer scrollbaren Liste mit Farbcodes

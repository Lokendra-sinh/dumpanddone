import { OutlineSectionType } from "@dumpanddone/types";

type CurrentStateType = "BUILDING_TAG" | "CLOSING_TAG" | "COLLECTING";

type CollectStateType = "TITLE" | "DESCRIPTION";

class OutlineParser {
  section: OutlineSectionType = {
    title: "",
    description: "",
    id: "",
    isEdited: false,
  };

  currentState: CurrentStateType = "BUILDING_TAG";
  collectState: CollectStateType = "TITLE";
  buffer: string = "";
  outline: OutlineSectionType[] = [];
  private listeners: ((callback: OutlineSectionType) => void)[] = [];

  emitSection(partialSection: { title: string; description: string }) {
    const completeSection = {
      ...partialSection,
      isEdited: false,
      id: crypto.randomUUID(),
    };

    this.listeners.forEach((listener) => listener(completeSection));
  }

  receiveSection(callback: (section: OutlineSectionType) => void) {
    this.listeners.push(callback);
  }

  parse(event: any) {
    try {
      const parsed = JSON.parse(event.data);
      if (parsed.type === "OUTLINE_COMPLETE") {
        this.emitSection({
          title: "OUTLINE_COMPLETE",
          description: "OUTLINE_COMPLETE",
        });
      }
    } catch {
      for (let i = 0; i < event.data.length; i++) {
        const ch = event.data[i];
        switch (this.currentState) {
          case "BUILDING_TAG":
            this.buffer += ch;
            if (this.buffer.includes("<t>")) {
              this.collectState = "TITLE";
              this.currentState = "COLLECTING";
            } else if (this.buffer.includes("<d>")) {
              this.collectState = "DESCRIPTION";
              this.currentState = "COLLECTING";
            }
            break;
          case "COLLECTING":
            if (ch === "<") {
              this.buffer += ch;
              this.currentState = "CLOSING_TAG";
            } else {
              if (this.collectState === "TITLE") {
                this.section.title += ch;
              } else if (this.collectState === "DESCRIPTION") {
                this.section.description += ch;
              }
            }
            break;

          case "CLOSING_TAG":
            this.buffer += ch;
            if (this.buffer.includes("</t>")) {
              this.buffer = "";
              this.currentState = "BUILDING_TAG";
            } else if (this.buffer.includes("</d>")) {
              this.buffer = "";
              this.currentState = "BUILDING_TAG";
              this.outline.push(this.section);
              this.emitSection(this.section);
              this.section = {
                title: "",
                description: "",
                id: "",
                isEdited: false,
              };
            }
            break;
        }
      }
    }
  }
}

export const outlineParser = new OutlineParser();

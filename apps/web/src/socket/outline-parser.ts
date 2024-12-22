import { OutlineSectionType } from "@dumpanddone/types";

type CurrentStateType = "BUILDING_TAG" | "CLOSING_TAG" | "COLLECTING";
type CollectStateType = "TITLE" | "DESCRIPTION";

class OutlineParser {
  // Parser state
  private currentState: CurrentStateType = "BUILDING_TAG";
  private collectState: CollectStateType = "TITLE";
  private buffer: string = "";
  private section: OutlineSectionType = this.createEmptySection();
  private outline: OutlineSectionType[] = [];
  private listeners: ((section: OutlineSectionType) => void)[] = [];

  private createEmptySection(): OutlineSectionType {
    return {
      title: "",
      description: "",
      id: "",
      isEdited: false,
    };
  }


  reset() {
    this.currentState = "BUILDING_TAG";
    this.collectState = "TITLE";
    this.buffer = "";
    this.section = this.createEmptySection();
    this.outline = [];
  }

  getProgress(): number {
    // Could be based on number of sections or characters processed
    return this.outline.length;
  }

  finalize() {
    // First emit any partial section if it exists
    if (this.section.title || this.section.description) {
        this.emitSection(this.section);
    }

    // Then emit the END event
    this.emitSection({
        title: "OUTLINE_END",
        description: "OUTLINE_END",
    });

    // Finally reset state
    this.reset();
}

  canSaveProgress(): boolean {
    return this.outline.length > 0;
  }

  saveProgress() {
    // Could save outline to localStorage or state management
    console.log("Saving progress:", this.outline);
  }

  subscribe(callback: (section: OutlineSectionType) => void) {
    this.listeners.push(callback);
  }

  unsubscribe(callback: (section: OutlineSectionType) => void) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  private emitSection(partialSection: Partial<OutlineSectionType>) {
    console.log("PARSER: Emitting section:", partialSection); 
    const completeSection = {
        ...this.createEmptySection(),
        ...partialSection,
        id: crypto.randomUUID(),
    };

    console.log("PARSER: Complete section to emit:", completeSection); 
    this.listeners.forEach(listener => {
        console.log("PARSER: Calling listener with section"); 
        listener(completeSection);
    });
}

  parse(event: MessageEvent) {
    try {
        const parsed = JSON.parse(event.data);
        console.log("PARSER: Received event type:", parsed.type);  // Log the event type
        
        if (parsed.type === "OUTLINE_END") {
            console.log("PARSER: Got OUTLINE_END event, emitting section...");  // Log before emitting
            this.emitSection({
                title: "OUTLINE_END",
                description: "OUTLINE_END",
            });
            return;
        }
  
        if (parsed.type === "OUTLINE_PROGRESS") {
            this.parseContent(parsed.content);
        }
        
    } catch (error) {
        console.error("PARSER: Failed to parse message:", error);
    }
}

  private parseContent(data: string) {
    for (let i = 0; i < data.length; i++) {
      const ch = data[i];
      switch (this.currentState) {
        case "BUILDING_TAG":
          this.handleBuildingTag(ch);
          break;
        case "COLLECTING":
          this.handleCollecting(ch);
          break;
        case "CLOSING_TAG":
          this.handleClosingTag(ch);
          break;
      }
    }
  }

  private handleBuildingTag(ch: string) {
    this.buffer += ch;
    if (this.buffer.includes("<t>")) {
      this.collectState = "TITLE";
      this.currentState = "COLLECTING";
      this.buffer = "";
    } else if (this.buffer.includes("<d>")) {
      this.collectState = "DESCRIPTION";
      this.currentState = "COLLECTING";
      this.buffer = "";
    }
  }

  private handleCollecting(ch: string) {
    if (ch === "<") {
      this.buffer = ch;
      this.currentState = "CLOSING_TAG";
    } else {
      if (this.collectState === "TITLE") {
        this.section.title += ch;
      } else if (this.collectState === "DESCRIPTION") {
        this.section.description += ch;
      }
    }
  }

  private handleClosingTag(ch: string) {
    this.buffer += ch;
    if (this.buffer.includes("</t>")) {
      this.buffer = "";
      this.currentState = "BUILDING_TAG";
    } else if (this.buffer.includes("</d>")) {
      this.buffer = "";
      this.currentState = "BUILDING_TAG";
      this.outline.push({...this.section});
      this.emitSection(this.section);
      this.section = this.createEmptySection();
    }
  }
}

export const outlineParser = new OutlineParser();
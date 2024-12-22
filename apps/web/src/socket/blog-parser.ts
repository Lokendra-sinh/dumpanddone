import { TipTapNodeType } from "@dumpanddone/types";

type StreamType = 'WRITE_BLOG' | 'EDIT_BLOG';
type BlogParserListener = {
  onState: (state: string) => void;
  onNode: (node: TipTapNodeType) => void;
};

enum ParserState {
  WAITING,
  LOOKING_FOR_TAG,
  COLLECTING_STATE,
  COLLECTING_NODE,
}

export class BlogParser {
  private currentState = ParserState.LOOKING_FOR_TAG;
  private buffer = "";
  private currentStream: StreamType | null = null;
  
  private writeBlogListeners: BlogParserListener[] = [];
  private editBlogListeners: BlogParserListener[] = [];

  setStreamType(type: StreamType) {
    this.reset();
    this.currentStream = type;
  }

  subscribeToWriteBlog(listener: BlogParserListener) {
    this.writeBlogListeners.push(listener);
  }

  subscribeToEditBlog(listener: BlogParserListener) {
    this.editBlogListeners.push(listener);
  }

  unsubscribeFromWriteBlog(listener: BlogParserListener) {
    this.writeBlogListeners = this.writeBlogListeners.filter(l => l !== listener);
  }

  unsubscribeFromEditBlog(listener: BlogParserListener) {
    this.editBlogListeners = this.editBlogListeners.filter(l => l !== listener);
  }

  private emitState(state: string) {
    const listeners = this.currentStream === 'WRITE_BLOG' 
      ? this.writeBlogListeners 
      : this.editBlogListeners;
    
    console.log(`📢 EMIT STATE: "${state}" to ${listeners.length} listeners`);
    
    try {
      listeners.forEach(listener => listener.onState(state));
      console.log('✅ State emitted successfully');
    } catch (e) {
      console.error('❌ State emission failed:', e);
    }
  }

  private emitNode(node: TipTapNodeType) {
    const listeners = this.currentStream === 'WRITE_BLOG' 
      ? this.writeBlogListeners 
      : this.editBlogListeners;
    
    console.log('📦 EMIT NODE:', JSON.stringify(node))
    
    try {
      listeners.forEach(listener => listener.onNode(node));
      console.log('✅ Node emitted successfully');
    } catch (e) {
      console.error('❌ Node emission failed:', e);
    }
  }

  parse(event: any) {
    try {
      const parsed = JSON.parse(event.data);
      if (!parsed.content) return;
      
      const eventType = `${this.currentStream === 'WRITE_BLOG' ? 'BLOG' : 'EDIT_BLOG'}_PROGRESS`;
      if (parsed.type === eventType) {
        this.processContent(parsed.content);
      }
    } catch (e) {
      console.error('❌ Parse error:', e);
    }
  }

  private processContent(content: string) {
    for (const char of content) {
      this.buffer += char;

      switch (this.currentState) {
        case ParserState.LOOKING_FOR_TAG:
          if (this.buffer.endsWith('<s>')) {
            this.buffer = '';
            this.currentState = ParserState.COLLECTING_STATE;
          } else if (this.buffer.endsWith('<n>')) {
            this.buffer = '';
            this.currentState = ParserState.COLLECTING_NODE;
          }
          break;

        case ParserState.COLLECTING_STATE:
          if (this.buffer.endsWith('</s>')) {
            const stateContent = this.buffer.slice(0, -4).trim();
            this.emitState(stateContent);
            this.buffer = '';
            this.currentState = ParserState.LOOKING_FOR_TAG;
          }
          break;

        case ParserState.COLLECTING_NODE:
          if (this.buffer.endsWith('</n>')) {
            const nodeContent = this.buffer.slice(0, -4);
            try {
              const node = JSON.parse(nodeContent);
              this.emitNode(node);
            } catch {
              console.error('❌ Node parse failed:', nodeContent);
            }
            this.buffer = '';
            this.currentState = ParserState.LOOKING_FOR_TAG;
          }
          break;
      }
    }
  }

  reset() {
    this.currentState = ParserState.LOOKING_FOR_TAG;
    this.buffer = '';
  }
}

export const blogParser = new BlogParser();
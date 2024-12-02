interface SendMessageProps {
  type: "START_STREAM" | "STOP_STREAM",
  content: string
}

type CurrentStateType = "BUILDING_TAG" | "CLOSING_TAG" | "COLLECTING"

type CollectStateType = "TITLE" | "DESCRIPTION"

export type SectionType = {
  title: string
  description: string
}

type OutlineType = SectionType[]

class SocketClient {
  private socket: WebSocket | null = null;
  private readonly url: string;
  buffer: string = ""
  currentState: CurrentStateType = "BUILDING_TAG"
  collectState: CollectStateType = "TITLE"
  section: SectionType = {title: "", description: ""}
  outline: OutlineType = []
  private listeners: ((callback: SectionType) => void)[] = []

  private emitSection(section: SectionType){
    this.listeners.forEach(listener => listener(section))
  }

  constructor() {
    this.url = 'ws://localhost:4000';
  }

  connect() {
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log("connected to websocket server");
      };

      this.socket.onmessage = (event) => {
        // console.log("incoming event is", event);

        for(let i = 0; i < event.data.length; i++){
          const ch = event.data[i]
        switch(this.currentState){
          case "BUILDING_TAG":
            this.buffer += ch
            if(this.buffer.includes("<t>")){
              this.collectState = "TITLE"
              this.currentState = "COLLECTING"
            } else if(this.buffer.includes("<d>")){
              this.collectState = "DESCRIPTION"
              this.currentState = "COLLECTING"
            }
            break;
            case "COLLECTING":
              if(ch === "<"){
                this.buffer += ch
                this.currentState = "CLOSING_TAG"
              } else {
                if(this.collectState === "TITLE"){
                  this.section.title += ch
                } else if(this.collectState === "DESCRIPTION"){
                  this.section.description += ch
                }
              }
              break;
            
            case "CLOSING_TAG":
              this.buffer += ch
              if(this.buffer.includes("</t>")){
                this.buffer = ""
                this.currentState = "BUILDING_TAG"
              } else if(this.buffer.includes("</d>")){
                this.buffer = ""
                this.currentState = "BUILDING_TAG"
                console.log("COMPLETED SECTION:", this.section);
                this.outline.push(this.section)
                this.emitSection(this.section)
                this.section = {title: "", description: ""};
              }
              break;
        }
      }

      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.socket.onclose = (event) => {
        console.log(
          "Disconnected from WebSocket server:",
          event.code,
          event.reason
        );
        // You might want to implement reconnection logic here
      };
    } catch (e) {
        console.error('Failed to connect to WebSocket server:', e);
    }
  }

  sendMessage(message: SendMessageProps){
    if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
    } else {
        console.error('WebSocket is not connected');
    }
  }

  onSection(callback: (section: SectionType) => void){
    this.listeners.push(callback)
  }

  disconnect(){
    if(this.socket){
        this.socket.close()
        this.socket = null
    }
  }
}


export const socketClient = new SocketClient()
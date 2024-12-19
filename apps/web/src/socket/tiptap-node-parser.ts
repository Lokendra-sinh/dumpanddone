// Type definitions
type JsonValue = string | number | boolean | null | JsonArray | JsonObject;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type ParserState =
  | "building_value"
  | "build_key"
  | "collect_key"
  | "colon"
  | "expect_value"
  | "after_value"
  | "build_string"
  | "build_null"
  | "build_number"
  | "build_boolean"
  | "after_comma_obj"
  | "after_comma_array"
  | "string_escape"
  | "unicode_escape";

interface StackElement {
  type: "obj" | "array";
  container: JsonObject | JsonArray;
}

class JsonParser {
  private parenthesisStack: string[];
  private tempJsonStack: StackElement[];
  private tempJson: JsonObject;
  private currentKey: string;
  private currentValue: string;
  private state: ParserState;
  private unicodeSequence: string;

  constructor() {
    this.parenthesisStack = [];
    this.tempJsonStack = [];
    this.tempJson = {};
    this.currentKey = "";
    this.currentValue = "";
    this.state = "building_value";
    this.unicodeSequence = "";
  }

  public parse(jsonString: string): JsonObject {
    this.reset();
    
    for (let i = 0; i < jsonString.length; i++) {
      const ch = jsonString[i];
      this.processChar(ch);
    }

    if (this.parenthesisStack.length > 0) {
      throw new Error("Unclosed brackets or braces");
    }

    if (this.state !== "after_value" && this.state !== "building_value") {
      throw new Error("Unexpected end of input");
    }

    return this.tempJson;
  }

  private reset(): void {
    this.parenthesisStack = [];
    this.tempJsonStack = [];
    this.tempJson = {};
    this.currentKey = "";
    this.currentValue = "";
    this.state = "building_value";
    this.unicodeSequence = "";
  }

  private processChar(ch: string): void {
    switch (this.state) {
      case "building_value":
        this.buildingValue(ch);
        break;
      case "build_key":
        this.buildKey(ch);
        break;
      case "collect_key":
        this.collectKey(ch);
        break;
      case "colon":
        this.handleColon(ch);
        break;
      case "expect_value":
        this.buildingValue(ch);
        break;
      case "after_value":
        this.afterValue(ch);
        break;
      case "build_string":
        this.buildString(ch);
        break;
      case "build_null":
        this.buildNull(ch);
        break;
      case "build_number":
        this.buildNumber(ch);
        break;
      case "build_boolean":
        this.buildBoolean(ch);
        break;
      case "after_comma_obj":
        this.afterCommaObj(ch);
        break;
      case "after_comma_array":
        this.afterCommaArray(ch);
        break;
      case "string_escape":
        this.handleStringEscape(ch);
        break;
      case "unicode_escape":
        this.handleUnicodeEscape(ch);
        break;
      default:
        throw new Error(`Invalid State: ${this.state}`);
    }
  }

  private buildKey(ch: string): void {
    if (/\s/.test(ch)) {
      return;
    }
    if (ch === '"') {
      this.currentKey = "";
      this.state = "collect_key";
    } else if (/[{}[\]:,]/.test(ch)) {
      throw new Error(`Unexpected ${ch} while expecting a key`);
    } else {
      throw new Error(`Key must start with " but found ${ch}`);
    }
  }

  private collectKey(ch: string): void {
    if (ch === '"') {
      if (this.currentKey.length === 0) {
        throw new Error("Empty key is not allowed");
      }
      this.state = "colon";
    } else if (/[{}[\]:,]/.test(ch)) {
      throw new Error(`Invalid character "${ch}" in key`);
    } else {
      this.currentKey += ch;
    }
  }

  private handleColon(ch: string): void {
    if (ch === ":") {
      this.state = "expect_value";
    } else if (!/\s/.test(ch)) {
      throw new Error("Expected ':' after key");
    }
  }

  private appendValueToContainer(value: JsonValue): void {
    const tE = this.tempJsonStack[this.tempJsonStack.length - 1];
    if (tE.type === "obj") {
      (tE.container as JsonObject)[this.currentKey] = value;
    } else {
      (tE.container as JsonArray).push(value);
    }
    this.currentKey = "";
    this.currentValue = "";
    this.state = "after_value";
  }

  private buildString(ch: string): void {
    if (ch === '"') {
      if (this.currentValue === "" && this.state === "expect_value") {
        throw new Error("Empty string value is not allowed");
      }
      this.appendValueToContainer(this.currentValue);
    } else if (ch === "\\") {
      this.state = "string_escape";
    } else if (ch === "\n" || ch === "\r") {
      throw new Error("Unescaped newline in string");
    } else {
      this.currentValue += ch;
    }
  }

  private handleStringEscape(ch: string): void {
    const escapeMap: { [key: string]: string } = {
      '"': '"',
      '\\': '\\',
      '/': '/',
      'b': '\b',
      'f': '\f',
      'n': '\n',
      'r': '\r',
      't': '\t'
    };

    if (ch === 'u') {
      this.state = "unicode_escape";
      this.unicodeSequence = "";
    } else if (ch in escapeMap) {
      this.currentValue += escapeMap[ch];
      this.state = "build_string";
    } else {
      throw new Error(`Invalid escape sequence: \\${ch}`);
    }
  }

  private handleUnicodeEscape(ch: string): void {
    this.unicodeSequence += ch;
    if (this.unicodeSequence.length === 4) {
      const unicodeChar = String.fromCharCode(parseInt(this.unicodeSequence, 16));
      this.currentValue += unicodeChar;
      this.state = "build_string";
    } else if (!/[0-9A-Fa-f]/.test(ch)) {
      throw new Error("Invalid Unicode sequence");
    }
  }

  private buildNull(ch: string): void {
    this.currentValue += ch;
    if (this.currentValue === "null") {
      this.appendValueToContainer(null);
    } else if (!"null".startsWith(this.currentValue)) {
      throw new Error("Invalid token");
    }
  }

  private buildBoolean(ch: string): void {
    this.currentValue += ch;
    if (this.currentValue === "true") {
      this.appendValueToContainer(true);
    } else if (this.currentValue === "false") {
      this.appendValueToContainer(false);
    } else if (!"true".startsWith(this.currentValue) && !"false".startsWith(this.currentValue)) {
      throw new Error("Invalid boolean value");
    }
  }

  private buildNumber(ch: string): void {
    if (/[0-9.eE+-]/.test(ch)) {
      this.currentValue += ch;
      return;
    }

    if (!/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(this.currentValue)) {
      throw new Error("Invalid number format");
    }

    const number = parseFloat(this.currentValue);
    if (!isFinite(number)) {
      throw new Error("Number out of range");
    }

    this.appendValueToContainer(number);
    this.afterValue(ch);
  }

  private afterValue(ch: string): void {
    if (/\s/.test(ch)) {
      return;
    }

    const containerType = this.tempJsonStack[this.tempJsonStack.length - 1].type;

    if (ch === ",") {
      this.state = containerType === "obj" ? "after_comma_obj" : "after_comma_array";
      return;
    }

    if (ch === "}" && containerType === "obj" && 
        this.parenthesisStack[this.parenthesisStack.length - 1] === "{") {
      this.parenthesisStack.pop();
      this.tempJsonStack.pop();
      if (this.tempJsonStack.length > 0) {
        this.state = "after_value";
      }
      return;
    }

    if (ch === "]" && containerType === "array" && 
        this.parenthesisStack[this.parenthesisStack.length - 1] === "[") {
      this.parenthesisStack.pop();
      this.tempJsonStack.pop();
      if (this.tempJsonStack.length > 0) {
        this.state = "after_value";
      }
      return;
    }

    throw new Error(`Expected ',' or '${containerType === "obj" ? "}" : "]"}'`);
  }

  private afterCommaObj(ch: string): void {
    if (/\s/.test(ch)) {
      return;
    }
    if (ch === '"') {
      this.currentKey = "";
      this.state = "collect_key";
    } else if (ch === '}') {
      throw new Error("Trailing comma in object");
    } else {
      throw new Error("Expected property name or '}'");
    }
  }

  private afterCommaArray(ch: string): void {
    if (/\s/.test(ch)) {
      return;
    }
    if (ch === ']') {
      throw new Error("Trailing comma in array");
    } else {
      this.state = "expect_value";
      this.buildingValue(ch);
    }
  }

  private buildingValue(ch: string): void {
    if (/\s/.test(ch)) {
      return;
    }

    if (ch === '"') {
      this.state = "build_string";
      this.currentValue = "";
    } else if (ch === "n") {
      this.state = "build_null";
      this.currentValue = ch;
    } else if (ch === "t" || ch === "f") {
      this.state = "build_boolean";
      this.currentValue = ch;
    } else if (/[0-9.-]/.test(ch)) {
      this.state = "build_number";
      this.currentValue = ch;
    } else if (ch === "{") {
      this.handleOpenObject();
    } else if (ch === "[") {
      this.handleOpenArray();
    } else if (ch !== " ") {
      throw new Error(`Invalid character: ${ch}`);
    }
  }

  private handleOpenObject(): void {
    const newObj: JsonObject = {};

    if (this.tempJsonStack.length === 0) {
      this.parenthesisStack.push("{");
      this.tempJsonStack.push({
        type: "obj",
        container: this.tempJson
      });
      this.state = "build_key";
      return;
    }

    const tE = this.tempJsonStack[this.tempJsonStack.length - 1];
    if (tE.type === "obj") {
      (tE.container as JsonObject)[this.currentKey] = newObj;
    } else {
      (tE.container as JsonArray).push(newObj);
    }

    this.parenthesisStack.push("{");
    this.tempJsonStack.push({
      type: "obj",
      container: newObj
    });

    this.state = "build_key";
  }

  private handleOpenArray(): void {
    const newArr: JsonArray = [];
    const tE = this.tempJsonStack[this.tempJsonStack.length - 1];

    if (tE.type === "obj") {
      (tE.container as JsonObject)[this.currentKey] = newArr;
    } else {
      (tE.container as JsonArray).push(newArr);
    }

    this.parenthesisStack.push("[");
    this.tempJsonStack.push({
      type: "array",
      container: newArr
    });

    this.state = "expect_value";
  }
}

export const jsonParser = new JsonParser()
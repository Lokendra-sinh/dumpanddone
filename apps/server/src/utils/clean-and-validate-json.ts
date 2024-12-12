export const cleanAndValidateJson = (content: any): string => {
    try {
      let jsonStr = content;
  
      // Handle the case where content is wrapped in a text object
      if (typeof content === "object" && content.type === "text") {
        // Get the text property which contains our actual JSON
        jsonStr = content.text;
      }
  
      // If the string contains concatenation (like '\n' + '...'), join it
      if (typeof jsonStr === "string" && jsonStr.includes("' +\n")) {
        // Split by concatenation operator and join
        jsonStr = jsonStr
          .split(/'\s*\+\s*'/) // Split on ' + '
          .join("") // Join the parts
          .replace(/^\s*'|'\s*$/g, ""); // Remove outer quotes
      }
  
      // At this point we should have a clean JSON string
      // Remove any leading/trailing whitespace
      jsonStr = jsonStr.trim();
  
      // Ensure we have proper JSON structure
      if (!jsonStr.startsWith("{")) jsonStr = "{" + jsonStr;
      if (!jsonStr.endsWith("}")) jsonStr += "}";
  
      // Validate by parsing
      const parsed = JSON.parse(jsonStr);
  
      // Ensure required structure
      if (!parsed.type) parsed.type = "doc";
      if (!parsed.content) parsed.content = [];
  
      // Return pretty-printed JSON
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      console.error("Failed to clean JSON:", e);
      throw new Error(`JSON validation failed: ${e}`);
    }
  };
  
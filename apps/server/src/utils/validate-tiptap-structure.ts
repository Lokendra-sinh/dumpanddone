export const validateTiptapStructure = (json: any): void => {
    // Validate root structure
    if (!json.type || json.type !== "doc") {
      throw new Error("Invalid root structure: missing or invalid type");
    }
  
    if (!Array.isArray(json.content)) {
      throw new Error("Invalid root structure: content must be an array");
    }
  
    // Validate minimum content requirements
    if (json.content.length < 3) {
      throw new Error("Document must have at least title, author, and read time");
    }
  
    // Validate specific node types
    const validateNode = (node: any, path = "") => {
      if (!node.type) {
        throw new Error(`Missing type at ${path}`);
      }
  
      switch (node.type) {
        case "heading":
          if (
            !node.attrs?.level ||
            ![1, 2, 3, 4, 5, 6].includes(node.attrs.level)
          ) {
            throw new Error(`Invalid heading level at ${path}`);
          }
          break;
        case "text":
          if (typeof node.text !== "string") {
            throw new Error(`Invalid text content at ${path}`);
          }
          break;
        case "paragraph":
          if (!Array.isArray(node.content)) {
            throw new Error(`Invalid paragraph content at ${path}`);
          }
          break;
        case "bulletList":
        case "orderedList":
          if (!Array.isArray(node.content)) {
            throw new Error(`Invalid list content at ${path}`);
          }
          break;
        case "listItem":
          if (!Array.isArray(node.content)) {
            throw new Error(`Invalid list item content at ${path}`);
          }
          break;
        case "blockquote":
          if (!Array.isArray(node.content)) {
            throw new Error(`Invalid blockquote content at ${path}`);
          }
          break;
      }
  
      // Recursively validate content
      if (Array.isArray(node.content)) {
        node.content.forEach((child: any, index: number) => {
          validateNode(child, `${path}[${index}]`);
        });
      }
  
      // Validate marks
      if (Array.isArray(node.marks)) {
        node.marks.forEach((mark: any, index: number) => {
          if (!["bold", "italic", "code", "link"].includes(mark.type)) {
            throw new Error(`Invalid mark type at ${path}.marks[${index}]`);
          }
          if (mark.type === "link" && !mark.attrs?.href) {
            throw new Error(
              `Missing href in link mark at ${path}.marks[${index}]`,
            );
          }
        });
      }
    };
  
    // Validate document structure
    const [title, author, readTime, ...rest] = json.content;
  
    if (title.type !== "heading" || title.attrs?.level !== 1) {
      throw new Error("First node must be h1 title");
    }
  
    if (author.type !== "paragraph") {
      throw new Error("Second node must be author paragraph");
    }
  
    if (readTime.type !== "paragraph") {
      throw new Error("Third node must be read time");
    }
  
    // Validate all nodes recursively
    json.content.forEach((node: any, index: number) => {
      validateNode(node, `content[${index}]`);
    });
  };
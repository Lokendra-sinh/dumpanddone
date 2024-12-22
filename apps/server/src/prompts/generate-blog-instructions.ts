import { OutlineSectionType } from "@dumpanddone/types";
type ModelType = "claude" | "deepseek" | "gpt";

export const MODEL_CONFIGS = {
  claude: {
    maxTokens: 8192,
    targetTokens: 7000,
  },
  deepseek: {
    maxTokens: 4000,
    targetTokens: 8000,
  },
  gpt: {
    maxTokens: 4000,
    targetTokens: 8000,
  },
} as const;

export const blogGeneratorPrompt = (
  chaos: string,
  outline: OutlineSectionType[],
  model: ModelType = "claude"
) => {
  const { targetTokens } = MODEL_CONFIGS[model];
  const avgTokensPerSection = Math.floor(targetTokens / (outline.length + 3));

  return `You are an advanced language model specialized in transforming chaotic, unfiltered content into well-structured blog posts using TIPTAP JSON nodes. Your goal is to produce a highly engaging, natural-flowing blog post that maintains the user's original tone, perspective, and style.

<INTERNAL CHAIN-OF-THOUGHT STEPS (DO NOT REVEAL TO USER)>
1. Analyze the raw 'chaos' content to identify main themes, tone, perspective (e.g., first-person "I"), style, and emotional intent.
2. If user writes in first-person ("I"), preserve that voice throughout. Mirror their exact style and tone.
3. Use ALL content from chaos as source material - don't omit key details or insights.
4. Create varied, natural-flowing sections. Avoid repetitive structures.
5. Generate engaging, specific state messages for both major sections and individual nodes.
6. Create organic section lengths with natural pacing and flow.
7. Craft an attention-grabbing title and compelling introduction.
8. Manage token usage while maintaining high-quality content.
9. Ensure valid TIPTAP JSON format for all nodes.
10. Focus on continuous user engagement through granular state updates.
</INTERNAL CHAIN-OF-THOUGHT STEPS>

REQUIRED BLOG STRUCTURE:
1. Title Block (MANDATORY):
   - Captivating H1 title (NOT academic/generic)
   - Author information
   - Read time estimation

2. Introduction Block:
   - Hook/attention grabber
   - Context setting
   - Main thesis/purpose
   - Should glue the users to keep reading

3. Main Content Sections:
   - Follow provided outline
   - Clear hierarchy (H2, H3 where needed)
   - Rich content variety (paragraphs, lists, quotes, code)
   - Smooth transitions

4. Conclusion Block:
   - Key takeaways
   - Final thoughts/call to action

STATE MESSAGES:
- Keep messages concise and informative
- Show current generation progress
Examples:
"Crafting attention-grabbing title..."
"Adding author info..."
"Creating introduction..."
"Expanding on [specific topic]..."
"Adding code example..."
"Summarizing key points..."

STREAMING FORMAT (EXTREMELY CRITICAL):
You must stream content in alternating state and node pairs using XML-style tags:

<s>state message here</s>
<n>tiptap json node here</n>
<s>another state message</s>
<n>another tiptap node</n>

CRITICAL FORMAT RULES:
- No newlines between tags
- State messages must be wrapped in <s>...</s>
- Nodes must be wrapped in <n>...</n>
- Tags must be in strict alternating order
- Each node must be valid TIPTAP JSON

Example stream (without newlines):
<s>Creating title...</s><n>{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Example Title"}]}</n><s>Adding author...</s><n>{"type":"paragraph","content":[{"type":"text","text":"By Author"}]}</n>

QUALITY REQUIREMENTS (NEVER COMPROMISE):
- Title must be engaging and relevant
- Maintain consistent voice/perspective
- Use varied content types naturally
- Ensure smooth transitions
- Keep sections well-structured
- Preserve original tone
- Include all key points from chaos

NODE STRUCTURE REQUIREMENTS:
- Valid TIPTAP JSON format
- Proper type and attrs fields
- Correct content array structure
- No "doc" wrapper nodes

TOKEN MANAGEMENT:
- Total response within ${targetTokens}
- Base allocation: ${avgTokensPerSection} per section
- Priority sections: Up to 50% more tokens
- Maintain quality within limits

INPUT SOURCE:
<chaos>${chaos}</chaos>

OUTLINE TO FOLLOW:
<outline>${outline.map((section) => `Section Title: ${section.title}Section Description: ${section.description}Priority: ${section.isEdited ? "HIGH" : "NORMAL"}`).join("")}</outline>

CRITICAL RULES:
1. Never skip title block components
2. Maintain quality while showing progress
3. Keep content engaging and varied
4. Follow outline structure precisely
5. Preserve user's voice consistently
6. Stream tokens without newlines
7. ALWAYS use <s>...</s> for states and <n>...</n> for nodes

Begin streaming now.`;
};
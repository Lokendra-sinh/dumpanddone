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

3. Main Content Sections:
   - Follow provided outline
   - Clear hierarchy (H2, H3 where needed)
   - Rich content variety (paragraphs, lists, quotes, code)
   - Smooth transitions

4. Conclusion Block:
   - Key takeaways
   - Final thoughts/call to action

STATE MESSAGE HIERARCHY:
Level 1 (Major States) - For main sections:
- 5-10 words, thorough analysis
- Must show intelligent processing
- Examples:
  "Crafting an engaging title from your experience..."
  "Developing your key insights about [topic]..."
  "Synthesizing your thoughts on [concept]..."

Level 2 (Minor States) - For individual nodes:
- 3-5 words, quick updates
- Shows continuous progress
- Examples:
  "Adding code example..."
  "Expanding key point..."
  "Creating example list..."

STREAMING PROCESS:
1. START_STREAM

2. Title Block:
   STATE(L1): "Crafting attention-grabbing title..."
   NODE: {title}
   STATE(L2): "Adding author info..."
   NODE: {author}
   STATE(L2): "Calculating read time..."
   NODE: {read time}

3. For each main section:
   STATE(L1): {Section-level analysis}
   For each node in section:
     STATE(L2): {Node-specific update}
     NODE: {content}

4. END_STREAM

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
<chaos>
${chaos}
</chaos>

OUTLINE TO FOLLOW:
<outline>
${outline
  .map(
    (section) => `
  Section Title: ${section.title}
  Section Description: ${section.description}
  Priority: ${section.isEdited ? "HIGH" : "NORMAL"}
`
  )
  .join("\n")}
</outline>

CRITICAL RULES:
1. Never skip title block components
2. Maintain quality while showing progress
3. Use appropriate state level for context
4. Keep content engaging and varied
5. Follow outline structure precisely
6. Preserve user's voice consistently

Begin streaming now.`;
};
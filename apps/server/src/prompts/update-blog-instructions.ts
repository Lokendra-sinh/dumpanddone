import {
  ModelsType,
  TipTapContentType,
  TiptapDocument,
  TipTapNodeType,
} from "@dumpanddone/types";
import { MODEL_CONFIGS } from "./generate-blog-instructions";

export const blogContentUpdatePrompt = (
  userQuery: string,
  selectedContent: TipTapNodeType[],
  blogData: TiptapDocument,
  model: ModelsType = "claude"
) => {
  const { targetTokens } = MODEL_CONFIGS[model];

  return `You are an advanced language model specialized in real-time blog content updates. Your task is to transform selected content based on user requests while maintaining perfect consistency with the surrounding context.

<INTERNAL CHAIN-OF-THOUGHT STEPS (DO NOT REVEAL TO USER)>
1. Analyze user query to understand exact modification intent
2. Study selected content and its position within complete nodes
3. Identify unselected portions that should be preserved
4. Plan content changes while maintaining node integrity
5. Generate updates that seamlessly blend with preserved content
6. Prepare granular state updates for streaming
7. The stream should always end with NODE and NOT State - highly critical
</INTERNAL CHAIN-OF-THOUGHT STEPS>

SELECTION HANDLING RULES (CRITICAL):
1. Complete Sentence Selection:
   - If selection contains complete sentences/blocks
   - ALWAYS preserve unselected content exactly as is
   - Only generate new content for selected portion
   - Ensure new content flows naturally with preserved parts

2. Partial Selection Handling:
   - If selection breaks mid-sentence/word
   - Evaluate if preservation maintains coherence
   - Only then consider minimal necessary adjustments
   - Prioritize preserving unselected content

3. Absolute Preservation Rules:
   - Never modify content outside selection boundaries
   - Treat unselected content as immutable
   - Match tone/style with preserved content
   - Ensure grammatical flow at boundaries
  
SELECTION INTEGRITY RULES (CRITICAL):
1. Partial Word/Sentence Handling:
   - ALWAYS identify complete words when selection cuts mid-word
   - Find grammatically appropriate boundaries for partial sentences
   - Signal in state messages if adjusting selection boundaries
   - Example: "prog" in "programming" -> handle entire word

2. Unselected Content Preservation (HIGHEST PRIORITY):
   - Treat unselected content as IMMUTABLE
   - ALWAYS include unselected portions in output JSON
   - Maintain exact formatting and structure
   - Ensure seamless transitions with new content

3. Format Transformation Rules:
   - When converting formats (e.g., paragraph to bullets):
     a) Preserve unselected content structure
     b) Add transitional phrases if needed
     c) Maintain document flow


SMART PRESERVATION RULES (CRITICAL):
1. Semantic Unit Analysis:
   - Identify if unselected content is part of same semantic unit
   - Look for markers like:
     * Enumeration ("first", "second", "third")
     * List introductions ("here are", "key points:")
     * Sequential connectors ("and", "also", "finally")

2. Coherence Priority:
   - If preserving unselected text BREAKS coherence:
     * Consider including it in transformation
     * Signal this decision in state messages
     * Maintain semantic integrity

3. Format Consistency:
   - For format transformations (like bullets):
     * Check if unselected text is part of same list/sequence
     * Consider converting entire semantic unit
     * Preserve true independent content

STREAMING FORMAT (CRITICAL):
Stream in alternating state and node pairs:
<s>state message here</s>
<n>tiptap json node here</n>

Example stream:
<s>Analyzing selection...</s>
<s>Converting paragraph to bullet points...</s>
<n>{valid tiptap json}</n>
<s>Adding examples...</s>
<n>{valid tiptap json}</n>

USER'S REQUEST:
<user_query>${userQuery}</user_query>

SELECTED CONTENT:
<selected_content>
${JSON.stringify(selectedContent, null, 2)}
</selected_content>

BLOG CONTEXT:
<blog_data>
${JSON.stringify(blogData, null, 2)}
</blog_data>

CRITICAL REQUIREMENTS:
1. Content Preservation:
   - Analyze if selected text splits words/sentences
   - Keep unselected portions where coherent
   - Signal in state messages if complete replacement needed

2. Node Generation:
   - Generate complete nodes, not partial updates
   - Blend preserved and new content naturally
   - Maintain structural integrity of nodes

3. Quality Checks:
   - Verify coherence between preserved and new content
   - Ensure grammatical correctness at boundaries
   - Maintain consistent tone and style

ERROR HANDLING:
1. Partial Selection Issues:
   - If selected text splits words: generate complete word
   - If selected text splits sentences: evaluate coherence
   - Signal any necessary complete replacements

2. Structure Preservation:
   - Never create H1 headings
   - Maintain node type consistency
   - Preserve formatting where appropriate



EXAMPLE RESPONSES:

1. Partial Word Selection Example:
INPUT: "Understanding programming fundamentals"
SELECTION: "program"
USER REQUEST: "Change to 'coding'"
EXPECTED OUTPUT:
<s>Analyzing partial word selection...</s>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "Understanding coding fundamentals" }
  ]
}</n>

2. Mid-Sentence Selection with Format Change:
INPUT: "The system process works in three steps: first we analyze input, then we transform data, finally we output results."
SELECTION: "first we analyze input, then we transform data"
USER REQUEST: "Make bullets"
EXPECTED OUTPUT:
<s>Converting to bullets while preserving sentence structure...</s>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "The system process works in three steps:" }
  ]
}</n>
<n>{
  "type": "bulletList",
  "content": [
    {
      "type": "listItem",
      "content": [{"type": "text", "text": "First we analyze input"}]
    },
    {
      "type": "listItem",
      "content": [{"type": "text", "text": "Then we transform data"}]
    }
  ]
}</n>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": ", finally we output results." }
  ]
}</n>

3. Complex Format Preservation Example:
INPUT: "The **core system** includes _three main components_ and handles processing."
SELECTION: "**core system** includes _three"
USER REQUEST: "Update terminology"
EXPECTED OUTPUT:
<s>Preserving formatting while updating content...</s>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "The " },
    { "type": "text", "text": "primary architecture", "marks": [{ "type": "bold" }] },
    { "type": "text", "text": " includes " },
    { "type": "text", "text": "three main components", "marks": [{ "type": "italic" }] },
    { "type": "text", "text": " and handles processing." }
  ]
}</n>

2. Complete Sentence Selection
INPUT:
Original text:
"Deep learning has revolutionized AI. Neural networks can now perform complex tasks with remarkable accuracy. This has led to numerous breakthroughs."

Selected portion:
"Neural networks can now perform complex tasks with remarkable accuracy."

User prompt:
"Make it more technical with specific examples"

EXPECTED OUTPUT:
<s>Analyzing complete sentence selection...</s>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "Deep learning has revolutionized AI. Convolutional Neural Networks achieve 98.2% accuracy on image recognition tasks, while Transformers demonstrate near-human performance in language understanding. This has led to numerous breakthroughs." }
  ]
}</n>

3. Multiple Sentence Selection Across Paragraph
INPUT:
Original text:
"AI has many applications. Machine learning models are becoming increasingly sophisticated. They can handle complex tasks efficiently. This trend continues to grow. The future holds endless possibilities."

Selected portion:
"Machine learning models are becoming increasingly sophisticated. They can handle complex tasks efficiently. This trend continues to grow."

User prompt:
"Add specific industry applications"

EXPECTED OUTPUT:
<s>Analyzing multi-sentence selection...</s>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "AI has many applications. Machine learning models now power autonomous vehicles with 99.9% safety ratings and healthcare diagnostic systems with 95% accuracy. Financial institutions use these systems for real-time fraud detection processing millions of transactions per second. The adoption rate is accelerating exponentially. The future holds endless possibilities." }
  ]
}</n>

4. Mixed Formatting Text Selection
INPUT:
Original text:
"The **core concepts** of AI include _machine learning_ and **deep neural networks**, which form the _foundation_ of modern systems."

Selected portion:
"**core concepts** of AI include _machine learning_"

User prompt:
"Update with modern AI terminology"

EXPECTED OUTPUT:
<s>Analyzing formatted text selection...</s>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "The " },
    { "type": "text", "text": "foundational pillars", "marks": [{ "type": "bold" }] },
    { "type": "text", "text": " of AI include " },
    { "type": "text", "text": "transformer architectures", "marks": [{ "type": "italic" }] },
    { "type": "text", "text": " and " },
    { "type": "text", "text": "deep neural networks", "marks": [{ "type": "bold" }] },
    { "type": "text", "text": ", which form the " },
    { "type": "text", "text": "foundation", "marks": [{ "type": "italic" }] },
    { "type": "text", "text": " of modern systems." }
  ]
}</n>


Below are additional example responses following the same structure and style. Each showcases a specific selection scenario while adhering to the SELECTION HANDLING RULES and CRITICAL REQUIREMENTS.

1. Partial Word Selection
INPUT:
Original text:
"Understanding programming fundamentals is crucial for software development."

Selected portion:
"program"

User prompt:
"Change to 'coding'"

EXPECTED OUTPUT:
<s>Analyzing partial word selection...</s>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "Understanding coding fundamentals is crucial for software development." }
  ]
}</n>

2. Complete Sentence Selection
INPUT:
Original text:
"Deep learning has revolutionized AI. Neural networks can now perform complex tasks with remarkable accuracy. This has led to numerous breakthroughs."

Selected portion:
"Neural networks can now perform complex tasks with remarkable accuracy."

User prompt:
"Make it more technical with specific examples"

EXPECTED OUTPUT:
<s>Analyzing complete sentence selection...</s>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "Deep learning has revolutionized AI. Convolutional Neural Networks achieve 98.2% accuracy on image recognition tasks, while Transformers demonstrate near-human performance in language understanding. This has led to numerous breakthroughs." }
  ]
}</n>

3. Multiple Sentence Selection Across Paragraph
INPUT:
Original text:
"AI has many applications. Machine learning models are becoming increasingly sophisticated. They can handle complex tasks efficiently. This trend continues to grow. The future holds endless possibilities."

Selected portion:
"Machine learning models are becoming increasingly sophisticated. They can handle complex tasks efficiently. This trend continues to grow."

User prompt:
"Add specific industry applications"

EXPECTED OUTPUT:
<s>Analyzing multi-sentence selection...</s>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "AI has many applications. Machine learning models now power autonomous vehicles with 99.9% safety ratings and healthcare diagnostic systems with 95% accuracy. Financial institutions use these systems for real-time fraud detection processing millions of transactions per second. The adoption rate is accelerating exponentially. The future holds endless possibilities." }
  ]
}</n>

4. Mixed Formatting Text Selection
INPUT:
Original text:
"The **core concepts** of AI include _machine learning_ and **deep neural networks**, which form the _foundation_ of modern systems."

Selected portion:
"**core concepts** of AI include _machine learning_"

User prompt:
"Update with modern AI terminology"

EXPECTED OUTPUT:
<s>Analyzing formatted text selection...</s>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "The " },
    { "type": "text", "text": "foundational pillars", "marks": [{ "type": "bold" }] },
    { "type": "text", "text": " of AI include " },
    { "type": "text", "text": "transformer architectures", "marks": [{ "type": "italic" }] },
    { "type": "text", "text": " and " },
    { "type": "text", "text": "deep neural networks", "marks": [{ "type": "bold" }] },
    { "type": "text", "text": ", which form the " },
    { "type": "text", "text": "foundation", "marks": [{ "type": "italic" }] },
    { "type": "text", "text": " of modern systems." }
  ]
}</n>

1. Smart List Transformation:
INPUT: 
"Three essential points about AI: first we need data, second we need compute, and third we need algorithms."
SELECTION: "first we need data, second we need compute"
USER REQUEST: "Convert to bullets"

EXPECTED OUTPUT:
<s>Analyzing semantic unit...</s>
<s>Detected complete list structure - including third point for coherence...</s>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "Three essential points about AI:" }
  ]
}</n>
<n>{
  "type": "bulletList",
  "content": [
    {
      "type": "listItem",
      "content": [{"type": "text", "text": "First we need data"}]
    },
    {
      "type": "listItem",
      "content": [{"type": "text", "text": "Second we need compute"}]
    },
    {
      "type": "listItem",
      "content": [{"type": "text", "text": "Third we need algorithms"}]
    }
  ]
}</n>

2. Mixed Semantic Units:
INPUT:
"Introduction to AI. Three key components: data processing, model training, and inference. Future prospects look bright."
SELECTION: "data processing, model training"
USER REQUEST: "Make bullets"

EXPECTED OUTPUT:
<s>Analyzing context...</s>
<s>Detected list component with introduction - preserving structure...</s>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "Introduction to AI. Three key components:" }
  ]
}</n>
<n>{
  "type": "bulletList",
  "content": [
    {
      "type": "listItem",
      "content": [{"type": "text", "text": "Data processing"}]
    },
    {
      "type": "listItem",
      "content": [{"type": "text", "text": "Model training"}]
    },
    {
      "type": "listItem",
      "content": [{"type": "text", "text": "Inference"}]
    }
  ]
}</n>
<n>{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "Future prospects look bright." }
  ]
}</n>

6. Example for Partial Selection with End Preservation:

INPUT:
Original text:
"When implementing agents, we try to follow three core principles: maintain simplicity in your agent's design, prioritize transparency by explicitly showing the agent's planning steps, and carefully craft your agent-computer interface (ACI) through thorough tool documentation and testing."

Selected portion (bold):
"When implementing agents, we try to follow three core principles: **maintain simplicity in your agent's design, prioritize transparency by explicitly showing the agent'**s planning steps, and carefully craft your agent-computer interface (ACI) through thorough tool documentation and testing."

User prompt:
"Convert selected portion to bullet points"

EXPECTED OUTPUT:
<s>Analyzing partial selection with unselected ending...</s>
<s>Converting while preserving sentence structure...</s>
<n>{
  "type": "paragraph",
  "content": [
    {"type": "text", "text": "We prioritize these key principles:"}
  ]
}</n>
<n>{
  "type": "bulletList",
  "content": [
    {
      "type": "listItem",
      "content": [{
        "type": "paragraph",
        "content": [{"type": "text", "text": "Maintain simplicity in your agent's design"}]
      }]
    },
    {
      "type": "listItem",
      "content": [{
        "type": "paragraph",
        "content": [{"type": "text", "text": "Prioritize transparency in implementation"}]
      }]
    }
  ]
}</n>
<n>{
  "type": "paragraph",
  "content": [
    {"type": "text", "text": "Additionally, we emphasize showing the agent's planning steps, and carefully craft your agent-computer interface (ACI) through thorough tool documentation and testing."}
  ]
}</n>

IMPORTANT HANDLING NOTES:
1. LLM must analyze the complete node containing the selection
2. For partial selections that break mid-sentence:
   - Identify natural break points
   - Restructure to maintain readability
   - Add transitional phrases if needed
3. Preserve unselected text with proper context
4. Ensure grammatical continuity between new and preserved content
  
Begin streaming the updates now.`;

};







// 11. Table Cell Selection
// INPUT:
// Original text:
// "| Feature | Status |
// |---------|--------|
// | Login   | Done   |
// | Signup  | Pending|"

// Selected portion:
// "Pending"

// User prompt:
// "Change to In Progress"

// EXPECTED OUTPUT:
// <s>Analyzing table cell selection...</s>
// <n>{
//   "type": "doc",
//   "content": [
//     {
//       "type": "table",
//       "content": [
//         {
//           "type": "tableRow",
//           "content": [
//             {
//               "type": "tableHeader",
//               "content": [
//                 { "type": "text", "text": "Feature" }
//               ]
//             },
//             {
//               "type": "tableHeader",
//               "content": [
//                 { "type": "text", "text": "Status" }
//               ]
//             }
//           ]
//         },
//         {
//           "type": "tableRow",
//           "content": [
//             {
//               "type": "tableCell",
//               "content": [
//                 { "type": "text", "text": "Login" }
//               ]
//             },
//             {
//               "type": "tableCell",
//               "content": [
//                 { "type": "text", "text": "Done" }
//               ]
//             }
//           ]
//         },
//         {
//           "type": "tableRow",
//           "content": [
//             {
//               "type": "tableCell",
//               "content": [
//                 { "type": "text", "text": "Signup" }
//               ]
//             },
//             {
//               "type": "tableCell",
//               "content": [
//                 { "type": "text", "text": "In Progress" }
//               ]
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }</n>

// ---

// 12. Multiple Table Cells Selection
// INPUT:
// Original text:
// "| Task   | Priority | Status    |
// |--------|----------|-----------|
// | Design | High     | Completed |
// | API    | Medium   | Ongoing   |
// | QA     | Low      | Not Started|"

// Selected portion:
// "Priority | Status
// High     | Completed
// Medium   | Ongoing"

// User prompt:
// "Merge these into a single column called 'Progress'"

// EXPECTED OUTPUT:
// <s>Analyzing multiple table cells selection...</s>
// <n>{
//   "type": "doc",
//   "content": [
//     {
//       "type": "table",
//       "content": [
//         {
//           "type": "tableRow",
//           "content": [
//             {
//               "type": "tableHeader",
//               "content": [
//                 { "type": "text", "text": "Task" }
//               ]
//             },
//             {
//               "type": "tableHeader",
//               "content": [
//                 { "type": "text", "text": "Progress" }
//               ]
//             }
//           ]
//         },
//         {
//           "type": "tableRow",
//           "content": [
//             {
//               "type": "tableCell",
//               "content": [
//                 { "type": "text", "text": "Design" }
//               ]
//             },
//             {
//               "type": "tableCell",
//               "content": [
//                 { "type": "text", "text": "High - Completed" }
//               ]
//             }
//           ]
//         },
//         {
//           "type": "tableRow",
//           "content": [
//             {
//               "type": "tableCell",
//               "content": [
//                 { "type": "text", "text": "API" }
//               ]
//             },
//             {
//               "type": "tableCell",
//               "content": [
//                 { "type": "text", "text": "Medium - Ongoing" }
//               ]
//             }
//           ]
//         },
//         {
//           "type": "tableRow",
//           "content": [
//             {
//               "type": "tableCell",
//               "content": [
//                 { "type": "text", "text": "QA" }
//               ]
//             },
//             {
//               "type": "tableCell",
//               "content": [
//                 { "type": "text", "text": "Low - Not Started" }
//               ]
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }</n>

// ---

// 13. Blockquote Selection
// INPUT:
// Original text:
// "> Innovation distinguishes between a leader and a follower. - Steve Jobs

// This quote inspires many tech entrepreneurs."

// Selected portion:
// "Innovation distinguishes between a leader and a follower. - Steve Jobs"

// User prompt:
// "Shorten the quote and make it anonymous"

// EXPECTED OUTPUT:
// <s>Analyzing blockquote selection...</s>
// <n>{
//   "type": "doc",
//   "content": [
//     {
//       "type": "blockquote",
//       "content": [
//         {
//           "type": "paragraph",
//           "content": [
//             { "type": "text", "text": "Innovation defines leadership." }
//           ]
//         }
//       ]
//     },
//     {
//       "type": "paragraph",
//       "content": [
//         { 
//           "type": "text", 
//           "text": "This quote inspires many tech entrepreneurs." 
//         }
//       ]
//     }
//   ]
// }</n>

// ---

// 14. Nested Blockquote Selection
// INPUT:
// Original text:
// "> Outer quote
// > > Nested quote
// This section follows the quotes."

// Selected portion:
// "> Nested quote"

// User prompt:
// "Replace with a different quote"

// EXPECTED OUTPUT:
// <s>Analyzing nested blockquote selection...</s>
// <n>{
//   "type": "doc",
//   "content": [
//     {
//       "type": "blockquote",
//       "content": [
//         {
//           "type": "paragraph",
//           "content": [
//             { "type": "text", "text": "Outer quote" }
//           ]
//         },
//         {
//           "type": "blockquote",
//           "content": [
//             {
//               "type": "paragraph",
//               "content": [
//                 { "type": "text", "text": "A journey of a thousand miles begins with a single step." }
//               ]
//             }
//           ]
//         }
//       ]
//     },
//     {
//       "type": "paragraph",
//       "content": [
//         { "type": "text", "text": "This section follows the quotes." }
//       ]
//     }
//   ]
// }</n>

// ---
export const outlineGeneratorPrompt = (
  content: string
) => `You will analyze the provided content and generate a comprehensive blog post outline in a strict format that can be streamed token by token. Your goal is to break down the content into as many meaningful sections as needed to cover EVERYTHING important.

${content}

CRITICAL SECTION GENERATION RULES:
1. NO ARBITRARY SECTION LIMITS! Generate as many sections as the content requires
2. Each major concept deserves its own section
3. Break down complex topics into multiple sub-sections
4. Don't combine unrelated concepts into single sections
5. Create dedicated sections for:
   - Technical details
   - Implementation steps
   - Real-world examples
   - Common challenges
   - Best practices
   - Future implications

SECTION COVERAGE PRINCIPLES:
1. Granular Topic Breakdown:
   - Split broad topics into specific aspects
   - Create separate sections for different approaches/methods
   - Dedicate sections to edge cases and considerations

2. Depth Indicators:
   If content mentions:
   - Technical implementation → Create separate sections for setup, configuration, usage
   - Multiple approaches → Dedicate section to each approach
   - Challenges/solutions → Split into problem and solution sections
   - Examples → Create dedicated example sections
   - Best practices → Make it its own section

3. Section Expansion Triggers:
   - Complex concepts → Break into foundational and advanced sections
   - Step-by-step processes → Each major step gets a section
   - Comparative analysis → Separate sections for each option
   - Case studies → Individual sections for each case

Output Format Requirements:
1. Each section must be wrapped in <s> tags
2. Inside each <s> tag:
   - One title in <t> tags
   - One description in <d> tags
3. Format: <s><t>{title}</t><d>{description}</d></s>
4. Descriptions: 50-80 words, engaging and informative
5. NO MAXIMUM SECTION LIMIT - create as many as needed!
6. Use only specified tags: <s>, </s>, <t>, </t>, <d>, </d>
7. Pure section output - no additional text

Section Title Guidelines:
1. Clear and descriptive
2. Action-oriented when possible
3. Engaging and curiosity-provoking
4. Avoid generic titles
5. Include specifics where relevant

Description Guidelines:
1. Hook reader interest
2. Preview valuable insights
3. Hint at practical applications
4. Mention key takeaways
5. Create anticipation for section content

Example Format:
<s><t>Mastering State Management Patterns</t><d>Dive deep into advanced state management techniques that go beyond basic useState. We'll explore the power of useReducer for complex state logic, context optimization patterns for performance, and cutting-edge state synchronization strategies. Essential knowledge for building scalable React applications.</d></s><s><t>Performance Optimization Deep-Dive</t><d>Unlock the secrets of React performance optimization. From memo and useMemo to strategic component splitting and lazy loading, discover battle-tested techniques to make your apps lightning fast. Learn when and how to implement these optimizations for maximum impact.</d></s>

Remember:
- Generate as many sections as needed to cover ALL content
- Each section should be focused and specific
- Better to have more focused sections than fewer broad ones
- Include practical applications and real-world relevance
- Keep descriptions compelling and value-focused`
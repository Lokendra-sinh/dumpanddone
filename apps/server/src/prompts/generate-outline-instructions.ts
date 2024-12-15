export const outlineGeneratorPrompt = (
  content: string
) => `You will analyze the provided content and generate a blog post outline in a strict format that can be streamed token by token. The outline should consist of logical sections that capture the essence of the provided content.

${content}

Output Format Requirements:
1. Each section must be wrapped in <s> tags
2. Inside each <s> tag, there must be exactly one title wrapped in <t> tags and one description wrapped in <d> tags
3. The section format must be: <s><t>{title}</t><d>{description}</d></s>
4. Descriptions must be 50-80 words
5. Generate between 3-7 sections or even more than 7 sections depending on content complexity. The sections should capture the essence of the entire content shared by the user.
6. Use only the specified tags: <s>, </s>, <t>, </t>, <d>, </d>
7. Output nothing except the formatted sections
8. Do not include any explanatory text, comments, or additional characters

Format Example:
<s><t>Understanding Cloud Computing Basics</t><d>Cloud computing fundamentally transforms how businesses manage their IT infrastructure. This section explores the core concepts of cloud services, including IaaS, PaaS, and SaaS models. We'll examine how cloud computing enables scalability, reduces operational costs, and provides flexibility for modern businesses.</d></s><s><t>Security Challenges in Cloud Adoption</t><d>While cloud computing offers numerous benefits, it also presents unique security challenges. Organizations must address data privacy, compliance requirements, and potential vulnerabilities. This section discusses key security considerations and best practices for secure cloud deployment.</d></s>

Guidelines for Content Analysis:
1. If multiple unrelated topics are present, prioritize the most substantial or impactful content
2. Create a logical flow between sections when possible, but don't force connections between unrelated content
3. Ensure titles are clear and descriptive
4. Make descriptions informative and engaging while maintaining the word limit
5. Focus on key insights and main points rather than trying to include everything
6. Make the section titles and description convincing and persuasive for users to read. DON'T MAKE IT BORING. KEEP IT EXCITING`;

SO we are building DUMPANDDONE - a platform that converts your scattered/random/unfiltered data, conversations, text content, and docs into professional blog post.

so users dump their content in the content box on our platform and then hit generate outline button. We send a socket event to our server, which then instructs our llm to generate outline for the given content and stream the outline.

On client side, we parse the tokens and construct sections (title and description) dynamically and render them in the "outline" tab with a fade in animation. once all the sections are generated, we allow users to modify or add sections.

Once user is satisfied with the ooutline, the hit generate blog button. we again send the socket event to our server, which then passes th outline along with the content (chaos dumped by user) and ask llm to generate the blog. this is also treaming where we ask llm to generate blog in certain structure as given below:

STREAMING FORMAT (EXTREMELY CRITICAL):
You must stream content in alternating state and node pairs using XML-style tags:

<s>state message here</s>
<n>tiptap json node here</n>
<s>another state message</s>
<n>another tiptap node</n>


once the blog is generated, user can select text they don't like and fill it with AI. As soon as they select some text in the tiptap editor, we open up a dialog box with the cursor blinking in the ai prompt box where they can enter their prompt, which we send to our server as a request repsonse model where the llm generates the new tiptap josn nodes whcih we send to client, and client renders them in a popup box.

when user selects "replace text" we replace the selected text with new nodes. currently it is a req-res but we are converting this to streaming as well.
export const prompts = {
  ask_for_description: (question) =>
    `You're a title generating machine. Rules:

  - You're always returning tile and title only
  - The title is not wrapped in quotes or any other marking
  - The title is as short and as concise as possible
  - The title describes the question <query>${question}</query>`,
  generate_keywords: (question) =>
    `You're a keyword generating machine. Whatever text you're provided with you're always returning only keywords and sentences that help the user to find their data, provide keywords only in form of a comma delimited list. The text is: "${question}"`,
  extend_with_website: (website, url) =>
    `Use this (${url}) website content for your response, if the content doesn't answer the question - say it, at the end include the link to the website:
  ${website}`,
  // extend_with_documents: (documents) =>
  //   `Use these documents content for your response. Always end your response with a formatted list of used filePaths that actually relate to the question. If documents dont contain the answer say that you dont know. document structure is [start] filePath: file path, pageContent: document contents  [end] The list of documents is ${documents}`,
  extend_with_documents: (documents) => `
  **Generate Response to User Query**
**Step 1: Parse Context Information**
Extract and utilize relevant knowledge from the provided context within \`<context></context>\` XML tags.
**Step 2: Analyze User Query**
Carefully read and comprehend the user's query, pinpointing the key concepts, entities, and intent behind the question.
**Step 3: Determine Response**
If the answer to the user's query can be directly inferred from the context information, provide a concise and accurate response in the same language as the user's query.
**Step 4: Handle Uncertainty**
If the answer is not clear, ask the user for clarification to ensure an accurate response.
**Step 5: Avoid Context Attribution**
When formulating your response, do not indicate that the information was derived from the context.
**Step 6: Respond in User's Language**
Maintain consistency by ensuring the response is in the same language as the user's query.
**Step 7: Provide Response**
Generate a clear, concise, and informative response to the user's query, adhering to the guidelines outlined above.
<context>
${documents}
</context>
  `,
  index_code:
    () => `You're indexing machine. When user sends message you'll answer only in valid JSON, precisely and on point by following this template:
  { description: [biref description of a file], language: [language of the file], functions: [JSON array of functions in the code files]}`,
  geneare_search_query: (question) => `
  You're a search query parser. For every input you provide a search query that will lead to best results that will allow to answer user question. You're providing search query only. The question is: "${question}"`,
  pick_search_result: (results, question) => `
  You're a search machine. When given the list of websites and a question you return full url of the one that should contain information that should help answer the question.
  These are search results: ${JSON.stringify(
    results.map((elem) => ({
      url: elem.url,
      title: elem.title,
      content: elem.content,
    }))
  )}.
  User query: "${question}"
  `,
  should_search: (question) => `
  question: ${question} context: Should we rely on your knowledge to answer this question or seek external verification through an internet search? Please respond with one of the following options:
* False - Rely on LLM Knowledge: The question can be answered accurately using general knowledge and explanations.
* True - Seek External Verification: The question requires specialized, technical, or up-to-date information that may not be available in my training data. 

Answer with true or false only.
  `,
};

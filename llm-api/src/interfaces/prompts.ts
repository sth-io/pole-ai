export const prompts = {
  ask_for_description: (question) =>
    `You're a title generating machine. Whatever text you're provided with you're always returning only a title that shortly summarises the contents. The content is: "${JSON.stringify(
      question
    )}": `,
  generate_keywords: (question) =>
    `You're a keyword generating machine. Whatever text you're provided with you're always returning only keywords and sentences that help the user to find their data, provide keywords only in form of a comma delimited list. The text is: "${question}"`,
  extend_with_website: (website, url) =>
    `Use this (${url}) website content for your response, if the content doesn't answer the question - say it, at the end include the link to the website:
  ${website}`,
  extend_with_documents: (documents) =>
    `Use these documents content for your response. Always end your response with a formatted list of used filePaths that actually relate to the question. If documents dont contain the answer say that you dont know. document structure is [start] filePath: file path, pageContent: document contents  [end] The list of documents is ${documents}`,
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
  This is the question: "${question}"
  `,
  should_search: (question) => `
  question: ${question} context: Should we rely on your knowledge to answer this question or seek external verification through an internet search? Please respond with one of the following options:
* False - Rely on LLM Knowledge: The question can be answered accurately using general knowledge and explanations.
* True - Seek External Verification: The question requires specialized, technical, or up-to-date information that may not be available in my training data. 

Answer with true or false only.
  `,
};

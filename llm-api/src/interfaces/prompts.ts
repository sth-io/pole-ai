export const prompts = {
  ask_for_description: (question) =>
    `You're a title generating machine. Whatever text you're provided with you're always returning only a title that shortly summarises the contents. The content is: "${JSON.stringify(
      question
    )}": `,
  generate_keywords: (question) =>
    `You're a keyword generating machine. Whatever text you're provided with you're always returning only keywords and sentences that help the user to find their data, provide keywords only in form of a comma delimited list. The text is: "${question}"`,
  extend_with_website: (website) =>
    `Use this website content for your response, make it clear what is coming from the website content and what's not:
  ${website}`,
  extend_with_documents: (documents) =>
    `Use these documents content for your response. Always end your response with a formatted list of used filePaths that actually relate to the question. If documents dont contain the answer say that you dont know. document structure is [start] filePath: file path, pageContent: document contents  [end] The list of documents is ${documents}`,
  index_code: () => `You're indexing machine. When user sends message you'll answer only in valid JSON, precisely and on point by following this template:
  { description: [biref description of a file], language: [language of the file], functions: [JSON array of functions in the code files]}`
};

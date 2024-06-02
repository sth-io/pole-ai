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
    `Use these documents content for your response. End your response with a list of used document names. If documents dont contain the answer say that you dont know. document structure is pageContent document contents, name document name. The list of documents is ${documents}`,
};

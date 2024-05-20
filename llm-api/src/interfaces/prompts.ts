export const prompts = {
  ask_for_description: (question) =>
    `create a one sentence summary and summary only. Do not say anything else, do not confirm, just summary to this text: ${JSON.stringify(
      question
    )}`,
};

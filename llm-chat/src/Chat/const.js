export const OPTIONS = {
//   num_keep: 5,
  // Sets the random number seed to use for generation. Setting this to a specific number will make the model generate the same text for the same prompt. (defaultValue: 0)
  seed: {
    label: 'seed',
    type: "NumberInput",
    defaultValue: 0,
    min: 0,
    tooltip: 'Reduces the probability of generating nonsense. A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative. (defaultValue: 40)'
  },
  // Maximum number of tokens to predict when generating text. (defaultValue: 128, -1 = infinite generation, -2 = fill context)
  num_predict: {
    label: 'num predict',
    type: "Number",
    defaultValue: 128,
    min: -2,
    tooltip: 'Maximum number of tokens to predict when generating text. (defaultValue: 128, -1 = infinite generation, -2 = fill context)'
  },
  // Reduces the probability of generating nonsense. A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative. (defaultValue: 40)
  top_k: {
    label: 'top k',
    type: "Number",
    defaultValue: 40,
    min: 0,
    max: 100,
    tooltip: `Reduces the probability of generating nonsense. A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative. (defaultValue: 40)`
  },
  // Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text. (defaultValue: 0.9)
  top_p: {
    label: 'top p',
    type: "Number",
    defaultValue: 0.9,
    min: 0,
    max: 1,
    decimal: 0.1,
    tooltip: `Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text. (defaultValue: 0.9)`
  },
  //   Tail free sampling is used to reduce the impact of less probable tokens from the output. A higher value (e.g., 2.0) will reduce the impact more, while a value of 1.0 disables this setting. (defaultValue: 1)
  tfs_z: {
    label: 'tail free',
    type: "Number",
    min: 1,
    max: 10,
    defaultValue: 1,
    tooltip: `Tail free sampling is used to reduce the impact of less probable tokens from the output. A higher value (e.g., 2.0) will reduce the impact more, while a value of 1.0 disables this setting. (defaultValue: 1)`
  },
//   typical_p: 0.7,
//   // Sets how far back for the model to look back to prevent repetition. (defaultValue: 64, 0 = disabled, -1 = num_ctx)
//   repeat_last_n: 33,
  // The temperature of the model. Increasing the temperature will make the model answer more creatively. (defaultValue: 0.8)
  temperature: {
    label: 'temperature',
    type: 'Number',
    min: 0,
    max: 10,
    defaultValue: 0.8,
    decimal: 0.1,
    tooltip: `The temperature of the model. Increasing the temperature will make the model answer more creatively. (defaultValue: 0.8)`

  },
  // Sets how strongly to penalize repetitions. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient. (defaultValue: 1.1)
  repeat_penalty: {
    label: 'repeat penality',
    type: "Number",
    min: 0,
    max: 4,
    defaultValue: 1.1,
    decimal: 0.1,
    tooltip: `Sets how strongly to penalize repetitions. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient. (defaultValue: 1.1)`
  },
  num_ctx: {
    label: 'context size',
    type: "Number",
    min: 1024,
    max: 128000,
    step: 1024,
    defaultValue: 35000,
    tooltip: `sets the context window size, this controls how many tokens the LLM can use as context to generate the next token`
  }
//   presence_penalty: 1.5,
//   frequency_penalty: 1.0,
  //   Enable Mirostat sampling for controlling perplexity. (defaultValue: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0)
//   mirostat: {
//     type: "Enum",
//     options: [
//       { label: "disabled", value: 0 },
//       { label: "Mirostat", value: 1 },
//       { label: "Mirostat 2.0", value: 2 },
//     ],
//   },
//   //   Controls the balance between coherence and diversity of the output. A lower value will result in more focused and coherent text. (defaultValue: 5.0)
//   mirostat_tau: 0.8,
//   // Influences how quickly the algorithm responds to feedback from the generated text. A lower learning rate will result in slower adjustments, while a higher learning rate will make the algorithm more responsive. (defaultValue: 0.1)
//   mirostat_eta: 0.6,
//   penalize_newline: true,
//   // Sets the stop sequences to use. When this pattern is encountered the LLM will stop generating text and return. Multiple stop patterns may be set by specifying multiple separate stop parameters in a modelfile.
//   stop: ["\n", "user:"],
//   numa: false,
//   //   Sets the size of the context window used to generate the next token. (defaultValue: 2048)
//   num_ctx: 1024,
//   num_batch: 2,
//   num_gqa: 1,
//   num_gpu: 1,
//   main_gpu: 0,
//   low_vram: false,
//   f16_kv: true,
//   vocab_only: false,
//   use_mmap: true,
//   use_mlock: false,
//   rope_frequency_base: 1.1,
//   rope_frequency_scale: 0.8,
//   num_thread: 8,
};

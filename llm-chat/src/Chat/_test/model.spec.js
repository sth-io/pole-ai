import { chunkFallbackMechanism, makeDivergedHistory } from "../model";

describe("makeDivergedHistory", () => {
  const data = [
    {
      name: "success path",
      chat: [
        { a: 1, stamp: 1 },
        { a: 10, stamp: 2 },
        { a: 50, stamp: 3 },
      ],
      timestamp: 2,
      result: [
        { a: 1, stamp: 1 },
        { a: 10, stamp: 2 },
      ],
    },
    {
      name: "value does not exist",
      chat: [
        { a: 1, stamp: 1 },
        { a: 10, stamp: 2 },
        { a: 50, stamp: 3 },
      ],
      timestamp: 5,
      result: [
        { a: 1, stamp: 1 },
        { a: 10, stamp: 2 },
        { a: 50, stamp: 3 },
      ],
    },
    {
      name: "last element selected",
      chat: [
        { a: 1, stamp: 1 },
        { a: 10, stamp: 2 },
      ],
      timestamp: 2,
      result: [
        { a: 1, stamp: 1 },
        { a: 10, stamp: 2 },
      ],
    },
  ];

  test.each(data)(
    "should properly prepare new history when: $name",
    ({ chat, timestamp, result }) => {
      const res = makeDivergedHistory(chat, timestamp);
      expect(res).toEqual(result);
    }
  );
});

describe("fallbackChunkMechanism", () => {
  const cases = [
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.003571Z",
      message: { role: "assistant", content: "C" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.051478Z",
      message: { role: "assistant", content: "ertain" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.101126Z",
      message: { role: "assistant", content: "ly" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.151689Z",
      message: { role: "assistant", content: "!" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.201804Z",
      message: { role: "assistant", content: " To" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.25046Z",
      message: { role: "assistant", content: " provide" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.29986Z",
      message: { role: "assistant", content: " a" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.349087Z",
      message: { role: "assistant", content: " helpful" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.399396Z",
      message: { role: "assistant", content: " response" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.452979Z",
      message: { role: "assistant", content: "," },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.503639Z",
      message: { role: "assistant", content: " I" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.555887Z",
      message: { role: "assistant", content: "'" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.604379Z",
      message: { role: "assistant", content: "ll" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.653642Z",
      message: { role: "assistant", content: " need" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.703935Z",
      message: { role: "assistant", content: " more" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.753483Z",
      message: { role: "assistant", content: " context" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.805351Z",
      message: { role: "assistant", content: " or" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.856053Z",
      message: { role: "assistant", content: " details" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.906385Z",
      message: { role: "assistant", content: " about" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:27.955692Z",
      message: { role: "assistant", content: " what" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.00579Z",
      message: { role: "assistant", content: " specific" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.056762Z",
      message: { role: "assistant", content: ' "' },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.106209Z",
      message: { role: "assistant", content: "test" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.155673Z",
      message: { role: "assistant", content: '"' },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.205245Z",
      message: { role: "assistant", content: " you" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.254712Z",
      message: { role: "assistant", content: " are" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.30471Z",
      message: { role: "assistant", content: " referring" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.35523Z",
      message: { role: "assistant", content: " to" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.406249Z",
      message: { role: "assistant", content: "." },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.456614Z",
      message: { role: "assistant", content: " Are" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.514169Z",
      message: { role: "assistant", content: " you" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.566367Z",
      message: { role: "assistant", content: " seeking" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.621469Z",
      message: { role: "assistant", content: " assistance" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.672024Z",
      message: { role: "assistant", content: " with" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.721768Z",
      message: { role: "assistant", content: " prepar" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.772937Z",
      message: { role: "assistant", content: "ing" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.822234Z",
      message: { role: "assistant", content: " for" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.872416Z",
      message: { role: "assistant", content: " an" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.921769Z",
      message: { role: "assistant", content: " exam" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:28.972089Z",
      message: { role: "assistant", content: "," },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:29.022667Z",
      message: { role: "assistant", content: " troubles" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:29.072105Z",
      message: { role: "assistant", content: "ho" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:29.123099Z",
      message: { role: "assistant", content: "oting" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:29.172566Z",
      message: { role: "assistant", content: " software" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:29.222897Z",
      message: { role: "assistant", content: " testing" },
      done: false,
    },
    {
      model: "phi3:3.8b-mini-instruct-4k-q4_K_M",
      created_at: "2024-05-07T21:33:29.273561Z",
      message: { role: "assistant", content: " procedures" },
      done: false,
    },
  ];

  test.each(cases)("should properly run fallback extraction", (chunk) => {
    const res = chunkFallbackMechanism(JSON.stringify(chunk));
    expect(res).toEqual(chunk.message.content);
  });
});

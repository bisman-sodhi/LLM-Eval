import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [
    {"role": "user", "content": "write a haiku about ai"},
  ],
});

completion.then((result) => console.log(result.choices[0].message));
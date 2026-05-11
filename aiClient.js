import OpenAI from "openai";
import "dotenv/config";

const client =
  new OpenAI({

    baseURL:
      "https://integrate.api.nvidia.com/v1",

    apiKey:
      process.env.NVIDIA_API_KEY
  });

export async function askAI(
  prompt
) {

  const completion =
    await client.chat.completions.create({

      model:
        "qwen/qwen3-coder-480b-a35b-instruct",

      messages: [
        {
          role: "user",
          content: prompt
        }
      ],

      temperature: 0.2,

      top_p: 0.8,

      max_tokens: 4096
    });

  return completion
    .choices[0]
    .message.content;
}

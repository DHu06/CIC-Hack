import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_BEDROCK_REGION || "us-east-1",
});

export interface BedrockMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Call Amazon Bedrock with Claude Haiku 4.5 (anthropic.claude-3-5-haiku-20241022-v1:0)
 */
export async function callBedrock(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 1024
): Promise<string> {
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      { role: "user", content: userMessage }
    ],
  };

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-5-haiku-20241022-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
  // Claude returns { content: [{ type: "text", text: "..." }] }
  const textContent = responseBody.content?.find((block: any) => block.type === "text");
  if (!textContent) {
    throw new Error("No text content in Bedrock response");
  }
  
  return textContent.text;
}

/**
 * Call Bedrock and parse the response as JSON.
 * Strips markdown code fences if present.
 */
export async function callBedrockJSON<T>(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 1024
): Promise<T> {
  const text = await callBedrock(systemPrompt, userMessage, maxTokens);
  
  let jsonText = text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  
  return JSON.parse(jsonText);
}

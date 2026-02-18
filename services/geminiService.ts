
import { GoogleGenAI } from "@google/genai";
import { DEFAULT_MODEL, IMAGE_GEN_MODEL, SYSTEM_INSTRUCTION, THIRD_PARTY_MODELS } from "../constants";
import { Message, Role, ApiKeys, UserProfile } from "../types";

// Initialize API Client
const getClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Token Management Constants ---
const MAX_TOTAL_TOKENS = 1000000;
const SAFETY_MARGIN = 0.9;
const SAFE_TOKEN_LIMIT = MAX_TOTAL_TOKENS * SAFETY_MARGIN;
const CHARS_PER_TOKEN_EST = 4;
const MAX_TEXT_PART_LENGTH = 1000000;

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to construct system instruction with user profile
const buildSystemInstruction = (profile?: UserProfile) => {
  let instruction = SYSTEM_INSTRUCTION;

  if (profile) {
    const profileSections = [];
    if (profile.nickname) profileSections.push(`User's Name/Nickname: ${profile.nickname}`);
    if (profile.profession) profileSections.push(`User's Profession: ${profile.profession}`);
    if (profile.about) profileSections.push(`User Context/Background: ${profile.about}`);
    
    if (profileSections.length > 0) {
      instruction += `\n\n**User Profile:**\n${profileSections.join('\n')}`;
    }

    if (profile.customInstructions) {
      instruction += `\n\n**USER CUSTOM INSTRUCTIONS (CRITICAL - FOLLOW THESE):**\n${profile.customInstructions}`;
    }
  }

  return instruction;
};

const estimateTokens = (msg: Message): number => {
  let tokens = 0;
  if (msg.text) {
    tokens += msg.text.length / CHARS_PER_TOKEN_EST;
  }
  if (msg.attachments && msg.attachments.length > 0) {
    for (const att of msg.attachments) {
      if (att.mimeType.startsWith('text/') || att.mimeType === 'application/json' || att.originalFileType === 'docx' || att.originalFileType === 'txt') {
         tokens += att.data.length / CHARS_PER_TOKEN_EST;
      } else {
         tokens += 1000;
      }
    }
  }
  return Math.ceil(tokens);
};

const formatHistory = (messages: Message[]) => {
  return messages.map((msg) => {
    const parts: any[] = [];
    
    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach(att => {
        if (att.mimeType.startsWith('text/') || att.originalFileType === 'docx' || att.originalFileType === 'txt') {
          let textData = att.data;
          if (textData.length > MAX_TEXT_PART_LENGTH) {
             textData = textData.substring(0, MAX_TEXT_PART_LENGTH) + "\n... [Content truncated due to length limits]";
          }
          parts.push({
            text: `[File Content: ${att.name}]\n${textData}\n[End of File Content]`
          });
        } else {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data
            }
          });
        }
      });
    }

    if (msg.text) {
      parts.push({ text: msg.text });
    }

    if (parts.length === 0) {
       parts.push({ text: ' ' }); 
    }

    return {
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: parts
    };
  });
};

const getSmartContext = (history: Message[]): Message[] => {
  const validHistory = history.filter(msg => !msg.isError);
  const selectedMessages: Message[] = [];
  let currentTokens = 0;

  for (let i = validHistory.length - 1; i >= 0; i--) {
    const msg = validHistory[i];
    const msgTokens = estimateTokens(msg);

    if (currentTokens + msgTokens < SAFE_TOKEN_LIMIT) {
      selectedMessages.unshift(msg);
      currentTokens += msgTokens;
    } else {
      if (selectedMessages.length === 0) {
        selectedMessages.unshift(msg);
      }
      break; 
    }
  }
  return selectedMessages;
};

// --- Generic OpenAI-Compatible Fetcher ---
const streamOpenAICompatibleResponse = async (
  history: Message[],
  onChunk: (text: string) => void,
  apiKey: string,
  modelConfig: { baseUrl: string, value: string, label: string },
  userProfile?: UserProfile
): Promise<string> => {
  const context = getSmartContext(history);
  const systemInstruction = buildSystemInstruction(userProfile);
  
  // Convert internal Message format to OpenAI format
  const messages = [
    { role: 'system', content: systemInstruction },
    ...context.map(msg => {
      let contentParts: string[] = [];
      
      // Add text content
      if (msg.text && msg.text.trim()) {
        contentParts.push(msg.text);
      }

      // Add attachment content if available/supported
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          if (att.mimeType.startsWith('text/') || att.originalFileType === 'docx' || att.originalFileType === 'txt' || att.mimeType === 'application/json') {
             // Limit very large files to prevent context overflow in 3rd party models
             const safeData = att.data.length > 50000 ? att.data.substring(0, 50000) + "... [truncated]" : att.data;
             contentParts.push(`\n[File Content: ${att.name}]\n${safeData}\n`);
          } else {
             // Placeholder for binary files not supported in text-only endpoints
             contentParts.push(`\n[Attachment: ${att.name} (${att.mimeType})]\n`);
          }
        });
      }

      // 400 Error Fix: Content must not be empty.
      // If after processing text and attachments we have nothing, add a minimal placeholder.
      let finalContent = contentParts.join('\n').trim();
      if (!finalContent) {
         finalContent = "."; 
      }

      return {
        role: msg.role === Role.USER ? 'user' : 'assistant',
        content: finalContent
      };
    })
  ];

  let attempt = 0;
  const maxRetries = 10; // Increased retries for stability
  const baseDelay = 2000; // Increased base delay

  while (true) {
    try {
      const response = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelConfig.value,
          messages: messages,
          stream: true,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        // Handle Rate Limits (429) inside the loop
        if (response.status === 429 && attempt < maxRetries) {
          const errText = await response.text();
          console.warn(`429 Rate Limit from ${modelConfig.label}: ${errText}`);
          attempt++;
          const waitTime = baseDelay * Math.pow(1.5, attempt - 1) + (Math.random() * 1000); 
          await delay(waitTime);
          continue;
        }

        const err = await response.text();
        throw new Error(`API Error (${response.status}): ${err}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || "";
              
              if (content) {
                fullText += content;
                onChunk(fullText);
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }

      return fullText;

    } catch (error: any) {
      if (error.message.includes("Failed to fetch") && attempt < maxRetries) {
         attempt++;
         const waitTime = baseDelay * Math.pow(1.5, attempt - 1);
         await delay(waitTime);
         continue;
      }
      throw error;
    }
  }
};


/**
 * Unified Stream Response Function
 * Routes to Gemini SDK or Generic API based on model ID.
 */
export const streamChatResponse = async (
  history: Message[],
  onChunk: (text: string) => void,
  onMetadata: (metadata: any) => void,
  modelId: string,
  useSearch: boolean,
  apiKeys: ApiKeys,
  userProfile?: UserProfile
): Promise<string> => {
  
  // Explicitly check for empty model ID to avoid 404 Ambiguous request errors
  if (!modelId || modelId.trim() === '') {
    modelId = DEFAULT_MODEL;
  }

  // Check if it's a 3rd party model
  const thirdPartyModel = THIRD_PARTY_MODELS.find(m => m.value === modelId);

  if (thirdPartyModel) {
    const provider = thirdPartyModel.provider as keyof ApiKeys;
    const key = apiKeys[provider];
    
    if (!key) {
      throw new Error(`Please configure the API Key for ${thirdPartyModel.label} in Settings.`);
    }

    return await streamOpenAICompatibleResponse(history, onChunk, key, thirdPartyModel, userProfile);
  }

  // Default to Gemini (Google)
  return await streamGeminiResponse(history, onChunk, onMetadata, modelId, useSearch, userProfile);
};


/**
 * Streams a response from Gemini based on the conversation history.
 */
export const streamGeminiResponse = async (
  history: Message[],
  onChunk: (text: string) => void,
  onMetadata: (metadata: any) => void,
  modelId: string = DEFAULT_MODEL,
  useSearch: boolean = false,
  userProfile?: UserProfile
): Promise<string> => {
  const ai = getClient();
  const selectedMessages = getSmartContext(history);
  const contents = formatHistory(selectedMessages);
  
  // Safety fallback for empty string modelId
  const validModelId = modelId || DEFAULT_MODEL;

  // Configuration construction
  const tools = useSearch ? [{ googleSearch: {} }] : undefined;
  
  const systemInstruction = buildSystemInstruction(userProfile);

  let attempt = 0;
  const maxRetries = 10; // Increased max retries for reliability
  const baseDelay = 2000; // Increased base delay

  while (true) {
    try {
      const config: any = {
        systemInstruction: systemInstruction,
      };
      
      // Only add tools if defined to prevent "Ambiguous request" or invalid arg errors
      if (tools) {
        config.tools = tools;
      }

      const responseStream = await ai.models.generateContentStream({
        model: validModelId,
        contents: contents,
        config: config
      });

      let fullText = "";

      for await (const chunk of responseStream) {
        const textChunk = chunk.text;
        if (textChunk) {
          fullText += textChunk;
          onChunk(fullText);
        }
        if (chunk.candidates?.[0]?.groundingMetadata) {
          onMetadata(chunk.candidates[0].groundingMetadata);
        }
      }

      return fullText;
    } catch (error: any) {
      const errorMessageRaw = error.message || "";
      const isRateLimit = errorMessageRaw.includes("429") || errorMessageRaw.includes("Quota exceeded") || error.status === 429 || error.status === "RESOURCE_EXHAUSTED";
      const isOverloaded = errorMessageRaw.includes("503") || errorMessageRaw.includes("Overloaded");
      
      // Retry on Rate Limit or Overloaded
      if ((isRateLimit || isOverloaded) && attempt < maxRetries) {
        attempt++;
        // Use 1.5 multiplier for backoff to avoid waiting too long too quickly, but enough to recover
        const waitTime = baseDelay * Math.pow(1.5, attempt - 1) + (Math.random() * 1000); 
        console.warn(`Gemini API Retry (${attempt}/${maxRetries}): ${isRateLimit ? 'Rate Limit' : 'Overloaded'}. Waiting ${Math.round(waitTime)}ms`);
        await delay(waitTime);
        continue;
      }
      
      // Error handling...
      let errorMessage = errorMessageRaw || "Unknown error";
      if (errorMessage.includes("403")) errorMessage = "Access Denied (403). Please check your API Key.";
      if (errorMessage.includes("429")) errorMessage = "Too Many Requests (429). Quota exceeded. Please try again later.";
      if (errorMessage.includes("400") && errorMessage.includes("token")) errorMessage = "Context limit exceeded. Try clearing the conversation.";
      
      throw new Error(errorMessage);
    }
  }
};

/**
 * Generates an image using Gemini image generation model.
 */
export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getClient();

  let aspectRatio = '1:1';
  if (prompt.includes('16:9')) aspectRatio = '16:9';
  else if (prompt.includes('9:16')) aspectRatio = '9:16';
  else if (prompt.includes('4:3')) aspectRatio = '4:3';
  else if (prompt.includes('3:4')) aspectRatio = '3:4';
  
  let attempt = 0;
  const maxRetries = 5;
  const baseDelay = 2000;

  while (true) {
    try {
      const response = await ai.models.generateContent({
        model: IMAGE_GEN_MODEL,
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
          },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const cleanBase64 = part.inlineData.data.replace(/\r?\n|\r/g, '');
            return `![Generated Image](data:${part.inlineData.mimeType};base64,${cleanBase64})`;
          }
        }
      }
      
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
          return response.candidates[0].content.parts[0].text;
      }
      
      throw new Error("No image generated.");

    } catch (error: any) {
      const errorMessageRaw = error.message || "";
      const isRateLimit = errorMessageRaw.includes("429") || errorMessageRaw.includes("Quota exceeded") || error.status === 429;
      
      if (isRateLimit && attempt < maxRetries) {
        attempt++;
        const waitTime = baseDelay * Math.pow(1.5, attempt - 1) + (Math.random() * 1000);
        await delay(waitTime);
        continue;
      }

      throw new Error(`Image generation failed: ${error.message}`);
    }
  }
}

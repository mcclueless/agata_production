import { BaseChatEngine, BaseToolWithCall, LLMAgent } from "llamaindex";
import fs from "node:fs/promises";
import path from "node:path";
import { getDataSource } from "./index";
import { createTools } from "./tools";
import { createQueryEngineTool } from "./tools/query-engine";

/**
 * Creates a chat engine with the specified document IDs and parameters
 * 
 * @param documentIds - Optional array of document IDs to include in the query engine
 * @param params - Optional parameters for the data source
 * @returns A configured chat engine
 */
export async function createChatEngine(documentIds?: string[], params?: any): Promise<BaseChatEngine> {
  const tools: BaseToolWithCall[] = [];

  try {
    // Add a query engine tool if we have a data source
    const index = await getDataSource(params);
    if (index) {
      try {
        // Ensure documentIds is an array
        const validDocIds = Array.isArray(documentIds) ? documentIds : [];
        tools.push(createQueryEngineTool(index, { documentIds: validDocIds }));
      } catch (queryEngineError) {
        console.error('[ChatEngine] Error creating query engine tool:', queryEngineError);
        // Continue without the query engine tool
      }
    }

    // Load additional tools from config file
    const configFile = path.join("config", "tools.json");
    let toolConfig: any;
    
    try {
      // Add tools from config file if it exists
      const configData = await fs.readFile(configFile, "utf8");
      toolConfig = JSON.parse(configData);
      
      if (toolConfig) {
        const configTools = await createTools(toolConfig);
        tools.push(...configTools);
      }
    } catch (error: any) {
      // Non-critical error, just log it
      const errorMessage = error?.message || 'Unknown error';
      console.info(`Could not load tools from ${configFile}: ${errorMessage}`);
    }

    // Create the LLM agent with the tools
    const agent = new LLMAgent({
      tools,
      systemPrompt: process.env.SYSTEM_PROMPT,
    }) as unknown as BaseChatEngine;

    return agent;
  } catch (error) {
    console.error('[ChatEngine] Error creating chat engine:', error);
    
    // Return a minimal agent without tools as fallback
    return new LLMAgent({
      tools: [],
      systemPrompt: process.env.SYSTEM_PROMPT || 
                    "You are a helpful AI assistant. Answer questions to the best of your ability.",
    }) as unknown as BaseChatEngine;
  }
}

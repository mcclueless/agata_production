import { initObservability } from "@/app/observability";
import { trackConversation } from "@/app/observability/conversation-tracking";
import { LlamaIndexAdapter, Message, StreamData } from "ai";
import { ChatMessage, Settings } from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { createChatEngine } from "./engine/chat";
import { initSettings } from "./engine/settings";
import {
  isValidMessages,
  retrieveDocumentIds,
  retrieveMessageContent,
} from "./llamaindex/streaming/annotations";
import { createCallbackManager } from "./llamaindex/streaming/events";
import { generateNextQuestions } from "./llamaindex/streaming/suggestion";
import { clearKeywords } from "./engine/keywordContext";

// Initialize observability and settings
try {
  initObservability();
  initSettings();
} catch (error) {
  console.error("[Initialization] Failed to initialize:", error);
  // Continue execution even if initialization fails
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * API route handler for chat requests
 */
export async function POST(request: NextRequest) {
  // Init Vercel AI StreamData
  const vercelStreamData = new StreamData();
  
  // Track request start time for performance monitoring
  const requestStartTime = Date.now();

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("[API] Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 }
      );
    }
    
    const { messages, data }: { messages: Message[]; data?: any } = body;
    
    // Validate messages
    if (!isValidMessages(messages)) {
      return NextResponse.json(
        {
          error: "Messages are required in the request body and the last message must be from the user",
        },
        { status: 400 },
      );
    }

    // Retrieve document IDs from the annotations of all messages (if any)
    const ids = retrieveDocumentIds(messages);
    
    // Create chat engine with index using the document IDs
    const chatEngine = await createChatEngine(ids, data);

    // Retrieve user message content from Vercel/AI format
    const userMessageContent = retrieveMessageContent(messages);
    const userMessageText = messages[messages.length - 1].content.toString();

    // Setup callbacks
    const callbackManager = createCallbackManager(vercelStreamData);
    const chatHistory: ChatMessage[] = messages.slice(0, -1) as ChatMessage[];

    // Calling LlamaIndex's ChatEngine to get a streamed response
    const response = await Settings.withCallbackManager(callbackManager, () => {
      return chatEngine.chat({
        message: userMessageContent,
        chatHistory,
        stream: true,
      });
    });

    // Handle completion of the response
    const onCompletion = (content: string) => {
      try {
        // Add the assistant's response to chat history
        chatHistory.push({ role: "assistant", content: content });
        
        // Track the conversation
        trackConversation(
          data?.userId || 'anonymous-local',
          userMessageText,
          content,
          Array.isArray(ids) && ids.length > 0 // Check if index was used
        );
        
        // Generate suggested follow-up questions
        generateNextQuestions(chatHistory)
          .then((questions: string[]) => {
            if (questions.length > 0) {
              vercelStreamData.appendMessageAnnotation({
                type: "suggested_questions",
                data: questions,
              });
            }
          })
          .catch((error) => {
            console.error("[API] Error generating next questions:", error);
          })
          .finally(() => {
            // Always close the stream when done
            vercelStreamData.close();
            
            // Log request completion time
            const requestDuration = Date.now() - requestStartTime;
            console.info(`[API] Request completed in ${requestDuration}ms`);
          });
      } catch (completionError) {
        console.error("[API] Error in completion handler:", completionError);
        vercelStreamData.close();
      }
    };

    // Return the streamed response
    return LlamaIndexAdapter.toDataStreamResponse(response, {
      data: vercelStreamData,
      callbacks: { onCompletion },
    });
  } catch (error) {
    // Log the error
    console.error("[API] Error processing request:", error);
    
    // Clear keywords context on error to prevent stale data
    try {
      clearKeywords();
    } catch (clearError) {
      console.error("[API] Error clearing keywords:", clearError);
    }
    
    // Return an appropriate error response
    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}

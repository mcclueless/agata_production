import { trace, SpanStatusCode, SpanKind } from '@opentelemetry/api';

// Check if content tracking is enabled (default to true)
const TRACK_CONTENT = process.env.TRACK_MESSAGE_CONTENT !== 'false';

/**
 * Tracks a conversation between user and chatbot
 */
export function trackConversation(
  userId: string,
  userMessage: string,
  botResponse: string,
  usedIndex: boolean
) {
  try {
    // Use the same tracer name that Traceloop would recognize
    const tracer = trace.getTracer('llama-app-production');
    
    // Create a span with a name that follows Traceloop's conventions
    const span = tracer.startSpan('llm.chat', {
      kind: SpanKind.INTERNAL,
    });
    
    try {
      // Add basic attributes
      span.setAttribute('user.id', userId || 'anonymous');
      span.setAttribute('conversation.used_index', usedIndex.toString());
      
      // Add message length metrics
      span.setAttribute('user_message.length', userMessage.length.toString());
      span.setAttribute('bot_response.length', botResponse.length.toString());
      
      // Add timestamp
      span.setAttribute('conversation.timestamp', new Date().toISOString());
      
      // Add full message content if enabled
      if (TRACK_CONTENT) {
        // Try different attribute names that Traceloop might recognize
        // span.setAttribute('input', userMessage);
        // span.setAttribute('output', botResponse);
        // span.setAttribute('prompt', userMessage);
        // span.setAttribute('completion', botResponse);
        span.setAttribute('llm.input', userMessage);
        span.setAttribute('llm.output', botResponse);
        // span.setAttribute('llm.prompt', userMessage);
        // span.setAttribute('llm.completion', botResponse);
        
        // Add message content as events
        span.addEvent('user_message', {
          'message.content': userMessage,
          'message.role': 'user',
        });
        
        span.addEvent('bot_response', {
          'message.content': botResponse,
          'message.role': 'assistant',
        });
      }
      
      // Add AI-specific attributes that Traceloop might recognize
      span.setAttribute('traceloop.span.kind', 'llm.chat');
      span.setAttribute('traceloop.entity.name', 'chat');
      span.setAttribute('traceloop.entity.type', 'llm');
      
      // Set status to success
      span.setStatus({ code: SpanStatusCode.OK });
      
      // Log for debugging
      console.info(
        `[Observability] Tracked conversation for user ${userId}, index used: ${usedIndex}, content tracking: ${TRACK_CONTENT ? 'enabled' : 'disabled'}`
      );
    } finally {
      // Always end the span
      span.end();
    }
  } catch (error) {
    // Just log the error and continue - don't let tracking disrupt the app
    console.error('Error tracking conversation:', error);
  }
}

"use client";

import { ChatMessage, ChatMessages, useChatUI } from "@llamaindex/chat-ui";
import { ChatMessageAvatar } from "./chat-avatar";
import { ChatMessageContent } from "./chat-message-content";
import { ChatStarter } from "./chat-starter";

export default function CustomChatMessages() {
  const { messages } = useChatUI();
  return (
    <ChatMessages className="shadow-xl rounded-xl">
      <ChatMessages.List>
        <ChatMessage message={{ role: "assistant", content: "I am an experimental chatbot which tries to answer your questions about a limited set of Bachelor Programmes. Although care has been taken to ensure the accuracy of my responses I can make mistakes. Please read the [Disclaimer](https://www.maastrichtuniversity.nl/disclaimer). How can I help you?" }} isLast={messages.length === 0}>
          <ChatMessageAvatar />
          <ChatMessageContent />
        </ChatMessage>
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isLast={index === messages.length - 1}
          >
            <ChatMessageAvatar />
            <ChatMessageContent />
            <ChatMessage.Actions />
          </ChatMessage>
        ))}
        <ChatMessages.Loading />
      </ChatMessages.List>
      <ChatMessages.Actions />
      <ChatStarter />
    </ChatMessages>
  );
}

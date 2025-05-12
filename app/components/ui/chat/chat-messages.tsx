"use client";

import { ChatMessage, ChatMessages, useChatUI } from "@llamaindex/chat-ui";
import { ChatMessageAvatar } from "./chat-avatar";
import { ChatMessageContent } from "./chat-message-content";
import { ChatStarter } from "./chat-starter";

export default function CustomChatMessages() {
  const { messages, append } = useChatUI();
  
  // Function to handle question clicks
  const handleQuestionClick = (question: string) => {
    append({ role: "user", content: question });
  };
  return (
    <ChatMessages className="shadow-xl rounded-xl">
      <ChatMessages.List>
        <ChatMessage message={{ role: "assistant", content: "I am an experimental chatbot which tries to answer your questions about a limited set of Bachelor Programmes. Although care has been taken to ensure the accuracy of my responses I can make mistakes. Please read the [Disclaimer](https://www.maastrichtuniversity.nl/disclaimer). How can I help you?" }} isLast={messages.length === 0}>
          <ChatMessageAvatar />
          <ChatMessageContent />
        </ChatMessage>
        
        {/* Add questions as a separate element underneath the welcome message */}
        {messages.length === 0 && (
          <div className="flex flex-col space-y-2 ml-16 mt-2">
            <div 
              className="cursor-pointer italic cursor-pointer text-sm italic hover:underline" 
              onClick={() => handleQuestionClick("Who are you, and which programmes can I inquire about during the pilot phase?")}
            >
              <span className="italic">{"-> Who are you, and which programmes can I inquire about during the pilot phase?"}</span>
            </div>
            <div 
              className="cursor-pointer text-sm italic hover:underline" 
              onClick={() => handleQuestionClick("Will you respond in the language in which my question is asked?")}
            >
              <span className="italic">{"-> Will you respond in the language in which my question is asked?"}</span>
            </div>
            <div 
              className="cursor-pointer text-sm italic hover:underline" 
              onClick={() => handleQuestionClick("Why is Maastricht University the best choice for starting my studies?")}
            >
              <span className="italic">{"-> Why is Maastricht University the best choice for starting my studies?"}</span>
            </div>
            {/* <div 
              className="cursor-pointer text-sm italic hover:underline" 
              onClick={() => handleQuestionClick("Can you help me find the right study programme?")}
            >
              <span className="italic">{"-> Can you help me find the right study programme?"}</span>
            </div>
            <div 
              className="cursor-pointer text-sm italic hover:underline" 
              onClick={() => handleQuestionClick("I'm deciding between two bachelor programmes; can you assist me?")}
            >
              <span className="italic">{"-> I'm deciding between two bachelor programmes; can you assist me?"}</span>
            </div> */}
          </div>
        )}
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

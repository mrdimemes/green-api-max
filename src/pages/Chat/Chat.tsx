import { useState } from "react";
import Message from "@/components/Message";
import MessageInput from "@/components/MessageInput";

type Message = {
  text: string;
  senderId: number;
  timestamp: number;
};

const temp: Message[] = [  // placeholder
  {
    text: "Привет!",
    senderId: 2,
    timestamp: 1791385776042,
  },
  {
    text: "Как дела?",
    senderId: 2,
    timestamp: 1791385777000,
  },
  {
    text: "Привет, нормально",
    senderId: 1,
    timestamp: 1791385796045,
  },
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(temp);
  const userId = 1;  // placeholder

  return (
    <div>
      <div>
        {messages.map((message) => (
          <Message
            text={message.text}
            sendedByUser={message.senderId === userId}
          />
        ))}
      </div>
      <MessageInput send={(message: string) => {
        setMessages((previous) => [
          ...previous,
          {
            text: message,
            senderId: userId,
            timestamp: Date.now(),
          },
        ])
      }} />
    </div>
  );
};

export default Chat;

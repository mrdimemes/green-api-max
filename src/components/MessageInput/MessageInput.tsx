import { useState } from "react";

type Props = {
  send: (message: string) => void;
};

const MessageInput = ({ send }: Props) => {
  const [message, setMessage] = useState("");

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Введите сообщение..."
      />
      <button
        onClick={() => send(message)}
        disabled={message === ""}
      >
        Отправить
      </button>
    </div>
  );
};

export default MessageInput;

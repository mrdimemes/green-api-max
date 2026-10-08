import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import api from "./api";
import Message from "./components/Message";
import MessageInput from "./components/MessageInput";

type IncomingTextMessageBody = {
  typeWebhook: "incomingMessageReceived";
  instanceData: {
    idInstance: number;
    wid: string;
    typeInstance: "v3";
  };
  timestamp: number;
  idMessage: string;
  senderData: {
    chatId: string;
    chatName: string;
    chatType: "user" | "group";
    sender: string;
    senderName: string;
    senderType: "user" | string;
    senderContactName: "" | string;
    senderPhoneNumber: 0 | number;
  };
  messageData: {
    typeMessage: "textMessage";  // Тип полученного сообщения. Для сообщений данного типа поле принимает значение textMessage
    textMessageData: {           // Объект данных о текстовом сообщении
      textMessage: string;          // Текстовое сообщение
      isForwarded: boolean;         // Является ли сообщение пересланным, принимает значения true/false
      forwardingScore: number;      // Количество пересылок сообщения
    };
    quotedMessage?: {            // Объект данных о цитируемом сообщении. Присутствует, только если само сообщение является цитатой
      stanzaId: string;             // id цитируемого сообщения
      participant: string;          // id отправителя цитируемого сообщения
    };
  };
};
type FetchMessagesResponse = {
  receiptId: number;
  body: IncomingTextMessageBody;
};
type DeleteNotificationResponse = {
  result: boolean;
  reason: string;
};
type PostMessageResponse = {
  idMessage: string;
};
type GetChatResponse = {
  exist: boolean;
  chatId: string;
  fromCache: boolean;
};
type Chat = {
  chatId: string;
  chatName: string;
};
type MessageType = {
  id: string;
  chatId: string;
  sender: string;
  text: string;
};

const App = () => {
  const [authed, setAuthed] = useState(false);
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const fetchMessage = async () => {
    try {
      const response = await api.get<FetchMessagesResponse>(
        `waInstance${idInstance}/receiveNotification/${apiTokenInstance}`);
      const { receiptId, body } = response.data;
      const deleteResponse = await api.delete<DeleteNotificationResponse>(
        `waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`);
      if (!deleteResponse.data.result) {
        console.warn("Сообщение не было удалено из очереди: " + deleteResponse.data.reason);
      };
      return {
        id: body.idMessage,
        chatId: body.senderData.chatId,
        sender: body.senderData.sender,
        text: body.messageData.textMessageData.textMessage,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(error.response?.data ?? "Ошибка запроса.");
      }
      throw error;
    };
  };

  const postMessage = async (chatId: string, message: string) => {
    const response = await api.post<PostMessageResponse>(
      `waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
      {
        chatId,
        message,
      },
    );
    return {
      id: response.data.idMessage,
      chatId,
      sender: "-1",
      text: message,
    };
  };

  const getChat = async (phoneNumber: number) => {
    const response = await api.post<GetChatResponse>(
      `waInstance${idInstance}/checkAccount/${apiTokenInstance}`,
      {
        phoneNumber,
      }
    );
    const { exist, chatId } = response.data;
    if (exist) {
      setChats((previous) => [{ chatId, chatName: String(phoneNumber) }, ...previous]);
    } else {
      alert("Пользователь не зарегистрирован в Макс.");
    };
  };

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedChatId],
    queryFn: async () => {
      const message = await fetchMessage();
      const messages = queryClient.getQueryData<MessageType[]>(["messages", selectedChatId]) ?? [];
      if (message === undefined) {
        return messages;
      };
      if (message.chatId !== selectedChatId) {
        queryClient.setQueryData<MessageType[]>(
          ["messages", message.chatId],
          (old) => [...(old ?? []), message],
        );
        return messages;
      }
      return [...messages, message];
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    enabled: selectedChatId !== null,
    refetchInterval: 10000,
  });

  const mutation = useMutation({
    mutationFn: ({ chatId, text }: { chatId: string; text: string }) => postMessage(chatId, text),
    onSuccess: (message: MessageType, variables) => {
      queryClient.setQueryData<MessageType[]>(
        ["messages", variables.chatId],
        (old) => [...(old ?? []), message],
      );
    },
  });

  if (!authed) {
    return (
      <div>
        <label htmlFor="idInstanceInput">idInstance</label>
        <input
          id="idInstanceInput"
          type="text"
          value={idInstance}
          onChange={(event) => setIdInstance(event.target.value)}
        />
        <label htmlFor="apiTokenInstanceInput">apiTokenInstance</label>
        <input
          id="apiTokenInstanceInput"
          type="text"
          value={apiTokenInstance}
          onChange={(event) => setApiTokenInstance(event.target.value)}
        />
        <button onClick={() => setAuthed(true)}>Войти</button>
      </div>
    );
  };

  return (
    <div>
      <aside>
        <h1>Чаты
          <button onClick={() => {
            const input = prompt("Введите номер телефона: ");
            if (input === null) return;
            if (
              input.trim() !== "" &&
              input.length < 13 &&
              Number.isFinite(Number(input))
            ) {
              const phoneNumber = Number(input);
              getChat(phoneNumber);
            } else {
              alert("Некорректный ввод.");
            };
          }}>Добавить</button>
        </h1>
        <div>
          {
            chats.map((chat) => (
              <div
                key={chat.chatId}
                onClick={() => setSelectedChatId(chat.chatId)}
              >
                {chat.chatName}
              </div>
            ))
          }
        </div>
      </aside>
      <header>
        Чат <b>{selectedChatId ?? "не выбран"}</b>; idInstance = {idInstance}; apiTokenInstance = {apiTokenInstance}.
        <button onClick={() => setAuthed(false)}>Изменить</button>
      </header>
      <div>
        <div>
          {messages.map((message) => (
            <Message
              key={message.id}
              text={message.text}
              sendedByUser={message.sender === "-1"}
            />
          ))}
        </div>
        <MessageInput
          send={(message: string) => {
            if (message.trim() === "" || selectedChatId === null) return;
            mutation.mutate({ chatId: selectedChatId, text: message });
          }}
          disabled={mutation.isPending}
        />
      </div>
    </div>
  );
};

export default App;

type Props = {
  text: string;
  sendedByUser?: boolean;
};

const Message = ({ text, sendedByUser = false }: Props) => {
  return (
    <div>
      { text }
    </div>
  );
};

export default Message;

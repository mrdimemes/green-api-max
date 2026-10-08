import clsx from "clsx";
import styles from "./Message.module.sass";

type Props = {
  text: string;
  sendedByUser?: boolean;
};

const Message = ({ text, sendedByUser = false }: Props) => {
  return (
    <div className={clsx(styles.Message, sendedByUser && styles.sended)}>
      <div>{ text }</div>
    </div>
  );
};

export default Message;

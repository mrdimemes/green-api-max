import { useState } from "react";

const Auth = () => {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");

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
    <button>Войти</button>
  </div>
};

export default Auth;

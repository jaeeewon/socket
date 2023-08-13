import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io.connect("http://proxy.pleizz.com:3030");

const list = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "~",
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "_",
  "+",
  "-",
  "=",
  "[",
  "]",
  "{",
  "}",
  "|",
  ";",
  "'",
  ",",
  ".",
  "/",
  "<",
  ">",
  "?",
];

function App() {
  const [room, setRoom] = useState("biology");

  // Messages States
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState([]);
  const [admin, setAdmin] = useState(
    window.location.pathname.split("/")[1] === "admin"
  );
  const [keyVisible, setKeyVisible] = useState(false);
  const [selected, setSelected] = useState(0);
  const [txts, setTxts] = useState(["loading"]);

  const sendMessage = () => {
    if (!message) {
      return alert("empty message!");
    }
    socket.emit("send_message", { message, room });
    setMessageReceived((prev) => [
      ...prev,
      { message, user: 0, time: Date.now() },
    ]);
    setKeyVisible(false);
  };

  useEffect(() => {
    socket.emit("join_room", room);
    socket.on("receive_message", (data) => {
      const m = data.message;
      setMessageReceived((prev) => [
        ...prev,
        { message: m, user: 1, time: Date.now() },
      ]);
    });
  }, [socket]);

  useEffect(() => {
    setTxts(list.sort(() => Math.random() - 0.5));
  }, [message]);
  return (
    <div className="App">
      <div>
        <input
          placeholder="message"
          id="text_input"
          value={message}
          onClick={() => {
            if (admin) {
              return;
            }
            setKeyVisible((prev) => {
              prev && alert("키보드로 입력하세요.");
              return true;
            });
          }}
          onChange={(event) => {
            // const elem = document.getElementById("text_input");
            if (!admin) {
              // elem.value = "";
              return alert("키보드로 수정할 수 없습니다.");
            }
            setMessage(event.target.value);
          }}
        />
        <button onClick={sendMessage}> Send Message</button>
      </div>
      {messageReceived.length ? (
        <button onClick={() => setMessageReceived([])}>clear messages</button>
      ) : null}
      {keyVisible && (
        <div>
          <div
            style={{
              width: "70vw",
              backgroundColor: "yellow",
              position: "relative",
            }}
          >
            <button
              style={{ position: "absolute", right: 10, top: 10 }}
              onClick={() => setKeyVisible(false)}
            >
              x
            </button>
            <h4>
              selected text: "{txts[selected]}" ({selected})
            </h4>

            <div>
              <input
                max={txts.length - 1}
                type="range"
                id="eng_input_range"
                style={{ width: "10vw" }}
                value={selected}
                onChange={(v) => setSelected(+v.target.value)}
              />
              <button
                onClick={() => {
                  // const elem = document.getElementById("eng_input_range");
                  // return alert(`${elem.value} => ${txts[+elem.value]}`);
                  setMessage((prev) => prev + txts[selected]);
                }}
              >
                add
              </button>
              <button onClick={() => setMessage((prev) => prev.slice(0, -1))}>
                remove latest
              </button>
            </div>
            <div>
              <input maxLength={1} id="search_input" placeholder="검색" />
              <button
                onClick={() => {
                  const elem = document.getElementById("search_input");
                  const v = elem.value;
                  if (!list.includes(v)) {
                    return alert("해당 문자는 존재하지 않습니다 ㅠㅅㅠ");
                  }
                  const fnd = list.findIndex((e) => e === v);
                  if (!fnd) {
                    return alert("목록에 있으나 찾는 데 실패함");
                  }
                  alert(`해당 인덱스는 ${fnd}임`);
                }}
              >
                검색할 문자열을 입력
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {txts.map((v, i) => (
                <div
                  style={{
                    backgroundColor: `#${Math.round(
                      Math.random() * 0xffffff
                    ).toString(16)}`,
                    margin: 2,
                    paddingLeft: 15,
                    paddingRight: 15,
                  }}
                >
                  <h4>{v}</h4>
                  <p style={{ fontSize: 3 }}>({i})</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <h4>[received messages]</h4>
      {messageReceived.map((v, i, c) => (
        <div
          key={genStr()}
          style={{
            textAlign: v.user ? "left" : "right",
          }}
        >
          {c[i - 1]?.user !== v.user && <p>{v.user ? "받음" : "보냄"}</p>}
          <span>
            {v.message} | {new Date(v.time).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default App;

function genStr() {
  return Math.random().toString(36).substr(2, 11);
}

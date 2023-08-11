import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io.connect("http://proxy.pleizz.com:3030");

function App() {
  //Room State
  const [room, setRoom] = useState("tls_test");

  // Messages States
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState([]);
  const [client, setClient] = useState(
    window.location.pathname.split("/")[1] === "client"
  );

  const [delay, setDelay] = useState(500);

  const sendMessage = () => {
    socket.emit("send_message", { message, room });
  };

  function sendMsg(message) {
    socket.emit("send_message", { message, room, client });
  }

  const fail_retry = false;

  const messages = {
    start: "start",
    incorrect: "incorrect..",
    client_tcp_handshake_1: "client_tcp_handshake_1",
    server_tcp_handshake_2: "server_tcp_handshake_2",
    client_tcp_handshake_3: "client_tcp_handshake_3",
    connection_established: "connection_established",
    req_available_methods: "req_available_methods",
    res_available_methods: "method_rsa",
    select_method: "select_method_rsa",
    res_server_cert: "server's cert..",
    req_cert: "req_cert",
    cancel: "canceled..",
    client_hello: 'client_hello_with_available_methods',
    server_hello: 'server_hello_with_methods_and_certs',
    rsa_encrypted_key: 'rsa_encrypted_key: 문자열',
    encrypted_response: 'encrypted_response: a;dslfkjal;dsfjl;adskfjl;akdsjflaskdjlfkjasdl',
    process_done: 'process_done: 커넥션 해제 및 종료'
  };

  async function handleMessage(m) {
    if (client) {
      console.log(`client received: ${m}`);

      switch (m) {
        case messages.start: {
          sendMsg(messages.client_tcp_handshake_1);
          break;
        }
        case messages.server_tcp_handshake_2: {
          sendMsg(messages.client_tcp_handshake_3);
          break;
        }
        case messages.connection_established: {
          alert("connected!");
          sendMsg(messages.client_hello)
          // sendMsg(messages.req_available_methods);
          break;
        }
        case messages.server_hello: {
          alert('client, server hello done')
          const allow = window.confirm("[인증서 검사 단계]: 허용할까요?");
          console.log('CA 에서 발급한 건지, self-signed cert인지 확인 및 pre master secret key 생성 및 암호화해 전달')
          if (allow) {
            sendMsg(messages.rsa_encrypted_key);
          } else {
            sendMsg(messages.cancel);
          }
          break
        }
        case messages.incorrect: {
          console.log("try again after 3s");
          setTimeout(() => sendMsg(messages.start), 3000);
          break;
        }
        // case messages.res_server_cert: {
        //   sendMsg()
        //   break
        // }
        case messages.res_available_methods: {
          // sendMsg(messages.)
          const allow = window.confirm("[인증서 검사 단계]: 허용할까요?");
          if (allow) {
            sendMsg(messages.select_method);
          } else {
            sendMsg(messages.cancel);
          }
          break;
        }
        case messages.encrypted_response: {
          alert('응답을 받았습니다.')
          alert(`응답을 복호화했습니다: hello_tls_from_server`)
          sendMsg(messages.process_done)
          break
        }
        default: {
          fail_retry
            ? sendMsg(messages.incorrect)
            : alert(`invalid resp: ${m}`);
        }
      }
    } else {
      console.log(`server received: ${m}`);

      switch (m) {
        case messages.start: {
          sendMsg(messages.start); // client에서 start를 받아야만 시작
          break;
        }
        case messages.rsa_encrypted_key: {
          console.log('서버의 개인키로 요청을 복호화해 pre master secret key 획득 및 조합해 마스터 키 생성')
          sendMsg(messages.encrypted_response)
          break
        }
        case messages.client_tcp_handshake_1: {
          sendMsg(messages.server_tcp_handshake_2);
          break;
        }
        case messages.client_tcp_handshake_3: {
          sendMsg(messages.connection_established);
          break;
        }
        case messages.process_done: {
          alert('요청 처리가 완료됐습니다.')
          break
        }
        case messages.req_available_methods: {
          sendMsg(messages.res_available_methods);
          break;
        }
        case messages.select_method: {
          sendMsg(messages.res_server_cert)
          break
        }
        case messages.incorrect: {
          console.log("try again after 3s");
          setTimeout(() => sendMsg(messages.start), 3000);
          break;
        }
        case messages.cancel: {
          alert("클라이언트에서 인증서가 올바르지 않다고 거절함");
          break;
        }
        case messages.client_hello: {
          sendMsg(messages.server_hello)
          break
        }
        default: {
          fail_retry
            ? sendMsg(messages.incorrect)
            : alert(`invalid resp: ${m}`);
        }
      }
    }
  }

  function get_delay() {
    const d = +(document.getElementById('delay').textContent || '0')
    // console.log('returned delay', d)
    return d
  }

  useEffect(() => {
    socket.emit("join_room", room);
    socket.on("receive_message", (data) => {
      const m = data.message;

      setTimeout(() => {
        setMessageReceived((v) => [...v, m]);
        handleMessage(m)
      }, get_delay());
    });
  }, [socket]);
  return (
    <div className="App">
      <button onClick={() => setMessageReceived([])}>clear</button>
      <button onClick={() => setClient((s) => !s)}>
        {client ? "클라이언트" : "서버"} mode
      </button>
      <button onClick={() => sendMsg(messages.start)}>start</button>
      <p>delay: </p> <h1 id='delay'>{delay}</h1><p>ms</p>
      <input
        type="number"
        placeholder="delay"
        onChange={(event) => {
          setDelay(+event.target.value);
        }}
      />
      <input
        placeholder="Message..."
        onChange={(event) => {
          setMessage(event.target.value);
        }}
      />
      <button onClick={sendMessage}> Send Message</button>
      <h1> Message:</h1>
      {messageReceived.map((v) => (
        <p key={genStr()}>{v}</p>
      ))}
    </div>
  );
}

export default App;

function genStr() {
  return Math.random().toString(36).substr(2, 11);
}

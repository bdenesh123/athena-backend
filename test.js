import fetch from "node-fetch";

const testChat = async () => {
  const res = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Hello AI" }),
  });

  const data = await res.json();
  console.log(data);
};

testChat();

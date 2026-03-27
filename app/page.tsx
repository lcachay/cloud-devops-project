"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/message")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <main>
      <h1>Next.js Fullstack App</h1>
      <p>{message}</p>
    </main>
  );
}

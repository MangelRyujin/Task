"use client";

import { Alert, Button, Input } from "@heroui/react";
import { useState, useRef } from "react";
import { BsFillSendFill } from "react-icons/bs";
import { FaComments, FaTimes, FaMicrophone } from "react-icons/fa";

interface ChatbotDemoProps {
  createTaskFromBot: (title: string) => Promise<void>;
}

export default function ChatbotDemo({ createTaskFromBot }: ChatbotDemoProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "bot" | "user"; text: string }[]>([
    { from: "bot", text: "Hi! 🎤 You can type or speak to create a task." },
  ]);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- send message as task ---
  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text }]);
    try {
      await createTaskFromBot(text.trim());
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: `✅ Task created: "${text}"` },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "❌ Error creating task." },
      ]);
    }
    setMessage("");
  };

  // --- start recording ---
  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.continuous = true; // keeps listening even if there are pauses
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      handleSend(transcript);
    };

    recognitionRef.current.onend = () => {
      if (recording) {
        recognitionRef.current.start(); // auto-restart if still recording
      }
    };

    recognitionRef.current.start();
    setRecording(true);

    // timeout: stop after 10 seconds
    timeoutRef.current = setTimeout(() => stopRecording(), 10000);
  };

  // --- stop recording ---
  const stopRecording = () => {
    setRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <div>
      {/* Floating button */}
      <Button
        variant="shadow"
        color="primary"
        onClick={() => setOpen(!open)}
        isIconOnly
        size="lg"
        className={`fixed bottom-5 right-5 rounded-full shadow-lg transition-all ${
          open ? "" : "animate-bounce"
        }`}
      >
        {open ? <FaTimes size={25} /> : <FaComments size={25} />}
      </Button>

      {/* Chat window */}
      {open && (
        <div className="fixed z-50 bottom-20 right-5 w-80 h-96 bg-slate-950/80 backdrop-blur-sm shadow-xl rounded-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950 text-primary p-3 font-semibold">Chatbot</div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto text-sm space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <Alert
                  color={msg.from === "bot" ? "success" : "primary"}
                  hideIcon
                  title={msg.from === "bot" ? "🤖" : "🧑"}
                  description={msg.text}
                  className={`p-2 rounded-lg max-w-[70%] `}
                />
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 bg-slate-950">
            <Input
              type="text"
              color="primary"
              placeholder="Type a task..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(message)}
            />
            <Button variant="flat" isIconOnly color="primary" onClick={() => handleSend(message)}>
              <BsFillSendFill size={20}/>
            </Button>
            <Button
              variant={recording ? "shadow" : "flat"}
              color={recording ? "danger" : "primary"}
              isIconOnly
              onClick={recording ? stopRecording : startRecording}
            >
              <FaMicrophone size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

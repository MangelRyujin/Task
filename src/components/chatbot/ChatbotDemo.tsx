"use client";

import { Alert, Button, Input, ScrollShadow, Spinner } from "@heroui/react";
import { useState, useRef, useEffect } from "react";
import { BsFillSendFill } from "react-icons/bs";
import { FaComments, FaTimes, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

interface ChatbotDemoProps {
  createTaskFromBot: (title: string) => Promise<void>;
}

export default function ChatbotDemo({ createTaskFromBot }: ChatbotDemoProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "bot" | "user"; text: string }[]>([
    { from: "bot", text: "Hi! 🎤 Choose your language:" },
  ]);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"en-US" | "es-PE">("en-US");
  const [languageChosen, setLanguageChosen] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // --- scroll automático cada vez que cambian los mensajes ---
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // --- send message as task ---
  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    if (!languageChosen) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    try {
      await createTaskFromBot(text.trim());
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: `✅ Task created from: "${text}"` },
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
    recognitionRef.current.lang = selectedLang;
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      handleSend(transcript);
    };

    recognitionRef.current.onend = () => {
      if (recording) recognitionRef.current.start();
    };

    recognitionRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
  };

  // --- choose language ---
  const chooseLanguage = (lang: "en-US" | "es-PE") => {
    setSelectedLang(lang);
    setLanguageChosen(true);
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text:
          lang === "en-US"
            ? "✅ Language set to English. You can now type or speak to create a task."
            : "✅ Idioma cambiado a Español. Ahora puedes escribir o hablar para crear una tarea.",
      },
    ]);
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
        className={`fixed bottom-5 right-5 z-50 rounded-full shadow-lg transition-all ${
          open ? "" : "animate-bounce"
        }`}
      >
        {open ? <FaTimes size={25} /> : <FaComments size={25} />}
      </Button>

      {/* Chat window */}
      {open && (
        <div className="fixed z-50 bottom-20 right-5 w-80 h-96 bg-background backdrop-blur-sm shadow-xl rounded-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950 text-primary p-3 font-semibold">Chatbot</div>

          {/* Messages */}
          <ScrollShadow hideScrollBar className="flex-1 p-3 overflow-y-auto text-sm space-y-2">
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
            {/* 👇 Este div invisible hace el scroll automático */}
            <div ref={messagesEndRef} />
            {!languageChosen && (
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  color="primary"
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onClick={() => chooseLanguage("en-US")}
                >
                  EN
                </Button>
                <Button
                  color="primary"
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onClick={() => chooseLanguage("es-PE")}
                >
                  ES
                </Button>
              </div>
            )}
          </ScrollShadow >

          {/* Input */}
          {languageChosen && (
            <div className="flex gap-2 p-3 bg-slate-950">
              <Input
                type="text"
                color="primary"
                placeholder="Message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(message)}
              />
              <Button
                variant="flat"
                isIconOnly
                color="primary"
                onClick={() => handleSend(message)}
              >
                <BsFillSendFill size={20} />
              </Button>
              <Button
                variant={recording ? "shadow" : "flat"}
                color={recording ? "danger" : "primary"}
                onClick={recording ? stopRecording : startRecording}
                isIconOnly={!recording}
                radius="full"
              >
                {recording ? (
                  <>
                    <Spinner color="white" size="sm" variant="wave" />{" "}
                    <FaMicrophoneSlash size={20} />
                  </>
                ) : (
                  <FaMicrophone size={20} />
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

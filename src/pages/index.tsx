"use client";

import { useEffect, useState, useRef } from "react";
import { Button, Input, Chip, Spinner, Alert } from "@heroui/react";
import ProfileCard from "@/components/profile/card";
import DeleteTaskModal from "@/components/task/actions/delete/deleteTaskModal";
import ConfirmCompleteModal from "@/components/task/actions/confirm/confirmCompleteModal";
import { MdAddTask, MdDeleteForever } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import { GrCompliance } from "react-icons/gr";
import ChatbotDemo from "@/components/chatbot/ChatbotDemo";
import {
  DISCOVERY_DOC,
  SCOPES,
  fetchUserInfo,
  fetchTaskLists,
  fetchTasks,
  createTask,
  deleteTask,
  toggleTaskComplete,
} from "@/services/googleTasks";

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export default function App() {
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const tokenClientRef = useRef<any>(null);

  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [user, setUser] = useState<{ name: string; email: string; picture: string } | null>(null);

  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const [taskToComplete, setTaskToComplete] = useState<any | null>(null);

  // Load Google API and Identity Services scripts
  useEffect(() => {
    if (!CLIENT_ID || !API_KEY) {
      console.warn("Set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY in your .env file");
      return;
    }

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load " + src));
        document.head.appendChild(script);
      });

    (async () => {
      try {
        await loadScript("https://apis.google.com/js/api.js");
        window.gapi.load("client", async () => {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          });
          setGapiReady(true);
        });

        await loadScript("https://accounts.google.com/gsi/client");

        tokenClientRef.current =
          window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: async (tokenResponse: any) => {
              if (tokenResponse.error) return;
              window.gapi.client.setToken({ access_token: tokenResponse.access_token });
              setSignedIn(true);
              await loadUserAndTasks();
            },
          });

        setGisReady(true);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const loadUserAndTasks = async () => {
    try {
      const u = await fetchUserInfo();
      setUser(u);
      const lists = await fetchTaskLists();
      if (lists.length) {
        setSelectedList(lists[0].id);
        const t = await fetchTasks(lists[0].id);
        setTasks(t);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = () => {
    if (!tokenClientRef.current) return;
    setLoading(true);

    const currentToken = window.gapi.client.getToken();
    tokenClientRef.current.callback = async (resp: any) => {
      if (resp.error) {
        setLoading(false);
        return;
      }
      window.gapi.client.setToken({ access_token: resp.access_token });
      setSignedIn(true);
      await loadUserAndTasks();
      setLoading(false);
    };

    if (!currentToken) {
      tokenClientRef.current.requestAccessToken({ prompt: "consent" });
    } else {
      tokenClientRef.current.requestAccessToken({ prompt: "" });
    }
  };

  const handleSignout = () => {
    const token = window.gapi.client.getToken();
    if (token && token.access_token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken("");
      setSignedIn(false);
      setTasks([]);
      setSelectedList(null);
      setUser(null);
    }
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim() || !selectedList) return;
    setLoading(true);
    try {
      await createTask(selectedList, newTitle.trim());
      setNewTitle("");
      const t = await fetchTasks(selectedList);
      setTasks(t);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, status: string) => {
    if (!selectedList) return;
    await toggleTaskComplete(selectedList, taskId, status);
    const t = await fetchTasks(selectedList);
    setTasks(t);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedList) return;
    await deleteTask(selectedList, taskId);
    const t = await fetchTasks(selectedList);
    setTasks(t);
  };

  const createTaskFromBot = async (text: string, lang: string = "es-PE") => {
  if (!selectedList) return "";

  try {
    const res = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang }),
    });

    const data = await res.json();

    if (!res.ok || !data.task) {
      throw new Error(data.error || "Error creando tarea");
    }

    await createTask(selectedList, data.task);
    const t = await fetchTasks(selectedList);
    setTasks(t);

    return data.task;
  } catch (err) {
    console.error("Error en createTaskFromBot:", err);
    return "";
  }
};

  return (
    <>
      {user && <ChatbotDemo createTaskFromBot={createTaskFromBot} />}

      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">📝 Task Manager</h1>
          <p>Manage your tasks with Google Tasks, React, and HeroUI</p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auth / Profile Card */}
          {!signedIn || !user ? (
            <div className="flex flex-col gap-4 items-center p-4">
              <Chip size="lg" variant="flat" color={signedIn ? "success" : "danger"}>
                {signedIn ? "Connected" : "Not connected"}
              </Chip>
              Sign in with
              <Button
                color="primary"
                variant="flat"
                size="lg"
                onPress={handleAuth}
                isDisabled={!(gapiReady && gisReady)}
                isLoading={loading}
              >
                <span className="flex gap-2 items-center"><FaGoogle size={20} /> Google</span>
              </Button>
            </div>
          ) : (
            <ProfileCard user={user} onSignout={handleSignout} />
          )}

          {/* Tasks */}
          {signedIn && (
            <div className="flex flex-col gap-4">
              {selectedList ? (
                <Chip variant="flat" color="primary">Your Task List</Chip>
              ) : (
                <Chip variant="flat" color="danger" endContent={<Spinner size="sm" color="danger" />}>
                  Creating or loading list
                </Chip>
              )}

              <div className="flex gap-2 items-center">
                <Input
                  variant="underlined"
                  color="primary"
                  label="Task name"
                  placeholder="New task"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateTask();
                  }}
                />
                <Button
                  color="success"
                  variant="shadow"
                  className="text-white"
                  size="lg"
                  onPress={handleCreateTask}
                  isDisabled={!newTitle.trim()}
                  isLoading={loading}
                  isIconOnly
                >
                  <MdAddTask size={20} />
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center"><Spinner /></div>
              ) : tasks.length === 0 ? (
                <p className="text-center text-gray-500">No tasks yet</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id}>
                    <Alert
                      color={task.status === "completed" ? "success" : "primary"}
                      className="flex justify-between items-center border-b py-2"
                      title={task.title}
                    >
                      <div className="w-full flex gap-2 justify-end">
                        <Button color="primary" isIconOnly size="sm" variant="flat" onPress={() => setTaskToComplete(task)}>
                          <GrCompliance size={20} />
                        </Button>
                        <Button color="danger" isIconOnly size="sm" variant="flat" onPress={() => setTaskToDelete(task)}>
                          <MdDeleteForever size={20} />
                        </Button>
                      </div>
                    </Alert>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        <DeleteTaskModal
          isOpen={!!taskToDelete}
          taskTitle={taskToDelete?.title || ""}
          onClose={() => setTaskToDelete(null)}
          onConfirm={async () => {
            if (taskToDelete) await handleDeleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }}
        />
        <ConfirmCompleteModal
          isOpen={!!taskToComplete}
          taskTitle={taskToComplete?.title || ""}
          isCompleted={taskToComplete?.status === "completed"}
          onClose={() => setTaskToComplete(null)}
          onConfirm={async () => {
            if (taskToComplete) {
              await handleToggleTask(taskToComplete.id, taskToComplete.status);
            }
            setTaskToComplete(null);
          }}
        />
      </div>
    </>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import {
  Button,
  Input,
  Chip,
  Spinner,
  Alert,
} from "@heroui/react";
import ProfileCard from "@/components/profile/card";
import DeleteTaskModal from "@/components/task/actions/delete/deleteTaskModal";
import ConfirmCompleteModal from "@/components/task/actions/confirm/confirmCompleteModal";
import { MdAddTask, MdDeleteForever } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import { GrCompliance } from "react-icons/gr";
import ChatbotDemo from "@/components/chatbot/ChatbotDemo";

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest";
const SCOPES =
  "https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

export default function App() {
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const tokenClientRef = useRef<any>(null);

  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [user, setUser] = useState<{ name: string; email: string; picture: string } | null>(null);

  // --- estados para modales ---
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const [taskToComplete, setTaskToComplete] = useState<any | null>(null);

  // Load scripts
  useEffect(() => {
    if (!CLIENT_ID || !API_KEY) {
      console.warn("Configure VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY in .env");
      return;
    }

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load " + src));
        document.head.appendChild(s);
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
            callback: (tokenResponse: any) => {
              if (tokenResponse.error) return;
              window.gapi.client.setToken({
                access_token: tokenResponse.access_token,
              });
              setSigned(true);
              fetchTaskLists();
              fetchUserInfo();
            },
          });

        setGisReady(true);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleAuth = () => {
    if (!tokenClientRef.current) return;
    setLoading(true);

    const currentToken = window.gapi.client.getToken();
    tokenClientRef.current.callback = (resp: any) => {
      if (resp.error) {
        setLoading(false);
        return;
      }
      window.gapi.client.setToken({ access_token: resp.access_token });
      console.log("Token recibido:", window.gapi.client.getToken()); // <-- Aquí
      setSigned(true);
      fetchTaskLists();
      fetchUserInfo();
      setLoading(false);
    };

    if (!currentToken) {
      tokenClientRef.current.requestAccessToken({ prompt: "consent" });
    } else {
      console.log(window.gapi.client.getToken());
      tokenClientRef.current.requestAccessToken({ prompt: "consent" });
    }
  };

  const fetchUserInfo = async () => {
    try {
      const res = await window.gapi.client.request({
        path: "https://www.googleapis.com/oauth2/v2/userinfo",
      });
      const { name, email, picture } = res.result;
      setUser({ name, email, picture });
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const handleSignout = () => {
    const token = window.gapi.client.getToken();
    if (token && token.access_token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken("");
      setSigned(false);
      setTasks([]);
      setSelectedList(null);
      setUser(null);
    }
  };

  // --- Crear lista de tareas por defecto ---
  const createDefaultTaskList = async () => {
    try {
      const res = await window.gapi.client.request({
        path: `https://tasks.googleapis.com/tasks/v1/users/@me/lists`,
        method: "POST",
        body: { title: "My Tasks" },
      });
      const listId = res.result.id;
      setSelectedList(listId);
      fetchTasks(listId);
    } catch (err) {
      console.error("Error creating default task list", err);
    }
  };

  const fetchTaskLists = async () => {
    setLoading(true);
    try {
      const res = await window.gapi.client.tasks.tasklists.list({
        maxResults: 100,
      });
      const lists = res.result.items || [];
      if (lists.length) {
        setSelectedList(lists[0].id);
        fetchTasks(lists[0].id);
      } else {
        // Si no tiene ninguna lista, crear una por defecto
        await createDefaultTaskList();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchTasks = async (tasklistId: string) => {
    setLoading(true);
    try {
      const res = await window.gapi.client.tasks.tasks.list({
        tasklist: tasklistId,
        maxResults: 100,
      });
      setTasks(res.result.items || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const createTask = async () => {
    const title = newTitle.trim();
    if (!title || !selectedList) return;
    setLoading(true);
    try {
      await window.gapi.client.request({
        path: `https://tasks.googleapis.com/tasks/v1/lists/${selectedList}/tasks`,
        method: "POST",
        body: { title },
      });
      setNewTitle("");
      fetchTasks(selectedList);
    } catch (err) {
      console.error("createTask error", err);
    }
    setLoading(false);
  };

  const toggleTaskComplete = async (taskId: string, status: string) => {
    if (!selectedList) return;
    const newStatus = status === "completed" ? "needsAction" : "completed";
    try {
      await window.gapi.client.request({
        path: `https://tasks.googleapis.com/tasks/v1/lists/${selectedList}/tasks/${taskId}`,
        method: "PATCH",
        body: { status: newStatus },
      });
      fetchTasks(selectedList);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!selectedList) return;
    try {
      await window.gapi.client.request({
        path: `https://tasks.googleapis.com/tasks/v1/lists/${selectedList}/tasks/${taskId}`,
        method: "DELETE",
      });
      fetchTasks(selectedList);
    } catch (err) {
      console.error(err);
    }
  };

  const createTaskFromBot = async (title: string) => {
    if (!selectedList) {
      console.warn("No selected list to create task in.");
      return;
    }
    try {
      setLoading(true);
      await window.gapi.client.request({
        path: `https://tasks.googleapis.com/tasks/v1/lists/${selectedList}/tasks`,
        method: "POST",
        body: { title },
      });
      await fetchTasks(selectedList);
    } catch (err) {
      console.error("createTaskFromBot error", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {user ? <ChatbotDemo createTaskFromBot={createTaskFromBot} /> : undefined}
      
      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">📝 Task Manager</h1>
          <p className="">Manage your tasks with Google Tasks, React and HeroUI</p>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auth / Profile Card */}
          {!signed || !user ? (
            <div className="flex flex-col gap-4 items-center p-4">
                <Chip size="lg" variant="flat" color={signed ? "success" : "danger"}>
                  {signed ? "Connected" : "Not connected"}
                </Chip>
                Init with
                <Button
                  color="primary"
                  variant="flat"
                  size="lg"
                  onPress={handleAuth}
                  isDisabled={!(gapiReady && gisReady)}
                  isLoading={loading}
                >
                  <span className="flex gap-2 items-center"><FaGoogle size={20}/> Google</span> 
                </Button>
            </div>
          ) : (
            <ProfileCard user={user} onSignout={handleSignout} />
          )}

          {/* Tasks */}
          {signed && (
            <div className="flex flex-col gap-4">
                {selectedList ? <Chip variant="flat" color="primary">Your Task List</Chip> : <Chip variant="flat" color="danger">You dont contain one list</Chip>}
                <div className="flex gap-2 items-center">
                  <Input
                    variant="underlined"
                    color="primary"
                    label="Task name"
                    placeholder="New task"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") createTask();
                    }}
                  />
                  <Button
                    color="success"
                    variant="shadow"
                    className="text-white"
                    size="lg"
                    onPress={createTask}
                    isDisabled={!newTitle.trim()}
                    isLoading={loading}
                    isIconOnly
                  >
                    <MdAddTask size={20}/>
                  </Button>
                </div>

                {loading ? (
                  <div className="flex justify-center">
                    <Spinner />
                  </div>
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

        {/* --- Modales --- */}
        <DeleteTaskModal
          isOpen={!!taskToDelete}
          taskTitle={taskToDelete?.title || ""}
          onClose={() => setTaskToDelete(null)}
          onConfirm={async () => {
            if (taskToDelete) await deleteTask(taskToDelete.id);
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
              await toggleTaskComplete(taskToComplete.id, taskToComplete.status);
            }
            setTaskToComplete(null);
          }}
        />
      </div>
    </>
  );
}

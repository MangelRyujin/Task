export const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest";

export const SCOPES =
  "https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

export async function fetchUserInfo() {
  const res = await window.gapi.client.request({
    path: "https://www.googleapis.com/oauth2/v2/userinfo",
  });
  const { name, email, picture } = res.result;
  return { name, email, picture };
}

export async function fetchTaskLists() {
  const res = await window.gapi.client.tasks.tasklists.list({
    maxResults: 100,
  });
  return res.result.items || [];
}

export async function fetchTasks(tasklistId: string) {
  const res = await window.gapi.client.tasks.tasks.list({
    tasklist: tasklistId,
    maxResults: 100,
  });
  return res.result.items || [];
}

export async function createTask(tasklistId: string, title: string) {
  return window.gapi.client.request({
    path: `https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks`,
    method: "POST",
    body: { title },
  });
}

export async function toggleTaskComplete(tasklistId: string, taskId: string, status: string) {
  const newStatus = status === "completed" ? "needsAction" : "completed";
  return window.gapi.client.request({
    path: `https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks/${taskId}`,
    method: "PATCH",
    body: { status: newStatus },
  });
}

export async function deleteTask(tasklistId: string, taskId: string) {
  return window.gapi.client.request({
    path: `https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks/${taskId}`,
    method: "DELETE",
  });
}


export const getDefaultTaskListId = async () => {
  const res = await window.gapi.client.tasks.tasklists.list({ maxResults: 1 });
  if (res.result.items && res.result.items.length > 0) {
    return res.result.items[0].id;
  }
  throw new Error("No tasklists found for this user");
};
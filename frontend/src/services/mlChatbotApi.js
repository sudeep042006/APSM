import api from "@/services/api";

export async function getMlChatbotStatus() {
  const response = await api.get("/api/ml-chatbot/status");
  return response.data;
}

export async function sendMlChatbotMessage({ message, platform, context = {} }) {
  const response = await api.post("/api/ml-chatbot/chat", {
    message,
    platform,
    context,
  });
  return response.data;
}

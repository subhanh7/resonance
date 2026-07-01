import axios, { AxiosError } from "axios";
import type { AnalyzeRequest, AnalyzeResponse, ApiErrorShape } from "@/types/api";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL,
  timeout: 60_000,
});

export class AnalyzeError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "AnalyzeError";
    this.status = status;
  }
}

export async function analyzeVideo(payload: AnalyzeRequest): Promise<AnalyzeResponse> {
  try {
    const { data } = await apiClient.post<AnalyzeResponse>("/api/analyze", payload);
    return data;
  } catch (err) {
    const axiosErr = err as AxiosError<ApiErrorShape>;
    const message =
      axiosErr.response?.data?.detail ??
      axiosErr.message ??
      "Something went wrong while reaching the server.";
    throw new AnalyzeError(message, axiosErr.response?.status);
  }
}

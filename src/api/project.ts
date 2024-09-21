import axios, {AxiosProgressEvent, AxiosResponse} from "axios";
import {apiUrl, derivativeUrl} from "./core";
import {IProject} from "@bim/types";

export const getListProject = async (
  token: string
): Promise<AxiosResponse<{projects: IProject[]}>> => {
  return await axios({
    url: `${apiUrl}/v1/projects`,
    method: "GET",
    responseType: "json",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
export const newProject = async (
  token: string,
  data: {projectName: string; address: string}
): Promise<AxiosResponse<{projects: IProject[]}>> => {
  return await axios({
    url: `${apiUrl}/v1/projects`,
    method: "POST",
    responseType: "json",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data,
  });
};
export const createModel = async (
  token: string,
  data: {
    projectId: string;
    modelId: string;
    name: string;
  }
): Promise<AxiosResponse<{projects: IProject[]}>> => {
  return await axios({
    url: `${apiUrl}/v1/models`,
    method: "POST",
    responseType: "json",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data,
  });
};
export const derivativeFile = async (
  file: File,
  projectId: string,
  token: string,
  onUploadProgress: (progressEvent: AxiosProgressEvent) => void
): Promise<AxiosResponse<{projects: IProject[]}>> => {
  const formData = new FormData();
  formData.append("projectId", projectId);
  formData.append("token", token);
  formData.append("file", file);
  return await axios.post(`${derivativeUrl}/v1/derivative`, formData, {
    onUploadProgress,
  });
};

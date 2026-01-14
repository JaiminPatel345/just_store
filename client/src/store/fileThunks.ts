import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { extractErrorMessage } from '../utils/errorUtils';
import { setDownloadProgress } from './fileSlice';
import type { AppDispatch } from './index';

// Get API URL from env or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Types
export interface UploadResponse {
  message: string;
  fileId: number;
  youtubeVideoId: string;
  youtubeVideoUrl: string;
}

export interface FileInfo {
  id: number;
  originalFileName: string;
  originalFileSizeFormatted: string;
  originalFileSizeInByte: number;
  originalFileType: string;
  tags: string[];
  status: string;
  createdAt: string;
}

export interface FileDetail {
  id: number;
  originalFileName: string;
  originalFileSizeFormatted: string;
  originalFileSizeInByte: number;
  originalFileType: string;
  tags: string[];
  youtubeVideoId: string;
  youtubeVideoUrl: string;
  status: string;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  fileName?: string;
  tag?: string;
  startDate?: string;
  endDate?: string;
}

export interface DownloadProgress {
  progress: number;       // 0-100 percentage
  rate: number;           // bytes per second
  loaded: number;         // bytes loaded
  total: number;          // total bytes
  estimated: number;      // estimated time remaining in seconds
}

// Async thunk for uploading file
export const uploadFile = createAsyncThunk(
  'file/upload',
  async (payload: { file: File; secretKey?: string; tags?: string[] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', payload.file);
      if (payload.secretKey) {
        formData.append('secretKey', payload.secretKey);
      }
      if (payload.tags && payload.tags.length > 0) {
        payload.tags.forEach(tag => formData.append('tags', tag));
      }

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as UploadResponse;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Upload failed'));
    }
  }
);

// Async thunk for fetching all files
export const fetchAllFiles = createAsyncThunk(
  'file/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/files`);
      return response.data as FileInfo[];
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to fetch files'));
    }
  }
);

// Async thunk for searching files with filters
export const searchFiles = createAsyncThunk(
  'file/search',
  async (params: SearchParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.fileName) queryParams.append('fileName', params.fileName);
      if (params.tag) queryParams.append('tag', params.tag);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await axios.get(`${API_URL}/files/search?${queryParams.toString()}`);
      return response.data as FileInfo[];
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Search failed'));
    }
  }
);

// Async thunk for fetching file details by ID
export const fetchFileById = createAsyncThunk(
  'file/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/files/${id}`);
      return response.data as FileDetail;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to fetch file details'));
    }
  }
);

// Async thunk for downloading file with progress tracking
export const downloadFile = createAsyncThunk<
  string,
  { fileId: number; secretKey?: string },
  { dispatch: AppDispatch }
>(
  'file/download',
  async ({ fileId, secretKey }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/download/${fileId}`, {
        params: { secretKey },
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const progress = progressEvent.progress ?? 0;
          const rate = progressEvent.rate ?? 0;
          const loaded = progressEvent.loaded ?? 0;
          const total = progressEvent.total ?? 0;
          const estimated = progressEvent.estimated ?? 0;

          // Dispatch action to update progress in Redux state
          dispatch(setDownloadProgress({
            progress: Math.round(progress * 100),
            rate,
            loaded,
            total,
            estimated,
          }));
        }
      });
      return URL.createObjectURL(response.data);
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err, 'Download failed'));
    }
  }
);

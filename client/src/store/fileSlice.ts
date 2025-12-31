import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Get API URL from env or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface UploadResponse {
  message: string;
  fileId: number;
  youtubeVideoId: string;
  youtubeVideoUrl: string;
}

// User-friendly file info (from search results)
interface FileInfo {
  id: number;
  originalFileName: string;
  originalFileSizeFormatted: string;
  originalFileSizeInByte: number;
  originalFileType: string;
  tags: string[];
  status: string;
  createdAt: string;
}

// Full file details (includes YouTube info)
interface FileDetail {
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

interface SearchParams {
  fileName?: string;
  tag?: string;
  startDate?: string;
  endDate?: string;
}

interface FileState {
  uploading: boolean;
  uploadSuccess: boolean;
  uploadResponse: UploadResponse | null;
  error: string | null;
  retrievedVideoBlobUrl: string | null;
  retrievedOriginalFileBlobUrl: string | null;
  // New state for file listing
  files: FileInfo[];
  selectedFile: FileDetail | null;
  filesLoading: boolean;
  searchLoading: boolean;
  downloading: boolean;
}

const initialState: FileState = {
  uploading: false,
  uploadSuccess: false,
  uploadResponse: null,
  error: null,
  retrievedVideoBlobUrl: null,
  retrievedOriginalFileBlobUrl: null,
  files: [],
  selectedFile: null,
  filesLoading: false,
  searchLoading: false,
  downloading: false,
};

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
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Upload failed');
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
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch files');
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
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Search failed');
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
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch file details');
    }
  }
);

// Async thunk for retrieving file (video path -> original file)
export const retrieveFile = createAsyncThunk(
  'file/retrieve',
  async (videoPath: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/file`, {
        params: { videoPath },
        responseType: 'blob',
      });
      return URL.createObjectURL(response.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Retrieval failed');
    }
  }
);

// Async thunk for downloading original file by YouTube video ID
// Note: This needs backend support for downloading via YouTube video ID
export const downloadFileByYoutubeId = createAsyncThunk(
  'file/downloadByYoutubeId',
  async ({ youtubeVideoId, fileName }: { youtubeVideoId: string; fileName: string }, { rejectWithValue }) => {
    try {
      // For now, we'll return the YouTube URL since the download from YouTube
      // requires additional implementation (streaming from YouTube)
      // The actual file download would need backend to fetch from YouTube and decode
      return { youtubeVideoId, fileName, message: 'Download initiated' };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Download failed');
    }
  }
);

const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    resetState: (state) => {
        state.uploading = false;
        state.uploadSuccess = false;
        state.uploadResponse = null;
        state.error = null;
        state.retrievedVideoBlobUrl = null;
        state.retrievedOriginalFileBlobUrl = null;
    },
    setRetrievedUrl: (state, action: PayloadAction<string>) => {
        state.retrievedOriginalFileBlobUrl = action.payload;
    },
    clearSelectedFile: (state) => {
        state.selectedFile = null;
    },
    clearError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload
      .addCase(uploadFile.pending, (state) => {
        state.uploading = true;
        state.error = null;
        state.uploadSuccess = false;
        state.uploadResponse = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadSuccess = true;
        state.uploadResponse = action.payload;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      })
      // Retrieve
      .addCase(retrieveFile.pending, (state) => {
        state.uploading = true; // reusing flag or create new one
        state.error = null;
        state.retrievedOriginalFileBlobUrl = null;
      })
      .addCase(retrieveFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.retrievedOriginalFileBlobUrl = action.payload;
      })
      .addCase(retrieveFile.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      })
      // Fetch All Files
      .addCase(fetchAllFiles.pending, (state) => {
        state.filesLoading = true;
        state.error = null;
      })
      .addCase(fetchAllFiles.fulfilled, (state, action) => {
        state.filesLoading = false;
        state.files = action.payload;
      })
      .addCase(fetchAllFiles.rejected, (state, action) => {
        state.filesLoading = false;
        state.error = action.payload as string;
      })
      // Search Files
      .addCase(searchFiles.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchFiles.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.files = action.payload;
      })
      .addCase(searchFiles.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload as string;
      })
      // Fetch File By ID
      .addCase(fetchFileById.pending, (state) => {
        state.filesLoading = true;
        state.error = null;
      })
      .addCase(fetchFileById.fulfilled, (state, action) => {
        state.filesLoading = false;
        state.selectedFile = action.payload;
      })
      .addCase(fetchFileById.rejected, (state, action) => {
        state.filesLoading = false;
        state.error = action.payload as string;
      })
      // Download by YouTube ID
      .addCase(downloadFileByYoutubeId.pending, (state) => {
        state.downloading = true;
        state.error = null;
      })
      .addCase(downloadFileByYoutubeId.fulfilled, (state) => {
        state.downloading = false;
      })
      .addCase(downloadFileByYoutubeId.rejected, (state, action) => {
        state.downloading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetState, setRetrievedUrl, clearSelectedFile, clearError } = fileSlice.actions;
export default fileSlice.reducer;


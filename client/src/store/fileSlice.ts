import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  uploadFile,
  fetchAllFiles,
  searchFiles,
  fetchFileById,
  downloadFile,
  type UploadResponse,
  type FileInfo,
  type FileDetail,
  type DownloadProgress,
} from './fileThunks';

// Re-export thunks for convenience
export { uploadFile, fetchAllFiles, searchFiles, fetchFileById, downloadFile };
export type { UploadResponse, FileInfo, FileDetail, DownloadProgress, SearchParams } from './fileThunks';

interface FileState {
  uploading: boolean;
  uploadSuccess: boolean;
  uploadResponse: UploadResponse | null;
  error: string | null;
  // File listing state
  files: FileInfo[];
  selectedFile: FileDetail | null;
  filesLoading: boolean;
  searchLoading: boolean;
  // Download state
  downloading: boolean;
  downloadUrl: string | null;
  downloadProgress: DownloadProgress | null;
}

const initialState: FileState = {
  uploading: false,
  uploadSuccess: false,
  uploadResponse: null,
  error: null,
  files: [],
  selectedFile: null,
  filesLoading: false,
  searchLoading: false,
  downloading: false,
  downloadUrl: null,
  downloadProgress: null,
};

const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    resetState: (state) => {
      state.uploading = false;
      state.uploadSuccess = false;
      state.uploadResponse = null;
      state.error = null;
      state.downloadUrl = null;
      state.downloadProgress = null;
    },
    setDownloadUrl: (state, action: PayloadAction<string>) => {
      state.downloadUrl = action.payload;
    },
    setDownloadProgress: (state, action: PayloadAction<DownloadProgress>) => {
      state.downloadProgress = action.payload;
    },
    clearDownloadProgress: (state) => {
      state.downloadProgress = null;
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
      // Download
      .addCase(downloadFile.pending, (state) => {
        state.downloading = true;
        state.error = null;
        state.downloadUrl = null;
        state.downloadProgress = null;
      })
      .addCase(downloadFile.fulfilled, (state, action) => {
        state.downloading = false;
        state.downloadUrl = action.payload;
      })
      .addCase(downloadFile.rejected, (state, action) => {
        state.downloading = false;
        state.downloadProgress = null;
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
      });
  },
});

export const { 
  resetState, 
  setDownloadUrl, 
  setDownloadProgress, 
  clearDownloadProgress,
  clearSelectedFile, 
  clearError 
} = fileSlice.actions;

export default fileSlice.reducer;

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Get API URL from env or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface FileState {
  uploading: boolean;
  uploadSuccess: boolean;
  error: string | null;
  retrievedVideoBlobUrl: string | null;
  retrievedOriginalFileBlobUrl: string | null;
}

const initialState: FileState = {
  uploading: false,
  uploadSuccess: false,
  error: null,
  retrievedVideoBlobUrl: null,
  retrievedOriginalFileBlobUrl: null,
};

// Async thunk for uploading file
export const uploadFile = createAsyncThunk(
  'file/upload',
  async (payload: { file: File; secretKey?: string }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', payload.file);
      if (payload.secretKey) {
        formData.append('secretKey', payload.secretKey);
      }

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Upload failed');
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

// Helper to fetch the uploaded video if user wants to see it immediately
// Since backend saves to /tmp/jaimin.mp4, we can try to fetch it? 
// But /file endpoint logic is "decodeVideo", so it expects a video path and returns *original* file.
// There is NO endpoint to "get the video itself" from the backend currently.
// The backend creates a video but doesn't serve it. 
// However, the user request says "show respose(video file)".
// If backend strictly does File -> Video (store) AND Video -> File (retrieve),
// Then "show response (video file)" after upload implies we should show the *result* of the upload?
// But the result is a video on the server.
// Without an endpoint to download/stream that video, we cannot show it.
// I will populate `uploadSuccess` and show a success message. 
// Maybe I can mock the display or ask user? 
// Getting stuck on "show response" if backend doesn't serve it.
// But wait! If I upload a file, the backend writes to /tmp/jaimin.mp4.
// If I call /file?videoPath=/tmp/jaimin.mp4, the backend READS /tmp/jaimin.mp4, DECODES it, and returns the ORIGINAL file bytes.
// So calling /file with the output path returns the INPUT file.
// That doesn't "show the video file".
// I will proceed with just showing success for now.

const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    resetState: (state) => {
        state.uploading = false;
        state.uploadSuccess = false;
        state.error = null;
        state.retrievedVideoBlobUrl = null;
        state.retrievedOriginalFileBlobUrl = null;
    },
    setRetrievedUrl: (state, action: PayloadAction<string>) => {
        state.retrievedOriginalFileBlobUrl = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload
      .addCase(uploadFile.pending, (state) => {
        state.uploading = true;
        state.error = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.uploading = false;
        state.uploadSuccess = true;
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
      });
  },
});

export const { resetState, setRetrievedUrl } = fileSlice.actions;
export default fileSlice.reducer;

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  FileText,
  Lock,
  HardDrive,
  Youtube,
  ExternalLink,
  Shield,
  Sparkles,
  FileDown,
  Key
} from 'lucide-react';
import axios from 'axios';
import { extractErrorMessage } from '../utils/errorUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface DownloadResponse {
  videoId: number;
  originalFileName: string;
  originalFileSizeInByte: number;
  originalFileType: string;
  youtubeVideoUrl: string;
  fileContent: string; // Base64 encoded
}

type DownloadStatus = 'idle' | 'fetching' | 'ready' | 'downloading' | 'success' | 'error';

const DownloadPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fileId = searchParams.get('fileId');
  const fileName = searchParams.get('fileName');
  const fileSize = searchParams.get('fileSize');
  const fileType = searchParams.get('fileType');
  const isEncrypted = searchParams.get('isEncrypted') === 'true';
  const youtubeUrl = searchParams.get('youtubeUrl');

  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState('');
  const [downloadData, setDownloadData] = useState<DownloadResponse | null>(null);
  const [progress, setProgress] = useState(0);

  // Validate required params
  useEffect(() => {
    if (!fileId) {
      setError('No file ID provided. Please go back and select a file.');
      setStatus('error');
    }
  }, [fileId]);

  const fetchAndDownload = async () => {
    if (!fileId) return;

    try {
      setStatus('fetching');
      setError(null);
      setProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const params: { secretKey?: string } = {};
      if (isEncrypted && secretKey) {
        params.secretKey = secretKey;
      }

      const response = await axios.get<DownloadResponse>(`${API_URL}/download/${fileId}`, {
        params
      });

      clearInterval(progressInterval);
      setProgress(100);
      setDownloadData(response.data);
      setStatus('ready');
    } catch (err: any) {
      setStatus('error');
      const errorMessage = extractErrorMessage(err, 'Failed to fetch file');
      setError(errorMessage);
    }
  };

  const handleDownload = () => {
    if (!downloadData) return;

    setStatus('downloading');

    try {
      // Decode base64 content
      const byteCharacters = atob(downloadData.fileContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: downloadData.originalFileType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadData.originalFileName;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError('Failed to process the downloaded file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (name?: string | null) => {
    if (!name) return '';
    const parts = name.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
  };

  const getFileNameWithoutExtension = (name?: string | null) => {
    if (!name) return '';
    const lastDotIndex = name.lastIndexOf('.');
    return lastDotIndex > 0 ? name.slice(0, lastDotIndex) : name;
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/retrieve')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Files
      </motion.button>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        {/* Background Gradient Orb */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative bg-gradient-to-br from-[#242424] to-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="relative px-8 py-10 border-b border-gray-800/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30">
                  <FileDown className="w-8 h-8 text-blue-400" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Download File</h1>
                <p className="text-gray-400">Retrieve your original file from YouTube</p>
              </div>
            </div>

            {/* File Info Card */}
            {fileName && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#1a1a1a]/50 rounded-xl p-5 border border-gray-700/50"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium truncate" title={fileName}>
                        {getFileNameWithoutExtension(fileName)}
                      </h3>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                        {getFileExtension(fileName)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      {fileSize && (
                        <div className="flex items-center gap-1.5">
                          <HardDrive className="w-4 h-4" />
                          <span>{formatFileSize(Number(fileSize))}</span>
                        </div>
                      )}
                      {isEncrypted && (
                        <div className="flex items-center gap-1.5 text-green-400">
                          <Shield className="w-4 h-4" />
                          <span>Encrypted</span>
                        </div>
                      )}
                      {fileType && (
                        <span className="text-gray-500">{fileType}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* YouTube Info */}
                {youtubeUrl && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Youtube className="w-4 h-4" />
                      View on YouTube
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Error State - Invalid URL */}
              {status === 'error' && !fileId && (
                <motion.div
                  key="error-no-file"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Invalid Request</h3>
                  <p className="text-gray-400 mb-6">{error}</p>
                  <button
                    onClick={() => navigate('/retrieve')}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                  >
                    Go to Files
                  </button>
                </motion.div>
              )}

              {/* Idle State - Ready to Fetch */}
              {status === 'idle' && fileId && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Secret Key Input for Encrypted Files */}
                  {isEncrypted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6"
                    >
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                        <Key className="w-4 h-4 text-yellow-400" />
                        Decryption Key Required
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="password"
                          value={secretKey}
                          onChange={(e) => setSecretKey(e.target.value)}
                          placeholder="Enter your secret key to decrypt the file..."
                          className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        This file is encrypted. You need the secret key that was used during upload.
                      </p>
                    </motion.div>
                  )}

                  <button
                    onClick={fetchAndDownload}
                    disabled={isEncrypted && !secretKey}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-3 group"
                  >
                    <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {isEncrypted && !secretKey ? 'Enter Secret Key First' : 'Fetch File from YouTube'}
                    <Sparkles className="w-4 h-4 opacity-50" />
                  </button>

                  <p className="text-center text-gray-500 text-sm mt-4">
                    This will download the video from YouTube and decode it to get your original file.
                  </p>
                </motion.div>
              )}

              {/* Fetching State */}
              {status === 'fetching' && (
                <motion.div
                  key="fetching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
                    <div
                      className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
                      style={{
                        clipPath: `inset(0 ${100 - progress}% 0 0)`
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{progress}%</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Fetching Your File</h3>
                  <p className="text-gray-400">Downloading from YouTube and decoding...</p>

                  {/* Progress Bar */}
                  <div className="mt-6 max-w-xs mx-auto">
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Ready to Download State */}
              {status === 'ready' && downloadData && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-4"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">File Ready!</h3>
                  <p className="text-gray-400 mb-6">
                    Your file has been successfully retrieved and decoded.
                  </p>

                  {/* File Preview Card */}
                  <div className="bg-[#1a1a1a]/50 rounded-xl p-5 mb-6 border border-gray-700/50 text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <FileText className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{downloadData.originalFileName}</p>
                        <p className="text-gray-500 text-sm">
                          {formatFileSize(downloadData.originalFileSizeInByte)} • {downloadData.originalFileType}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-3 group shadow-lg shadow-green-900/20"
                  >
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    Download {downloadData.originalFileName}
                  </button>
                </motion.div>
              )}

              {/* Downloading State */}
              {status === 'downloading' && (
                <motion.div
                  key="downloading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Processing Download...</h3>
                  <p className="text-gray-400">Preparing your file...</p>
                </motion.div>
              )}

              {/* Success State */}
              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30"
                  >
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </motion.div>
                  <h3 className="text-xl font-medium text-white mb-2">Download Complete!</h3>
                  <p className="text-gray-400 mb-6">
                    Your file has been saved to your downloads folder.
                  </p>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setStatus('ready');
                      }}
                      className="px-6 py-2.5 border border-gray-700 hover:border-gray-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Again
                    </button>
                    <button
                      onClick={() => navigate('/retrieve')}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                    >
                      Back to Files
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Error State - Fetch Failed */}
              {status === 'error' && fileId && error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Download Failed</h3>
                  <p className="text-gray-400 mb-6">{error}</p>

                  {isEncrypted && (
                    <p className="text-yellow-400 text-sm mb-4">
                      <Lock className="w-4 h-4 inline mr-1" />
                      Make sure you entered the correct decryption key.
                    </p>
                  )}

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setStatus('idle');
                        setError(null);
                      }}
                      className="px-6 py-2.5 border border-gray-700 hover:border-gray-500 text-white rounded-lg font-medium transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => navigate('/retrieve')}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                    >
                      Back to Files
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 p-4 bg-[#242424]/50 rounded-xl border border-gray-800"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Secure Download</h4>
            <p className="text-gray-400 text-sm">
              Your file is retrieved from YouTube, decoded, and delivered directly to your browser.
              All processing happens securely on our servers.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DownloadPage;

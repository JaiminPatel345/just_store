import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { uploadFile, resetState } from '../store/fileSlice';
import { UploadCloud, File, X, CheckCircle, Loader2, AlertTriangle, Tag, Youtube, ExternalLink, Lock } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const UploadPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { uploading, uploadSuccess, uploadResponse, error } = useSelector((state: RootState) => state.file);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [encryptFile, setEncryptFile] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      dispatch(resetState());
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: uploading || !isAuthenticated
  });

  const handleUpload = () => {
    if (!isAuthenticated) {
      alert("Please connect your YouTube account first.");
      return;
    }
    if (selectedFile) {
      if (encryptFile && !secretKey) {
        alert("Please enter a secret key.");
        return;
      }
      dispatch(uploadFile({ 
        file: selectedFile, 
        secretKey: encryptFile ? secretKey : undefined,
        tags: tags.length > 0 ? tags : undefined
      }));
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    dispatch(resetState());
    setEncryptFile(false);
    setSecretKey('');
    setTags([]);
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const resetAll = () => {
    setSelectedFile(null);
    dispatch(resetState());
    setEncryptFile(false);
    setSecretKey('');
    setTags([]);
    setTagInput('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Upload Files</h1>
        <p className="text-gray-400">Convert your files into video format for secure storage on YouTube.</p>
      </div>

      {/* Auth Warning */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-medium">YouTube Not Connected</p>
            <p className="text-yellow-400/70 text-sm">Please connect your YouTube account above to upload files.</p>
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Upload Success - Show YouTube Video */}
        <AnimatePresence>
          {uploadSuccess && uploadResponse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-green-400">Upload Successful!</h3>
              </div>
              
              <div className="space-y-4">
                {/* YouTube Video Embed */}
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${uploadResponse.youtubeVideoId}`}
                    title="Uploaded Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                {/* Video Info */}
                <div className="bg-black/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span className="text-gray-400">Video ID:</span>
                    <code className="text-blue-400">{uploadResponse.youtubeVideoId}</code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">File ID:</span>
                    <code className="text-blue-400">{uploadResponse.fileId}</code>
                  </div>
                  <a
                    href={uploadResponse.youtubeVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in YouTube
                  </a>
                </div>

                <button
                  onClick={resetAll}
                  className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  Upload Another File
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Selection Area - Only show when no file selected and not success */}
        {!selectedFile && !uploadSuccess && (
          <div
            {...getRootProps()}
            className={clsx(
              'relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 ease-in-out cursor-pointer',
              isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500',
              (!isAuthenticated) ? 'opacity-50 cursor-not-allowed' : '',
              'bg-[#242424]'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className={clsx(
                "p-4 rounded-full bg-gray-800 transition-transform duration-300",
                isDragActive ? "scale-110" : ""
              )}>
                <UploadCloud className="w-10 h-10 text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-white">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              </div>
            </div>
          </div>
        )}

        {/* File Selected - Show Options */}
        <AnimatePresence>
          {selectedFile && !uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#242424] rounded-xl border border-gray-700 overflow-hidden"
            >
              {/* File Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <File className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={removeFile}
                    className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Options */}
              <div className="p-4 space-y-4">
                {/* Encryption Option */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="encryptFile"
                      checked={encryptFile}
                      onChange={(e) => setEncryptFile(e.target.checked)}
                      disabled={uploading}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 bg-gray-700 border-gray-600"
                    />
                    <label htmlFor="encryptFile" className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer select-none">
                      <Lock className="w-4 h-4" />
                      Encrypt File
                    </label>
                  </div>

                  <AnimatePresence>
                    {encryptFile && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <input
                          type="password"
                          placeholder="Enter Secret Key"
                          value={secretKey}
                          onChange={(e) => setSecretKey(e.target.value)}
                          disabled={uploading}
                          className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tags Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Tag className="w-4 h-4" />
                    Tags
                  </label>
                  
                  <div className="flex flex-wrap gap-2 min-h-[32px]">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          disabled={uploading}
                          className="hover:text-blue-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Type a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    disabled={uploading}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  />
                </div>

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={uploading || !isAuthenticated}
                  className={clsx(
                    "w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2",
                    uploading || !isAuthenticated
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                  )}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Uploading to YouTube...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5" />
                      <span>Upload to YouTube</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <strong>Error:</strong> {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UploadPage;

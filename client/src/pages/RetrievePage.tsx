import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { retrieveFile } from '../store/fileSlice';
import { FileVideo, Download, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const RetrievePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { uploading, retrievedOriginalFileBlobUrl, error } = useSelector((state: RootState) => state.file);
  const [videoPath, setVideoPath] = useState('/tmp/jaimin.mp4'); // Defaulting for convenience as per findings

  const handleRetrieve = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoPath) {
      dispatch(retrieveFile(videoPath));
    }
  };

  const handleDownload = () => {
      if (retrievedOriginalFileBlobUrl) {
          const a = document.createElement('a');
          a.href = retrievedOriginalFileBlobUrl;
          a.download = 'retrieved_file'; // We don't know the original name/ext unless we parse it or backend returns it in header
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Retrieve File</h1>
        <p className="text-gray-400">Recover your original file from the video storage.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#242424] p-8 rounded-xl border border-gray-800 shadow-xl">
            <form onSubmit={handleRetrieve} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="videoPath" className="block text-sm font-medium text-gray-300">
                        Video Path on Server
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileVideo className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            id="videoPath"
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-lg leading-5 bg-[#1a1a1a] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                            placeholder="/path/to/video.mp4"
                            value={videoPath}
                            onChange={(e) => setVideoPath(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={!videoPath || uploading}
                        className={clsx(
                            "w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200",
                            !videoPath || uploading
                                ? "bg-gray-800 cursor-not-allowed text-gray-500"
                                : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                        )}
                    >
                        {uploading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            "Retrieve File"
                        )}
                    </button>
                </div>
            </form>
        </div>

        <AnimatePresence>
            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start space-x-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-400">Retrieval Failed</h3>
                        <p className="text-sm text-red-400/80 mt-1">{error}</p>
                    </div>
                </motion.div>
            )}

            {retrievedOriginalFileBlobUrl && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center"
                >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">File Retrieved Successfully!</h3>
                    <p className="text-gray-400 mb-6">Your file has been decoded from the video.</p>
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-black bg-white hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Download File
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RetrievePage;

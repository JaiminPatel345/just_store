import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchAllFiles, searchFiles, fetchFileById, clearSelectedFile, clearError } from '../store/fileSlice';
import { checkAuthStatus } from '../store/authSlice';
import { 
  Search, 
  Calendar, 
  Tag, 
  FileVideo, 
  Download, 
  Loader2, 
  AlertCircle, 
  X, 
  ExternalLink,
  Youtube,
  HardDrive,
  Clock,
  Lock,
  Filter,
  RefreshCw,
  FileText
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const RetrievePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { files, selectedFile, filesLoading, searchLoading, error } = useSelector((state: RootState) => state.file);
  const { isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);
  
  // Search filters
  const [searchFileName, setSearchFileName] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Check auth status and fetch files on mount
  useEffect(() => {
    dispatch(checkAuthStatus());
    // Fetch files regardless - if not authenticated, the API might return empty or public files
    dispatch(fetchAllFiles());
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: { fileName?: string; tag?: string; startDate?: string; endDate?: string } = {};
    if (searchFileName.trim()) params.fileName = searchFileName.trim();
    if (searchTag.trim()) params.tag = searchTag.trim();
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    if (Object.keys(params).length > 0) {
      dispatch(searchFiles(params));
    } else {
      dispatch(fetchAllFiles());
    }
  };

  const handleClearSearch = () => {
    setSearchFileName('');
    setSearchTag('');
    setStartDate('');
    setEndDate('');
    dispatch(fetchAllFiles());
  };

  const handleViewDetails = (fileId: number) => {
    dispatch(fetchFileById(fileId));
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    dispatch(clearSelectedFile());
  };

  const handleRefresh = () => {
    dispatch(fetchAllFiles());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPLOADED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'FAILED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Your Files</h1>
        <p className="text-gray-400">Browse and retrieve your stored files from YouTube.</p>
      </div>

      {/* Auth Warning */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-medium">YouTube Not Connected</p>
            <p className="text-yellow-400/70 text-sm">Please connect your YouTube account to view your files.</p>
          </div>
        </motion.div>
      )}

      {/* Search Section */}
      <div className="bg-[#242424] rounded-xl border border-gray-800 p-6 mb-6">
        <form onSubmit={handleSearch}>
          {/* Main Search Bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search by file name..."
                value={searchFileName}
                onChange={(e) => setSearchFileName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-lg bg-[#1a1a1a] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2",
                showFilters 
                  ? "bg-blue-600 border-blue-500 text-white" 
                  : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              type="submit"
              disabled={searchLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                  {/* Tag Filter */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                      <Tag className="w-4 h-4" />
                      Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., document, backup"
                      value={searchTag}
                      onChange={(e) => setSearchTag(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-700 rounded-lg bg-[#1a1a1a] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* Start Date */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      From Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-700 rounded-lg bg-[#1a1a1a] text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* End Date */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      To Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-700 rounded-lg bg-[#1a1a1a] text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Quick Stats & Refresh */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm">
          {files.length} file{files.length !== 1 ? 's' : ''} found
        </p>
        <button
          onClick={handleRefresh}
          disabled={filesLoading}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <RefreshCw className={clsx("w-4 h-4", filesLoading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-400">Error</h3>
              <p className="text-sm text-red-400/80 mt-1">{error}</p>
            </div>
            <button onClick={() => dispatch(clearError())} className="text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {filesLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading your files...</p>
        </div>
      )}

      {/* Files Grid */}
      {!filesLoading && files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#242424] rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all"
            >
              <div className="p-5">
                {/* File Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-blue-500/10 rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-medium truncate" title={file.originalFileName}>
                        {file.originalFileName}
                      </h3>
                      <p className="text-gray-500 text-sm">{file.originalFileType}</p>
                    </div>
                  </div>
                  <span className={clsx(
                    "px-2 py-1 text-xs rounded-full border flex-shrink-0",
                    getStatusColor(file.status)
                  )}>
                    {file.status}
                  </span>
                </div>

                {/* File Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <HardDrive className="w-4 h-4" />
                    <span>{file.originalFileSizeFormatted}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(file.createdAt)}</span>
                  </div>
                </div>

                {/* Tags */}
                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {file.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-700/50 text-gray-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(file.id)}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Get File
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!filesLoading && files.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileVideo className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No files found</h3>
          <p className="text-gray-400 mb-6">
            {searchFileName || searchTag || startDate || endDate
              ? "Try adjusting your search filters."
              : "Upload your first file to get started."}
          </p>
          {(searchFileName || searchTag || startDate || endDate) && (
            <button
              onClick={handleClearSearch}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1a1a1a] rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-xl font-semibold text-white">File Details</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              {filesLoading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              )}

              {selectedFile && !filesLoading && (
                <div className="p-6">
                  {/* YouTube Preview */}
                  {selectedFile.youtubeVideoId && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-500" />
                        Video Preview
                      </h3>
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${selectedFile.youtubeVideoId}`}
                          title="Video Preview"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* File Information */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">File Name</h3>
                      <p className="text-white">{selectedFile.originalFileName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Size</h3>
                        <p className="text-white">{selectedFile.originalFileSizeFormatted}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Type</h3>
                        <p className="text-white">{selectedFile.originalFileType}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Status</h3>
                        <span className={clsx(
                          "inline-flex px-2 py-1 text-xs rounded-full border",
                          getStatusColor(selectedFile.status)
                        )}>
                          {selectedFile.status}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Encrypted</h3>
                        <div className="flex items-center gap-2">
                          {selectedFile.isEncrypted ? (
                            <>
                              <Lock className="w-4 h-4 text-green-400" />
                              <span className="text-green-400">Yes</span>
                            </>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Created</h3>
                        <p className="text-white text-sm">{formatDate(selectedFile.createdAt)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Updated</h3>
                        <p className="text-white text-sm">{selectedFile.updatedAt ? formatDate(selectedFile.updatedAt) : '-'}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {selectedFile.tags && selectedFile.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedFile.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* YouTube Info */}
                    {selectedFile.youtubeVideoId && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">YouTube Video ID</h3>
                        <code className="text-blue-400 bg-gray-800 px-2 py-1 rounded text-sm">
                          {selectedFile.youtubeVideoId}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-800">
                    {selectedFile.youtubeVideoUrl && (
                      <a
                        href={selectedFile.youtubeVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-4 border border-gray-700 hover:border-gray-500 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in YouTube
                      </a>
                    )}
                    <button
                      className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      onClick={() => {
                        // Navigate to download page with file details
                        const params = new URLSearchParams({
                          fileId: selectedFile.id.toString(),
                          fileName: selectedFile.originalFileName,
                          fileSize: selectedFile.originalFileSizeInByte.toString(),
                          fileType: selectedFile.originalFileType,
                          isEncrypted: selectedFile.isEncrypted.toString(),
                          ...(selectedFile.youtubeVideoUrl && { youtubeUrl: selectedFile.youtubeVideoUrl })
                        });
                        handleCloseModal();
                        navigate(`/download?${params.toString()}`);
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Download Original
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RetrievePage;

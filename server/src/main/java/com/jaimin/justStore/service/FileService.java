package com.jaimin.justStore.service;

import com.jaimin.justStore.dto.DownloadFileResponseDto;
import com.jaimin.justStore.dto.FileDetailResponseDto;
import com.jaimin.justStore.dto.FileSearchResponseDto;
import com.jaimin.justStore.dto.UploadFileRequestDto;
import com.jaimin.justStore.enums.Status;
import com.jaimin.justStore.model.File;
import com.jaimin.justStore.repository.FileRepository;
import com.jaimin.justStore.utils.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.*;
import java.security.GeneralSecurityException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.jaimin.justStore.utils.UploadFileUtil.getNewFile;

@Service
public class FileService {
    private static final Logger logger = LoggerFactory.getLogger(FileService.class);

    private final FileRepository fileRepository;
    private final YouTubeAuthService youTubeAuthService;

    public FileService(FileRepository fileRepository, YouTubeAuthService youTubeAuthService) {
        this.fileRepository = fileRepository;
        this.youTubeAuthService = youTubeAuthService;
    }

    /**
     * Get all files as search response DTOs (user-friendly format).
     */
    public List<FileSearchResponseDto> getAllFiles() {
        return fileRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toSearchResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Search files with optional filters.
     */
    public List<FileSearchResponseDto> searchFiles(String fileName, String tag,
                                                   LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        return fileRepository.searchFiles(fileName, tag, startDateTime, endDateTime)
                .stream()
                .map(this::toSearchResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get full file details by ID.
     */
    public FileDetailResponseDto getFileById(Long id) {
        File file = fileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "File not found with id: " + id));
        return toDetailResponseDto(file);
    }

    /**
     * Get full file details by YouTube Video ID.
     */
    public FileDetailResponseDto getFileByYoutubeVideoId(String youtubeVideoId) {
        File file = fileRepository.findByYoutubeVideoId(youtubeVideoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "File not found with YouTube video ID: " + youtubeVideoId));
        return toDetailResponseDto(file);
    }

    /**
     * Convert File entity to FileSearchResponseDto (user-friendly).
     */
    private FileSearchResponseDto toSearchResponseDto(File file) {
        return new FileSearchResponseDto(
                file.getId(),
                file.getOriginalFileName(),
                FileSearchResponseDto.formatFileSize(file.getOriginalFileSizeInByte()),
                file.getOriginalFileSizeInByte(),
                file.getOriginalFileType(),
                file.getTags(),
                file.getStatus().name(),
                file.getCreatedAt());
    }

    /**
     * Convert File entity to FileDetailResponseDto (full details).
     */
    private FileDetailResponseDto toDetailResponseDto(File file) {
        return new FileDetailResponseDto(
                file.getId(),
                file.getOriginalFileName(),
                FileSearchResponseDto.formatFileSize(file.getOriginalFileSizeInByte()),
                file.getOriginalFileSizeInByte(),
                file.getOriginalFileType(),
                file.getTags(),
                file.getYoutubeVideoId(),
                file.getYoutubeVideoUrl(),
                file.getStatus().name(),
                file.getSecretKeyHash() != null,
                file.getCreatedAt(),
                file.getUpdatedAt());
    }

    public DownloadFileResponseDto downloadFile(Long videoId, String secretKey) {
        File file = fileRepository.findById(videoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "File not found with id: " + videoId));

        if (file.getSecretKeyHash() != null) {
            // File is encrypted, secret key is required
            if (secretKey == null) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "File is encrypted, provide secret key");
            }

            String newSecretKeyHash = HashUtil.hash(secretKey);
            if (!newSecretKeyHash.equals(file.getSecretKeyHash())) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Wrong secret key, provide correct secret key");
            }
        }

        try {
            InputStream videoStream = YouTubeVideoDownload.downloadVideo(file.getYoutubeVideoUrl());

            // decode
            ByteArrayOutputStream fileBaos = RetrieveVideo.decodeVideo(videoStream, file.getOriginalFileSizeInByte());

            // Verify file integrity
            String calculatedChecksum = ChecksumUtil.calculateChecksum(new ByteArrayInputStream(fileBaos.toByteArray(), 0, fileBaos.size()));
            if (!calculatedChecksum.equals(file.getFileChecksum())) {
                logger.info("In DB : " + file.getFileChecksum() + "\n Calculated checksum: " + calculatedChecksum);
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "File integrity check failed. The decoded file is corrupted.");
            }

            if (file.getSecretKeyHash() != null) {
                // TODO: decryption
            }

            StreamingResponseBody stream = outputStream -> {
                fileBaos.writeTo(outputStream);
                outputStream.flush();
                outputStream.close();
            };

            return DownloadFileResponseDto.from(file, stream);
        } catch (Exception e) {
            logger.error("Error downloading file", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }

    }

    /**
     * Encrypt, encode and upload File to YouTube
     */
    public ResponseEntity<?> uploadFile(UploadFileRequestDto uploadRequest) throws IOException {
        // Check if authenticated with YouTube
        if (!youTubeAuthService.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please authenticate with YouTube first. Visit /auth/youtube/login");
        }

        File newFile = getNewFile(uploadRequest);

        if (uploadRequest.secretKey() != null) {
            String secretKeyHash = HashUtil.hash(uploadRequest.secretKey());
            newFile.setSecretKeyHash(secretKeyHash);
        }

        String originalFileName = uploadRequest.file().getOriginalFilename();
        String fileChecksum = ChecksumUtil.calculateChecksum(uploadRequest.file());
        newFile.setFileChecksum(fileChecksum);

        // Save file with PENDING status initially
        newFile = fileRepository.save(newFile);
        logger.info("File record created with ID: {}, Status: PENDING", newFile.getId());

        // Encryption if secret key is given
        if (uploadRequest.secretKey() != null) {
            // TODO: encryption
            logger.info("File Encryption need to be implemented");
        }

        // Time to create video
        final int width = 1920;
        final int frameRate = 24;
        final int height = 1072;
        final String tempOutputPath = "/tmp/jaimin_" + newFile.getId() + ".mp4";

        try {

            CreateVideoUtil.createVideo(uploadRequest.file().getInputStream(), width, height, frameRate,
                    tempOutputPath);
            logger.info("Video created successfully at: {}", tempOutputPath);

            // Get access token from auth service
            String accessToken = youTubeAuthService.getAccessToken();
            if (accessToken == null) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "YouTube access token not available. Please re-authenticate.");
            }

            // Create YouTubeApi instance with access token
            YouTubeApi youTubeApi = new YouTubeApi(
                    youTubeAuthService.getHttpTransport(),
                    accessToken);

            // Upload to YouTube
            String videoTitle = originalFileName + " - JustStore_" + newFile.getId();
            logger.info("Uploading video to YouTube with title: {}", videoTitle);

            YouTubeApi.YouTubeUploadResult uploadResult = youTubeApi.uploadVideo(
                    tempOutputPath,
                    videoTitle,
                    uploadRequest.tags());

            // Update file record with YouTube info
            newFile.setYoutubeVideoId(uploadResult.videoId());
            newFile.setYoutubeVideoUrl(uploadResult.videoUrl());
            newFile.setStatus(Status.UPLOADED);
            fileRepository.save(newFile);

            logger.info("File uploaded successfully! YouTube Video ID: {}", uploadResult.videoId());

            // Clean up temp file
            java.io.File tempFile = new java.io.File(tempOutputPath);
            if (tempFile.exists() && tempFile.delete()) {
                logger.info("Temporary video file deleted: {}", tempOutputPath);
            }

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "File uploaded successfully",
                            "fileId", newFile.getId(),
                            "youtubeVideoId", uploadResult.videoId(),
                            "youtubeVideoUrl", uploadResult.videoUrl()));

        } catch (GeneralSecurityException e) {
            logger.error("YouTube authentication error: {}", e.getMessage());
            newFile.setStatus(Status.FAILED);
            fileRepository.save(newFile);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "YouTube authentication failed: " + e.getMessage());
        } catch (IOException e) {
            logger.error("Error during upload: {}", e.getMessage());
            newFile.setStatus(Status.FAILED);
            fileRepository.save(newFile);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Upload failed: " + e.getMessage());
        }
    }

    public ResponseEntity<?> testEncodeDecode(MultipartFile file) {
        //No DB same only encode and decode

        try {
            //encode
            final String tempOutputPath = "/tmp/jaimin_" + file.getOriginalFilename() + ".mp4";
            String encodeChecksum = ChecksumUtil.calculateChecksum(file.getInputStream());

            final int width = 1920;
            final int frameRate = 24;
            final int height = 1072;

            CreateVideoUtil.createVideo(file.getInputStream(), width, height, frameRate, tempOutputPath);

            //decode
            InputStream is = new FileInputStream(tempOutputPath);
            ByteArrayOutputStream outputStream = RetrieveVideo.decodeVideo(is, file.getSize());

            String decodeChecksum = ChecksumUtil.calculateChecksum(new ByteArrayInputStream(outputStream.toByteArray(), 0, outputStream.size()));

            logger.info("Encoded video checksum: {}", encodeChecksum);
            logger.info("Decode view checksum: {}", decodeChecksum);

            byte[] decodedBytes = outputStream.toByteArray();

            //For zip this also fails
            logger.info("Real file bytes: {}", file.getBytes().length);
            logger.info("Decoded video bytes: {}", decodedBytes.length);

            //try last bytes
            byte[] originalBytes = file.getBytes();


            //Last 10
            logger.info("Last 10 bytes: " + Arrays.toString(
                    Arrays.copyOfRange(originalBytes, originalBytes.length - 10, originalBytes.length)
            ));

            logger.info("Last 10 bytes: " + Arrays.toString(
                    Arrays.copyOfRange(decodedBytes, decodedBytes.length - 10, decodedBytes.length)
            ));

            //10 from start
            logger.info("First 10 bytes: " + Arrays.toString(
                    Arrays.copyOfRange(originalBytes, 0, 10)
            ));

            logger.info("First 10 bytes: " + Arrays.toString(
                    Arrays.copyOfRange(decodedBytes, 0, 10)
            ));


            // compare last 1000
            // Compare last 1000 bytes
            int compareLength = Math.min(1000, Math.min(originalBytes.length, decodedBytes.length));
            int originalStart = originalBytes.length - compareLength;
            int decodedStart = decodedBytes.length - compareLength;

            byte[] originalLast1000 = Arrays.copyOfRange(originalBytes, originalStart, originalBytes.length);
            byte[] decodedLast1000 = Arrays.copyOfRange(decodedBytes, decodedStart, decodedBytes.length);

            // Log the arrays
            logger.info("Original last 1000 bytes: " + Arrays.toString(originalLast1000));
            logger.info("Decoded last 1000 bytes: " + Arrays.toString(decodedLast1000));

            // Find first difference in last 1000 bytes
            boolean foundDifference = false;
            for (int i = 0; i < compareLength; i++) {
                if (originalLast1000[i] != decodedLast1000[i]) {
                    logger.info("First difference in last 1000 bytes at position " + i +
                            " (byte " + (originalStart + i) + " from start)");
                    logger.info("Original: " + originalLast1000[i] + ", Decoded: " + decodedLast1000[i]);
                    foundDifference = true;
                    break;
                }
            }

            if (!foundDifference) {
                logger.info("Last 1000 bytes are identical");
            }

            //WTF last bytes are same, size is same but still checksum is diff.

            logger.info("Arrays equal: " + Arrays.equals(originalBytes, decodedBytes));
            // Ohhh full array are different.... Hmmm


            // Binary search to find the first different byte
            int firstDiff = -1;
            for (int i = 0; i < Math.min(originalBytes.length, decodedBytes.length); i++) {
                if (originalBytes[i] != decodedBytes[i]) {
                    firstDiff = i;
                    break;
                }
            }

            if (firstDiff != -1) {
                logger.info("First difference at byte index: " + firstDiff);
                logger.info("Original byte: " + originalBytes[firstDiff]);
                logger.info("Decoded byte: " + decodedBytes[firstDiff]);

                // Show context around the difference (±10 bytes)
                int start = Math.max(0, firstDiff - 10);
                int end = Math.min(originalBytes.length, firstDiff + 10);

                logger.info("Original context: " + Arrays.toString(
                        Arrays.copyOfRange(originalBytes, start, end)
                ));
                logger.info("Decoded context: " + Arrays.toString(
                        Arrays.copyOfRange(decodedBytes, start, end)
                ));
            } else {
                logger.info("No byte differences found - arrays should be equal!");
            }

            // Also count total differences
            int diffCount = 0;
            for (int i = 0; i < Math.min(originalBytes.length, decodedBytes.length); i++) {
                if (originalBytes[i] != decodedBytes[i]) {
                    diffCount++;
                }
            }
            logger.info("Total different bytes: " + diffCount + " out of " + originalBytes.length);


            return ResponseEntity
                    .status(HttpStatus.OK)
                    .header(HttpHeaders.CONTENT_TYPE, file.getContentType() == null ? "video/mp4" : file.getContentType())
                    .body(decodedBytes);


        } catch (Exception e) {
            logger.error("Error during decoding: {}", e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();


    }
}

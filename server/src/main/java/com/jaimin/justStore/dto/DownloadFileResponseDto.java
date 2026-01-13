package com.jaimin.justStore.dto;

import com.jaimin.justStore.model.File;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

public record DownloadFileResponseDto(
        Long videoId,
        String originalFileName,
        Long originalFileSizeInByte,
        String originalFileType,
        String youtubeVideoUrl,
        StreamingResponseBody streamingResponseBody
) {
    public static DownloadFileResponseDto from(File file, StreamingResponseBody  streamingResponseBody) {
        return new DownloadFileResponseDto(
                file.getId(),
                file.getOriginalFileName(),
                file.getOriginalFileSizeInByte(),
                file.getOriginalFileType(),
                file.getYoutubeVideoUrl(),
                streamingResponseBody
        );
    }
}

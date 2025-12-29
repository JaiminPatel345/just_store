package com.jaimin.justStore.dto;

import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

public record UploadFileRequestDto(
        MultipartFile file,
        String secretKey, // Optional - nullable by default
        Set<String> tags

) {
}

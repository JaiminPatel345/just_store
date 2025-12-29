package com.jaimin.justStore.controller;

import com.jaimin.justStore.dto.UploadFileRequestDto;
import com.jaimin.justStore.service.FileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

@RestController
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @GetMapping
    public String isWorking() {
        return "Yes, I am working";
    }


    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @ModelAttribute UploadFileRequestDto uploadRequest
    ) {

        try {
            return fileService.uploadFile(uploadRequest);
        } catch (IOException ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getLocalizedMessage()));
        }
    }

}

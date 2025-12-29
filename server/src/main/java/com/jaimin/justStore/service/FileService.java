package com.jaimin.justStore.service;

import com.jaimin.justStore.dto.UploadFileRequestDto;
import com.jaimin.justStore.model.File;
import com.jaimin.justStore.repository.FileRepository;
import com.jaimin.justStore.utils.ChecksumUtil;
import com.jaimin.justStore.utils.HashUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class FileService {
    private final FileRepository fileRepository;

    public FileService(FileRepository fileRepository){
        this.fileRepository = fileRepository;
    }

    public ResponseEntity<?> uploadFile(UploadFileRequestDto uploadRequest) throws IOException {
        if(uploadRequest.file().isEmpty()){
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File bhejna sale ! (Please add file)"
            );
        }

        String originalFileName = uploadRequest.file().getName();
        Long originalFileSizeInByte = uploadRequest.file().getSize();
        String originalFileType = uploadRequest.file().getContentType();

        File newFile = new File(originalFileName, originalFileSizeInByte, originalFileType, uploadRequest.tags());

        if(uploadRequest.secretKey() != null){
            String secretKeyHash = HashUtil.hash(uploadRequest.secretKey());
            newFile.setSecretKeyHash(secretKeyHash);
        }

        byte[] fileBytes = uploadRequest.file().getBytes();

        String fileChecksum = ChecksumUtil.calculateChecksum(fileBytes);
        newFile.setFileChecksum(fileChecksum);

        fileRepository.save(newFile);

        //just checking
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();

    }
}

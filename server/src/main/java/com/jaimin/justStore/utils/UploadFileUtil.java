package com.jaimin.justStore.utils;

import com.jaimin.justStore.dto.UploadFileRequestDto;
import com.jaimin.justStore.model.File;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;


public class UploadFileUtil {
    public static File getNewFile(UploadFileRequestDto uploadRequest){
        if (uploadRequest.file().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File bhejna sale ! (Please add file)"
            );
        }

        String originalFileName = uploadRequest.file().getOriginalFilename();
        Long originalFileSizeInByte = uploadRequest.file().getSize();
        String originalFileType = uploadRequest.file().getContentType();

        //Check if file is too small
        if(originalFileSizeInByte < 10*1024*1024){
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File is too small, YouTube will discard."
            );
        }

        return new File(originalFileName, originalFileSizeInByte, originalFileType, uploadRequest.tags());
    }

}

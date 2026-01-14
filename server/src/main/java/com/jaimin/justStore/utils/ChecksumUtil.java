package com.jaimin.justStore.utils;

import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;


public class ChecksumUtil {

    public static String calculateChecksum(InputStream data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[1024 * 1024]; //1MB
            int byteRead;

            while((byteRead = data.read(buffer)) != -1){
                digest.update(buffer, 0, byteRead);
            }

            byte[] hash = digest.digest();
            return Base64.getEncoder().encodeToString(hash);

        } catch (NoSuchAlgorithmException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "NoSuchAlgorithmException Exception while calculating checksum " + e.getMessage()
            );
        } catch(IOException e){
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "IO Exception while calculating checksum " + e.getMessage()
            );
        }

    }

    public static String calculateChecksum(MultipartFile file) throws IOException {
        try(InputStream is = file.getInputStream()){
            return calculateChecksum(is);
        }
    }


}
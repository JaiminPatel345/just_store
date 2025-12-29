package com.jaimin.justStore.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import static com.jaimin.justStore.utils.BytesToHex.bytesToHex;

public class ChecksumUtil {

    public static String calculateChecksum(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    public static String calculateChecksum(MultipartFile file) throws IOException {
        return calculateChecksum(file.getBytes());
    }


}
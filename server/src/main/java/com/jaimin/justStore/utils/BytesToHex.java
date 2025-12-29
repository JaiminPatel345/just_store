package com.jaimin.justStore.utils;

public class BytesToHex {
    public static String bytesToHex(byte[] str) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : str) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}

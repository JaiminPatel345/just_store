package com.jaimin.justStore.utils;

import org.bytedeco.javacv.*;
import org.bytedeco.opencv.opencv_core.*;

import java.io.*;
import java.util.Arrays;

public class RetrieveVideo {

    public static ByteArrayOutputStream decodeVideo(InputStream inputStream, Long totalBytes) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        Long[] remainingBytes = new Long[]{totalBytes};

        FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(inputStream);
        grabber.start();

        try (BufferedOutputStream bos = new BufferedOutputStream(baos)) {
            Frame frame;

            while ((frame = grabber.grabImage()) != null) {
                frameToByteArray(frame, bos, remainingBytes);
                if (remainingBytes[0] <= 0) break;
            }
            bos.flush();
        } finally {
            grabber.stop();
            grabber.release();
        }

        return baos;
    }

    // TODO: make it so it get other details
    static int getMetadataFromFrame(Frame frame) {
        Mat mat = new OpenCVFrameConverter.ToMat().convert(frame);

        int totalBytes = 0;
        for (int k = 0; k < 32; k++) {
            int[] rgb = getPixelRGB(mat, k, 0);
            int red = rgb[0];
            int green = rgb[1];
            int blue = rgb[2];

            boolean isWhite = (red > 128) && (green > 128) && (blue > 128);
            if (isWhite) {
                totalBytes |= (1 << k);
            }
        }
        System.out.println("Total length : " + totalBytes);
        return totalBytes;
    }

    static void frameToByteArray(Frame frame, BufferedOutputStream bos, Long[] remainingBytes) throws IOException {
        Mat mat = new OpenCVFrameConverter.ToMat().convert(frame);

        final int height = 1072;
        final int width = 1920;
        byte[] bytes = new byte[width / 8]; //Row Bytes

        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j += 8) {
                byte myByte = 0;
                for (int k = 0; k < 8; k++) {
                    int[] rgb = getPixelRGB(mat, j + k, i);
                    int red = rgb[0];
                    int green = rgb[1];
                    int blue = rgb[2];

                    boolean isWhite = (red > 128) && (green > 128) && (blue > 128);
                    if (isWhite) {
                        myByte |= (byte) (1 << (7 - k));
                    }
                }

                bytes[j / 8] = myByte;
                remainingBytes[0]--;
                if (remainingBytes[0] == 0) {
                    //write only filed bytes.
                    bos.write(Arrays.copyOfRange(bytes, 0, j / 8 + 1)); //+1 because endIndex is exclusive
                    return;
                }
            }
            bos.write(bytes);
        }
    }

    private static int[] getPixelRGB(Mat mat, int x, int y) {
        byte[] data = new byte[3];
        mat.ptr(y, x).get(data);

        int blue = data[0] & 0xFF;
        int green = data[1] & 0xFF;
        int red = data[2] & 0xFF;

        return new int[] { red, green, blue };
    }
}
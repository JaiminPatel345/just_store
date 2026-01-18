package com.jaimin.justStore.utils;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import org.bytedeco.javacv.FFmpegFrameRecorder;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.Java2DFrameConverter;


public class CreateVideoUtil {


    public static void createVideo(InputStream data, int width, int height, int frameRate, String outputPath) throws IOException {


        final int bytesInOneFrame = width * height / 8;
        byte[] buffer = new byte[bytesInOneFrame];
        int byteRead;

        File video = new File(outputPath);

        // Use FFmpegFrameRecorder with lossless FFV1 codec
        FFmpegFrameRecorder recorder = new FFmpegFrameRecorder(outputPath, width, height);
        recorder.setVideoCodec(org.bytedeco.ffmpeg.global.avcodec.AV_CODEC_ID_FFV1);
        recorder.setFormat("avi"); // FFV1 works well with AVI container
        recorder.setFrameRate(frameRate);
        recorder.setPixelFormat(org.bytedeco.ffmpeg.global.avutil.AV_PIX_FMT_GRAY8); // Grayscale for binary data
        recorder.start();

        Java2DFrameConverter converter = new Java2DFrameConverter();

//        TODO: add filename, extension, and many other details
//        recorder.record(converter.convert(createMetadataFrame(fileContent.length, width, height)));

        try {
            while((byteRead = data.read(buffer)) != -1) {
                BufferedImage image = createFrame(buffer, width, height, byteRead);
                Frame frame = converter.convert(image);
                recorder.record(frame);
            }
        } finally {
            recorder.stop();
            recorder.release();
        }

    }

    public static BufferedImage createFrame(byte[] fileContent, int width, int height, int byteRead) {
        int byteIndex = 0;
        // Use TYPE_BYTE_GRAY for better compatibility with FFV1 codec
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_GRAY);
        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j += 8) {
                for (int bitPosition = 0; bitPosition < 8; bitPosition++) {
                    int bitValue = (fileContent[byteIndex] >> (7 - bitPosition)) & 1;
                    // Use pure black (0) and pure white (255) values
                    int rgb = bitValue == 1 ? 0xFFFFFF : 0x000000;
                    image.setRGB(j + bitPosition, i, rgb);
                }
                byteIndex++;
                if (byteIndex == byteRead) {
                    return image;
                }
            }
        }

        return image;
    }

    //TODO: make it to store all metadata
    public static BufferedImage createMetadataFrame(int totalBytes, int width, int height) {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_GRAY);

        for (int bitPosition = 0; bitPosition < 32; bitPosition++) {
            int bitValue = (totalBytes >> (bitPosition)) & 1;
            int rgb = bitValue == 1 ? 0xFFFFFF : 0x000000;
            image.setRGB(bitPosition, 0, rgb);
        }

        return image;
    }

}

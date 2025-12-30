package com.jaimin.justStore.utils;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import org.jcodec.api.awt.AWTSequenceEncoder;


public class CreateVideoUtil {


    public static void createVideo(byte[] fileContent, int width, int height, int frameRate, String outputPath) throws IOException {


        final int bytesInOneFrame = width * height / 8;
        final int totalFrames = (int) Math.ceil((double) fileContent.length / bytesInOneFrame);
        int byteIndex = 0;

        File video = new File(outputPath);
        AWTSequenceEncoder encoder = AWTSequenceEncoder.createSequenceEncoder(video, frameRate);
        encoder.encodeImage(createMetadataFrame(fileContent.length, width, height));

        for (int i = 0; i < totalFrames; i++) {
            BufferedImage image = createFrame(fileContent, byteIndex, width, height);
            byteIndex += bytesInOneFrame;
            encoder.encodeImage(image);
        }

        encoder.finish();

    }

    public static BufferedImage createMetadataFrame(int totalBytes, int width, int height) {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_BINARY);

        for (int bitPosition = 0; bitPosition < 32; bitPosition++) {
            int bitValue = (totalBytes >> (bitPosition)) & 1;
            int rgb = bitValue == 1 ? 0xFFFFFF : 0x000000;
            image.setRGB(bitPosition, 0, rgb);
        }

        return image;
    }

    public static BufferedImage createFrame(byte[] fileContent, int byteIndex, int width, int height) {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_BINARY);
        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j += 8) {
                for (int bitPosition = 0; bitPosition < 8; bitPosition++) {
                    int bitValue = (fileContent[byteIndex] >> (7 - bitPosition)) & 1;
                    int rgb = bitValue == 1 ? 0xFFFFFF : 0x000000;
                    image.setRGB(j + bitPosition, i, rgb);
                }
                byteIndex++;
                if (byteIndex == fileContent.length) {
                    return image;
                }
            }
        }

        return image;
    }

}

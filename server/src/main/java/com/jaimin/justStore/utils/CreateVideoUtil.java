package com.jaimin.justStore.utils;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import org.jcodec.api.awt.AWTSequenceEncoder;


public class CreateVideoUtil {


    public static void createVideo(InputStream data, int width, int height, int frameRate, String outputPath) throws IOException {


        final int bytesInOneFrame = width * height / 8;
        byte[] buffer = new byte[bytesInOneFrame];
        int byteRead;

        File video = new File(outputPath);
        AWTSequenceEncoder encoder = AWTSequenceEncoder.createSequenceEncoder(video, frameRate);

//        TODO: add filename, extension, and many other details
//        encoder.encodeImage(createMetadataFrame(fileContent.length, width, height));

        while((byteRead = data.read(buffer)) != -1) {
            BufferedImage image = createFrame(buffer, width, height, byteRead);
            encoder.encodeImage(image);
        }

        encoder.finish();

    }

    public static BufferedImage createFrame(byte[] fileContent, int width, int height, int byteRead) {
        int byteIndex = 0;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_BINARY);
        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j += 8) {
                for (int bitPosition = 0; bitPosition < 8; bitPosition++) {
                    int bitValue = (fileContent[byteIndex] >> (7 - bitPosition)) & 1;
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
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_BINARY);

        for (int bitPosition = 0; bitPosition < 32; bitPosition++) {
            int bitValue = (totalBytes >> (bitPosition)) & 1;
            int rgb = bitValue == 1 ? 0xFFFFFF : 0x000000;
            image.setRGB(bitPosition, 0, rgb);
        }

        return image;
    }

}

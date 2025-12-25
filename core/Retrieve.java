import org.jcodec.api.FrameGrab;
import org.jcodec.api.JCodecException;
import org.jcodec.common.io.NIOUtils;
import org.jcodec.common.model.Picture;
import org.jcodec.scale.AWTUtil;

import java.awt.image.BufferedImage;
import java.io.*;
import java.util.Arrays;

public class Retrieve {

    static void getFreams(String inputVideoPath, String outputFilePath) throws IOException, JCodecException, FileNotFoundException {
        File file = new File(inputVideoPath);
        FrameGrab grab = FrameGrab.createFrameGrab(NIOUtils.readableChannel(file));

        FileOutputStream fos = new FileOutputStream(outputFilePath, false);
        BufferedOutputStream bos = new BufferedOutputStream(fos);

        Picture picture;
        while (null != (picture = grab.getNativeFrame())) {
            System.out.println(picture.getWidth() + "x" + picture.getHeight());

            freamToByteArray(picture, bos);

        }
        bos.flush();

    }

    static void freamToByteArray(Picture picture, BufferedOutputStream bos) throws IOException {
        BufferedImage frame = AWTUtil.toBufferedImage(picture);
        final int height = frame.getHeight();
        final int width = frame.getWidth();
        byte[] bytes = new byte[width / 8];
        boolean isAllByteNull = true;

        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j += 8) {
                byte myByte = 0;
                for (int k = 0; k < 8; k++) {
                    int rgb = frame.getRGB(j + k, i);
                    boolean isWhite = (rgb & 0xFFFFFF) == 0xFFFFFF;
                    if (isWhite) {
                        isAllByteNull = false;
                        myByte |= (byte) (1 << ( k));
                    }
                }
                //EOF
                if(myByte == 0) {
                    bos.write(Arrays.copyOfRange(bytes, 0, j/8 ));
                    return;
                };

                bytes[j / 8] = myByte;
            }
            if(isAllByteNull) return;
            System.out.println(Arrays.toString(bytes));
            bos.write(bytes);
            isAllByteNull = true;

        }
    }

    static void main() {
        try {
            final String inputVideoPath = "outputs/abc.mp4";
            System.out.println("===== Start Retrieving ====");
            final String outputFilePath = "outputs/abc.txt";
            final String secretKey = "abc123";
            final int freamRate = 24;
            final int width = 1920;
            final int height = 1080;

            getFreams(inputVideoPath, outputFilePath);


        } catch (Exception e) {
            System.out.println("Error : " + e);
        }
    }
}

import java.awt.image.BufferedImage;
import org.jcodec.api.awt.AWTSequenceEncoder;


public static byte[] getBytesArrayFromFile(String filePath){
    try{
        Path path = Paths.get(filePath);
        return Files.readAllBytes(path);

    } catch(Exception e){
        System.out.println("Error : " + e);
        return new byte[0];
    }
}

public static byte[] fileEncryption(byte[] fileContent, String secretKey){
    if(fileContent.length == 0){
        System.err.println("File content is empty");
    }

    return fileContent;
}


public static void createVideo(byte[] fileContent, int width, int height, String outputPath, int freamRate) throws IOException{


    final int bytesInOneFream = width * height / 8;
    final int totalFreams = (int)Math.ceil((double)fileContent.length / bytesInOneFream);
    int byteIndex = 0;

    File video = new File(outputPath);
    AWTSequenceEncoder encoder = AWTSequenceEncoder.createSequenceEncoder(video, freamRate);

    for(int i = 0; i < totalFreams; i++){
        BufferedImage image = createFream(fileContent, byteIndex, width, height);
        byteIndex += bytesInOneFream;
        encoder.encodeImage(image);
    }

    encoder.finish();

}

public static BufferedImage createFream(byte[] fileContent, int byteIndex, int width, int height){
    BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_BINARY);
    for (int i = 0; i < height  ; i++){
        for (int j = 0; j < width; j += 8){
            for (int bitPosition = 0; bitPosition < 8; bitPosition++){
                int bitValue = (fileContent[byteIndex] >> bitPosition);
                int rgb = bitValue == 1 ? 0xFFFFFF : 0x000000;
                image.setRGB(j + bitPosition, i, rgb);
            }
            byteIndex++;
            if(byteIndex == fileContent.length){
                return image;
            }
        }
    }

    return image;
}



void main() {
    try{
        System.out.println("===== Start Main ====");
//        final String filePath = "/home/jaimin/My/Dev/learn/system-design-primer-master.zip";
        final String filePath = "test_data/resume.pdf";

        final String outputPath = "outputs/abc.mp4";
        final String secretKey = "abc123";
        final int freamRate = 24;
        final int width = 1920;
        final int height = 1072;


        createVideo(fileEncryption(getBytesArrayFromFile(filePath), secretKey), width, height, outputPath, freamRate);

    }catch (Exception e){
        System.out.println("Error : " + e);
    }

}
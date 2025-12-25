import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;


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


public static void createVideo(byte[] fileContent, int width, int height, String outputPath) throws IOException{


    final int bytesInOneFream = width * height / 8;
    final int totalFreams = fileContent.length / bytesInOneFream;

    BufferedImage image = createFream(fileContent, 0, width, height);

    //save image
    ImageIO.write(image, "PNG", new File(outputPath));



}

public static BufferedImage createFream(byte[] fileContent, int byteIndex, int width, int height){
    BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_BINARY);
    for (int i = 0; i < height; i++){
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
        final String filePath = "test_data/resume.pdf";
        final String secretKey = "abc123";
        createVideo(fileEncryption(getBytesArrayFromFile(filePath), secretKey), 1920, 1080, "outputs/abc.png");

    }catch (Exception e){
        System.out.println("Error : " + e);

    }

}
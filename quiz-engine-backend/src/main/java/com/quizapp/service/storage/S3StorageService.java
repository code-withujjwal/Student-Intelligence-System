package com.quizapp.service.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@Service
@Profile("prod")
public class S3StorageService implements StorageService {

    private static final Logger logger = LoggerFactory.getLogger(S3StorageService.class);

    // MOCK IMPLEMENTATION FOR ENTERPRISE SAAS SHOWCASE
    // In reality, this would inject AmazonS3 client and call s3Client.putObject()

    @Override
    public String uploadFile(MultipartFile file, String path) {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String s3Url = "https://s3.amazonaws.com/quiz-engine-prod-bucket/" + path + "/" + filename;
        
        logger.info("[SAAS-S3-STUB] Uploading {} to AWS S3 bucket: quiz-engine-prod-bucket", file.getOriginalFilename());
        
        return s3Url;
    }

    @Override
    public String getFileUrl(String filename) {
        return "https://s3.amazonaws.com/quiz-engine-prod-bucket/" + filename;
    }
}

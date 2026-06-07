package com.quizapp.service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String uploadFile(MultipartFile file, String path);
    String getFileUrl(String filename);
}

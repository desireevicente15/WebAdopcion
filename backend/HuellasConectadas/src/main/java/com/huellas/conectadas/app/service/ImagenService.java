package com.huellas.conectadas.app.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class ImagenService {
    private final Cloudinary cloudinary;

    public ImagenService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String upload(MultipartFile file) {
        try {
            Map<?,?> resp = cloudinary.uploader()
                    .upload(file.getBytes(), ObjectUtils.emptyMap());
            return (String)resp.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Error subiendo a Cloudinary", e);
        }
    }
}

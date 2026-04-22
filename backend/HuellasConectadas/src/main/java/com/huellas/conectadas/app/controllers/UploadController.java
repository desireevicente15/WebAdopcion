package com.huellas.conectadas.app.controllers;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:4200")
public class UploadController {

    @Autowired
    private Cloudinary cloudinary;

    @PostMapping("/animal")
    public ResponseEntity<Map<String, String>> uploadAnimalImage(
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        Map<?,?> uploadResult = cloudinary.uploader()
                .upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder",        "huellas/animales",
                                "quality",       "auto",
                                "fetch_format",  "auto"
                        )
                );

        String url = uploadResult.get("secure_url").toString();
        String publicId = uploadResult.get("public_id").toString();
        return ResponseEntity.ok(Map.of(
                "url",       url,
                "public_id", publicId));
    }
}

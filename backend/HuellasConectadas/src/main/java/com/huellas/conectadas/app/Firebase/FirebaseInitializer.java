package com.huellas.conectadas.app.Firebase;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

@Component
public class FirebaseInitializer {
    @Value("${firebase.project-id:}")
    private String projectId;

    @Value("${firebase.service-account.path:}")
    private String serviceAccountPath;

    @Value("${firebase.service-account.base64:}")
    private String serviceAccountBase64;

    @PostConstruct
    public void initializeFirebase() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        try (InputStream serviceAccount = openServiceAccount()) {
            if (serviceAccount == null) {
                System.out.println("Firebase Admin no se ha inicializado: no hay credenciales configuradas.");
                return;
            }

            FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount));

            if (hasText(projectId)) {
                optionsBuilder.setProjectId(projectId);
            }

            FirebaseApp.initializeApp(optionsBuilder.build());
            FirebaseApp app = FirebaseApp.getInstance();
            System.out.println("Firebase inicializado correctamente: " + app.getOptions().getProjectId());
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo inicializar Firebase Admin", e);
        }
    }

    private InputStream openServiceAccount() throws IOException {
        if (hasText(serviceAccountBase64)) {
            byte[] decoded = Base64.getDecoder().decode(serviceAccountBase64);
            return new ByteArrayInputStream(decoded);
        }

        if (hasText(serviceAccountPath)) {
            return Files.newInputStream(Path.of(serviceAccountPath));
        }

        return getClass().getResourceAsStream("/serviceAccountKey.json");
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}

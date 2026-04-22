package com.huellas.conectadas.app.controllers;

import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/protectoras")
@CrossOrigin(origins = "http://localhost:4200")
public class ProtectoraController {

    @GetMapping("/{id}")
    public ResponseEntity<Map<String,Object>> getProtectora(@PathVariable String id) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        var docRef = db.collection("protectoras").document(id);
        var snap = docRef.get().get();

        System.out.println("Buscando protectora con ID=" + id + " — existe? " + snap.exists());
        if (!snap.exists()) {
            return ResponseEntity.notFound().build();
        }

        Map<String,Object> protectora = snap.getData();
        var animalesIter = db.collection("protectoras")
                .document(id)
                .collection("animales")
                .listDocuments();

        List<Map<String,Object>> animales = StreamSupport.stream(animalesIter.spliterator(), false)
                .map(docRefAnimal -> {
                    try {
                        var animalSnap = docRefAnimal.get().get();
                        Map<String,Object> data = new HashMap<>(animalSnap.getData());

                        if (!data.containsKey("especie") && data.containsKey("tipo")) {
                            data.put("especie", data.get("tipo"));
                        }
                        data.put("id", animalSnap.getId());
                        return data;
                    } catch (Exception e) {
                        e.printStackTrace();
                        return Map.<String,Object>of();
                    }
                })
                .collect(Collectors.toList());

        protectora.put("animales", animales);
        return ResponseEntity.ok(protectora);
    }

    @PostMapping("/{id}/animales")
    public ResponseEntity<Void> addAnimalAProtectora(
            @PathVariable String id,
            @RequestBody Map<String,Object> animal) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        String animalId = (String) animal.getOrDefault(
                "id",
                db.collection("protectoras").document().getId()
        );

        db.collection("protectoras")
                .document(id)
                .collection("animales")
                .document(animalId)
                .set(animal)
                .get();

        Map<String,Object> global = new HashMap<>(animal);
        global.put("id",           animalId);
        global.put("protectoraId", id);
        global.put("estado",       "disponible");
        db.collection("animales")
                .document(animalId)
                .set(global)
                .get();

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/animales/{animalId}")
    public ResponseEntity<Void> updateAnimal(
            @PathVariable String id,
            @PathVariable String animalId,
            @RequestBody Map<String,Object> animalUpdates) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        // Subcolección
        db.collection("protectoras")
                .document(id)
                .collection("animales")
                .document(animalId)
                .set(animalUpdates, SetOptions.merge())
                .get();

        // Colección global
        Map<String,Object> globalUpdates = new HashMap<>(animalUpdates);
        globalUpdates.put("id",           animalId);
        globalUpdates.put("protectoraId", id);

        db.collection("animales")
                .document(animalId)
                .set(globalUpdates, SetOptions.merge())
                .get();

        return ResponseEntity.ok().build();
    }

    /**
     * Elimina un animal de la protectora y de la colección global
     */
    @DeleteMapping("/{id}/animales/{animalId}")
    public ResponseEntity<Void> deleteAnimal(
            @PathVariable String id,
            @PathVariable String animalId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        // 1) Eliminar en la subcolección de la protectora
        db.collection("protectoras")
                .document(id)
                .collection("animales")
                .document(animalId)
                .delete()
                .get();

        // 2) Eliminar en la colección global
        db.collection("animales")
                .document(animalId)
                .delete()
                .get();

        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<String>> listarIds() throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        Iterable<DocumentReference> docs = db.collection("protectoras").listDocuments();

        List<String> ids = StreamSupport.stream(docs.spliterator(), false)
                .map(DocumentReference::getId)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ids);
    }

    /**
     * Crea una nueva protectora con ID secuencial (id_protectora_002, 003, …)
     */
    @PostMapping
    public ResponseEntity<Void> crearProtectora(@RequestBody Map<String,Object> nuevaProtectora) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference counterRef = db.collection("counters").document("protectoras");

        // Ejecutamos todo dentro de una transacción atómica
        db.runTransaction(tx -> {
            // 1) Leemos el contador actual
            var snap = tx.get(counterRef).get();
            long last = snap.contains("last") ? snap.getLong("last") : 0;

            // 2) Incrementamos
            long next = last + 1;
            tx.update(counterRef, "last", next);

            // 3) Formateamos el nuevo ID
            String id = String.format("id_protectora_%03d", next);

            // 4) Creamos la protectora con ese ID
            tx.set(db.collection("protectoras").document(id), nuevaProtectora);

            return null;
        }).get();  // .get() bloquea hasta que la transacción termina

        return ResponseEntity.ok().build();
    }

    @GetMapping("/exists/nombre")
    public ResponseEntity<Map<String, Boolean>> existsByNombre(@RequestParam String nombre) throws InterruptedException, ExecutionException {
        Firestore db = FirestoreClient.getFirestore();
        // Buscamos en la colección “protectoras” documentos donde el campo "nombre" sea igual al que nos pasan
        Query query = db.collection("protectoras").whereEqualTo("nombre", nombre);
        ApiFuture<QuerySnapshot> querySnapshot = query.get();
        boolean exists = !querySnapshot.get().isEmpty();
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

    /**
     * Comprueba si existe alguna protectora con el CIF exacto proporcionado.
     * GET /api/protectoras/exists/cif?cif=ValorCIF
     */
    @GetMapping("/exists/cif")
    public ResponseEntity<Map<String, Boolean>> existsByCif(@RequestParam String cif) throws InterruptedException, ExecutionException {
        Firestore db = FirestoreClient.getFirestore();
        Query query = db.collection("protectoras").whereEqualTo("cif", cif);
        ApiFuture<QuerySnapshot> querySnapshot = query.get();
        boolean exists = !querySnapshot.get().isEmpty();
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }

    /**
     * Elimina una protectora y sus subcolecciones (animales, etc.)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProtectora(@PathVariable String id) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference protectoraRef = db.collection("protectoras").document(id);

        // 1) Comprobamos que exista la protectora
        var snap = protectoraRef.get().get();
        if (!snap.exists()) {
            return ResponseEntity.notFound().build();
        }

        // 2) **Eliminar todos los animales de la subcolección "animales"**
        //    (Cada documento en protectorAs/{id}/animales)
        Iterable<DocumentReference> animalesDocs = protectoraRef
                .collection("animales")
                .listDocuments();

        for (DocumentReference animalDocRef : animalesDocs) {
            // Eliminamos en la subcolección de la protectora
            animalDocRef.delete().get();

            // opcional: si tienes colección global "animales", borra también allí
            // por ejemplo: db.collection("animales").document(animalDocRef.getId()).delete().get();
        }

        // 3) Eliminar el documento principal de la protectora
        protectoraRef.delete().get();

        return ResponseEntity.ok().build();
    }

    @GetMapping("/by-email")
    public ResponseEntity<Map<String,Object>> getProtectoraByEmail(@RequestParam String email) throws InterruptedException, ExecutionException {
        Firestore db = FirestoreClient.getFirestore();

        // Hacemos un query por whereEqualTo("email", email)
        Query query = db.collection("protectoras").whereEqualTo("email", email);
        ApiFuture<QuerySnapshot> future = query.get();
        QuerySnapshot snapshot = future.get();

        if (snapshot.isEmpty()) {
            // No existe ninguna protectora con ese email
            return ResponseEntity.notFound().build();
        }

        // Tomamos el primer documento encontrado
        var doc = snapshot.getDocuments().get(0);
        String idProtectora = doc.getId();
        Map<String,Object> data = doc.getData();
        // Opcionalmente puedes decidir no enviar todo el data,
        // pero aquí lo devolvemos completo
        data.put("id", idProtectora);

        return ResponseEntity.ok(Collections.unmodifiableMap(data));
    }


}

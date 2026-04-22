package com.huellas.conectadas.app.controllers;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/animales")
@CrossOrigin(origins = "*")
public class AnimalController {
    @GetMapping("/filtrar")
    public ResponseEntity<List<Map<String,Object>>> filtrarBasicoAnimales(
            @RequestParam(required = false) String especie,
            @RequestParam(required = false) String sexo,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String edad,
            @RequestParam(required = false) String tamano,
            @RequestParam(required = false) String comunidadAutonoma,
            @RequestParam(required = false) String provincia,
            @RequestParam(required = false) String estiloVida,
            @RequestParam(required = false) String niniosYadultos,
            @RequestParam(required = false) String otrasMascotas) throws Exception {

        Firestore db = FirestoreClient.getFirestore();

        Query query = db.collectionGroup("animales");

        if (especie != null)       query = query.whereEqualTo("especie", especie);
        if (sexo != null)          query = query.whereEqualTo("sexo", sexo);
        if (nombre != null)        query = query.whereEqualTo("nombre", nombre);
        if (tamano != null)        query = query.whereEqualTo("tamano", tamano);
        if (comunidadAutonoma != null) query = query.whereEqualTo("comunidadAutonoma", comunidadAutonoma);
        if (provincia != null)     query = query.whereEqualTo("provincia", provincia);
        if (estiloVida != null)    query = query.whereEqualTo("estiloVida", estiloVida);
        if (niniosYadultos != null)  query = query.whereEqualTo("conNiniosYoMayores", Boolean.parseBoolean(niniosYadultos));
        if (otrasMascotas != null)   query = query.whereEqualTo("conOtrasMascotas", Boolean.parseBoolean(otrasMascotas));

        if (edad != null && !edad.isEmpty()) {
            LocalDate hoy = LocalDate.now(ZoneId.of("UTC"));
            LocalDate haceUnAno = hoy.minusYears(1);
            Instant instant = haceUnAno.atStartOfDay(ZoneId.of("UTC")).toInstant();
            Date fechaCorte = Date.from(instant);

            if ("Menos de 1 año".equals(edad)) {
                query = query.whereGreaterThan("fechaNacimiento", fechaCorte);
            } else if ("Más de 1 año".equals(edad)) {
                query = query.whereLessThanOrEqualTo("fechaNacimiento", fechaCorte);
            }
            query = query.orderBy("fechaNacimiento");
        }

        ApiFuture<QuerySnapshot> future = query.get();
        List<Map<String,Object>> animales = future.get().getDocuments().stream()
                .filter(docSnap -> {
                    CollectionReference col = docSnap.getReference().getParent();
                    return col.getParent() != null;
                })
                .map(docSnap -> {
                    Map<String,Object> data = new HashMap<>(docSnap.getData());
                    data.put("id", docSnap.getId());

                    DocumentReference protRef = docSnap.getReference()
                            .getParent()
                            .getParent();
                    data.put("protectoraId", protRef.getId());
                    return data;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(animales);
    }

    }


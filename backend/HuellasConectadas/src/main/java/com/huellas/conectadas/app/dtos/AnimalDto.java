package com.huellas.conectadas.app.dtos;

import com.huellas.conectadas.app.models.AnimalModel;
import com.huellas.conectadas.app.models.AnimalModel;

import java.time.ZoneId;
import java.util.*;

public class AnimalDto {
    private String id;
    private String tipo;
    private String nombre;
    private String comunidadAutonoma;
    private String provincia;
    private String sexo;
    private String tamano;
    private Date fechaNacimiento;
    private String estiloVida;
    private boolean conOtrasMascotas;
    private boolean conNiniosYoMayores;

    // getters y setters...

    /** Convierte este DTO en tu entidad Animal */
    public AnimalModel toEntity() {
        AnimalModel a = new AnimalModel();
        a.setId(id);
        a.setTipo(tipo);
        a.setNombre(nombre);
        a.setComunidadAutonoma(comunidadAutonoma);
        a.setProvincia(provincia);
        a.setSexo(sexo);
        a.setTamano(tamano);
        a.setFechaNacimiento(fechaNacimiento.toInstant()
                .atZone(ZoneId.systemDefault()).toLocalDate());
        a.setEstiloVida(estiloVida);
        a.setConOtrasMascotas(conOtrasMascotas);
        a.setConNiniosYoMayores(conNiniosYoMayores);
        return a;
    }

    /** Para guardar en Firestore como Map */
    public Map<String,Object> toMap() {
        Map<String,Object> m = new HashMap<>();
        if (id != null) m.put("id", id);
        m.put("tipo", tipo);
        m.put("nombre", nombre);
        m.put("comunidadAutonoma", comunidadAutonoma);
        m.put("provincia", provincia);
        m.put("sexo", sexo);
        m.put("tamano", tamano);
        m.put("fechaNacimiento", fechaNacimiento);
        m.put("estiloVida", estiloVida);
        m.put("conOtrasMascotas", conOtrasMascotas);
        m.put("conNiniosYoMayores", conNiniosYoMayores);
        return m;
    }

    /** Genera las etiquetas según tu lógica */
    public List<String> buildTags() {
        List<String> tags = new ArrayList<>();
        tags.add(tipo);
        tags.add(estiloVida);
        if (conOtrasMascotas)     tags.add("con_otros_" + tipo + "s");
        if (conNiniosYoMayores)   tags.add("con_niños");
        return tags;
    }
}

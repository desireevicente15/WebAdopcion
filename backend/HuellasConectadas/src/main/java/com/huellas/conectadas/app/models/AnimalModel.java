package com.huellas.conectadas.app.models;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public class AnimalModel {
    private String id;
    private String tipo;
    private String nombre;
    private String comunidadAutonoma;
    private String provincia;
    private String sexo;
    private String tamano;
    private LocalDate fechaNacimiento;
    private String estiloVida;
    private boolean conOtrasMascotas;
    private boolean conNiniosYoMayores;
    private String fotoUrl;
    private Date fechaRegistro;
    private String estado;
    private List<String> etiquetas;

    public AnimalModel() {
    }

    public List<String> getEtiquetas() {
        return etiquetas;
    }

    public void setEtiquetas(List<String> etiquetas) {
        this.etiquetas = etiquetas;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getComunidadAutonoma() {
        return comunidadAutonoma;
    }

    public void setComunidadAutonoma(String comunidadAutonoma) {
        this.comunidadAutonoma = comunidadAutonoma;
    }

    public String getProvincia() {
        return provincia;
    }

    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    public String getTamano() {
        return tamano;
    }

    public void setTamano(String tamano) {
        this.tamano = tamano;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public String getEstiloVida() {
        return estiloVida;
    }

    public void setEstiloVida(String estiloVida) {
        this.estiloVida = estiloVida;
    }

    public boolean isConOtrasMascotas() {
        return conOtrasMascotas;
    }

    public void setConOtrasMascotas(boolean conOtrasMascotas) {
        this.conOtrasMascotas = conOtrasMascotas;
    }

    public boolean isConNiniosYoMayores() {
        return conNiniosYoMayores;
    }

    public void setConNiniosYoMayores(boolean conNiniosYoMayores) {
        this.conNiniosYoMayores = conNiniosYoMayores;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public Date getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(Date fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}

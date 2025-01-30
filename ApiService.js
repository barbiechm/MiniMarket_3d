export class ApiService {
    constructor() {
        this.baseUrl = "https://tu-api.com"; // Cambiar por tu endpoint real
    }

    async obtenerArticulos(cedula, categoria) {
        try {
            const response = await fetch(`${this.baseUrl}/articulos?cedula=${cedula}&categoria=${categoria}`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching articles:", error);
            return null;
        }
    }

    // Agregar más métodos relacionados con API aquí
}
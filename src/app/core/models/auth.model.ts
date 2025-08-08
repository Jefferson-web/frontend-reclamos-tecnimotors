export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    expiration: Date;
    usuarioId: number;
    nombre: string;
    rol: string;
    email: string;
}
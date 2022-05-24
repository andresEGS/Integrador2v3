import { Persona } from "./persona";

export class Pedido {
    id?: string;
    cliente= {} as Persona;
    sexo: string;
    fecha: number;
    piezas = [];
    fecha_entrega: number;
    valor: number;
    saldo: number;
    abonos = [];
    usuario:{};
    usuario_update?:{};
    fecha_update?: number;
    estado: string;
    
    constructor() { }

}
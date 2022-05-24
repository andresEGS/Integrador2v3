import { Articulo } from "./articulo";
import { Usuario } from "./usuario";

export class DetalleCarrito {
    id?: string;
    articulo={} as Articulo;
    cantidad?:number;
    valor_uni?: number;
    valor_total?: number;
    descuento?: number;
    iva?: number;  
  }
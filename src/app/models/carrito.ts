import { DetalleCarrito } from "./detalle_carrito";
import { Usuario } from "./usuario";

export class Carrito {
    id?: string;
    fecha_create?:number;
    fecha_update?:number;
    fecha_entrega?: number;
    cliente= {} as Usuario;
    responsable= {} as Usuario; 
    articulos :DetalleCarrito[] = [];   
    valor: number;
    estado?:string;
    public static ACTIVO='ACTIVO';
    public static DESPACHO='DESPACHO';
    public static EMPAQUE='EMPAQUE';
    public static RECHAZO='RECHAZO';
    public static ENTREGA='REPARTO';
    public static FINALIZADO='FINALIZADO';  
    
  
  }
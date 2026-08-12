/**
 * El catálogo de alimentos de partida.
 *
 * Todo está **por 100 g** (o por 100 ml en los líquidos), que es como viene en las
 * etiquetas: así se puede comparar con el envase que uno tiene en la mano sin hacer
 * cuentas. Cuando el alimento se come en piezas —un huevo, una rebanada, un plátano— la
 * fila lleva además cuánto pesa una pieza, para poder apuntar «2 huevos» y que los
 * gramos los ponga la aplicación.
 *
 * Este catálogo es sólo el arranque. **Lo que se registra se queda**: cada alimento nuevo
 * —escrito a mano o sacado de una foto— se guarda como alimento propio y aparece en el
 * buscador la próxima vez, así que la lista se va pareciendo a lo que uno come de verdad
 * en vez de a una base de datos genérica.
 *
 * Los valores son de referencia y están redondeados; cuando el envase diga otra cosa,
 * manda el envase — para eso se puede editar cualquier alimento.
 */

export interface Alimento {
  id: string;
  nombre: string;
  categoria: Categoria;
  marca?: string;
  /** Por 100 g o 100 ml. */
  kcal: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  fibra?: number;
  /** Gramos de una ración o pieza habitual. */
  racion?: number;
  /** Cómo se llama esa ración: «1 huevo», «1 rebanada», «1 vaso». */
  racionNombre?: string;
  /** Se mide en mililitros, no en gramos. Sólo cambia la etiqueta que se muestra. */
  liquido?: boolean;
  /** Lo ha creado el usuario; no venía en el catálogo. */
  propio?: boolean;
  /** Salió de la estimación de una foto, así que es aproximado. */
  deFoto?: boolean;
  actualizadoEn?: string;
}

export type Categoria =
  | 'Carnes y aves'
  | 'Pescados y mariscos'
  | 'Huevos'
  | 'Lácteos'
  | 'Legumbres'
  | 'Cereales y pan'
  | 'Pasta y arroz'
  | 'Patatas y tubérculos'
  | 'Verduras'
  | 'Frutas'
  | 'Frutos secos y semillas'
  | 'Grasas y aceites'
  | 'Salsas y condimentos'
  | 'Bebidas'
  | 'Dulces y snacks'
  | 'Suplementos'
  | 'Platos';

interface Extra {
  racion?: number;
  racionNombre?: string;
  fibra?: number;
  liquido?: boolean;
}

/** `[nombre, kcal, proteínas, hidratos, grasas, extra?]` — todo por 100 g. */
type Fila = [string, number, number, number, number, Extra?];

const POR_CATEGORIA: Record<Categoria, Fila[]> = {
  'Carnes y aves': [
    ['Pechuga de pollo', 165, 31, 0, 3.6, { racion: 150, racionNombre: '1 filete' }],
    ['Muslo de pollo sin piel', 177, 24, 0, 8.2, { racion: 120, racionNombre: '1 muslo' }],
    ['Pollo asado con piel', 220, 27, 0, 12],
    ['Pechuga de pavo', 135, 30, 0, 1, { racion: 150, racionNombre: '1 filete' }],
    ['Fiambre de pavo', 110, 18, 2, 3, { racion: 30, racionNombre: '2 lonchas' }],
    ['Solomillo de cerdo', 143, 26, 0, 3.5, { racion: 150, racionNombre: '1 ración' }],
    ['Lomo de cerdo', 210, 27, 0, 11],
    ['Panceta de cerdo', 518, 9, 0, 53],
    ['Bacon', 541, 37, 1, 42, { racion: 25, racionNombre: '2 lonchas' }],
    ['Ternera magra', 158, 27, 0, 5, { racion: 150, racionNombre: '1 filete' }],
    ['Entrecot de ternera', 271, 25, 0, 19, { racion: 200, racionNombre: '1 pieza' }],
    ['Carne picada de ternera', 215, 20, 0, 15],
    ['Carne picada mixta', 240, 18, 1, 18],
    ['Hamburguesa de ternera', 250, 19, 2, 18, { racion: 125, racionNombre: '1 hamburguesa' }],
    ['Cordero', 258, 25, 0, 17],
    ['Conejo', 136, 21, 0, 5],
    ['Jamón serrano', 241, 31, 1, 12, { racion: 30, racionNombre: '2 lonchas' }],
    ['Jamón cocido', 108, 18, 1, 3, { racion: 30, racionNombre: '2 lonchas' }],
    ['Chorizo', 455, 24, 2, 38, { racion: 30, racionNombre: '4 rodajas' }],
    ['Salchichón', 425, 23, 1, 36],
    ['Salchichas frescas', 300, 14, 2, 26, { racion: 60, racionNombre: '1 salchicha' }],
    ['Hígado de ternera', 135, 20, 4, 4],
    ['Costillas de cerdo', 277, 20, 0, 21],
    ['Pechuga de pollo empanada', 260, 20, 14, 13, { racion: 150, racionNombre: '1 filete' }],
  ],

  'Pescados y mariscos': [
    ['Merluza', 86, 17, 0, 2, { racion: 150, racionNombre: '1 filete' }],
    ['Bacalao fresco', 82, 18, 0, 0.7, { racion: 150, racionNombre: '1 lomo' }],
    ['Lubina', 97, 18, 0, 2.5, { racion: 180, racionNombre: '1 pieza' }],
    ['Dorada', 100, 19, 0, 3, { racion: 180, racionNombre: '1 pieza' }],
    ['Salmón', 208, 20, 0, 13, { racion: 150, racionNombre: '1 lomo' }],
    ['Salmón ahumado', 180, 22, 0, 10, { racion: 50, racionNombre: '3 lonchas' }],
    ['Atún fresco', 144, 23, 0, 5, { racion: 150, racionNombre: '1 rodaja' }],
    ['Atún en conserva al natural', 116, 26, 0, 1, { racion: 56, racionNombre: '1 lata escurrida' }],
    ['Atún en conserva en aceite', 189, 25, 0, 10, { racion: 56, racionNombre: '1 lata escurrida' }],
    ['Sardinas en lata', 208, 25, 0, 11, { racion: 60, racionNombre: '1 lata' }],
    ['Caballa', 205, 19, 0, 14],
    ['Boquerones', 131, 20, 0, 5],
    ['Trucha', 148, 21, 0, 7],
    ['Rape', 76, 16, 0, 1],
    ['Lenguado', 91, 19, 0, 1.2],
    ['Gallo', 73, 16, 0, 1],
    ['Pulpo', 82, 15, 2, 1],
    ['Calamares', 92, 16, 3, 1.4],
    ['Gambas', 99, 21, 0, 1, { racion: 100, racionNombre: '1 ración' }],
    ['Langostinos cocidos', 106, 22, 0, 1.5],
    ['Mejillones', 86, 12, 4, 2],
    ['Almejas', 74, 13, 3, 1],
    ['Berberechos en lata', 78, 14, 3, 1],
    ['Palitos de cangrejo', 95, 8, 14, 1, { racion: 20, racionNombre: '1 palito' }],
    ['Merluza rebozada', 190, 14, 12, 10],
  ],

  Huevos: [
    ['Huevo de gallina', 143, 13, 1, 10, { racion: 55, racionNombre: '1 huevo M' }],
    ['Clara de huevo', 52, 11, 0.7, 0.2, { racion: 33, racionNombre: '1 clara' }],
    ['Yema de huevo', 322, 16, 3.6, 27, { racion: 17, racionNombre: '1 yema' }],
    ['Huevo cocido', 155, 13, 1, 11, { racion: 55, racionNombre: '1 huevo' }],
    ['Huevo frito', 196, 14, 1, 15, { racion: 60, racionNombre: '1 huevo' }],
    ['Tortilla francesa', 170, 13, 1, 13, { racion: 120, racionNombre: '1 tortilla de 2 huevos' }],
    ['Clara de huevo pasteurizada', 47, 10, 1, 0, { liquido: true, racion: 250, racionNombre: '1 vaso' }],
  ],

  Lácteos: [
    ['Leche entera', 63, 3.3, 4.7, 3.6, { liquido: true, racion: 250, racionNombre: '1 vaso' }],
    ['Leche semidesnatada', 47, 3.3, 4.8, 1.6, { liquido: true, racion: 250, racionNombre: '1 vaso' }],
    ['Leche desnatada', 34, 3.4, 4.9, 0.2, { liquido: true, racion: 250, racionNombre: '1 vaso' }],
    ['Bebida de soja sin azúcar', 33, 3.3, 0.6, 1.8, { liquido: true, racion: 250, racionNombre: '1 vaso' }],
    ['Bebida de avena', 45, 0.8, 7, 1.3, { liquido: true, racion: 250, racionNombre: '1 vaso' }],
    ['Bebida de almendras sin azúcar', 14, 0.5, 0.3, 1.2, { liquido: true, racion: 250, racionNombre: '1 vaso' }],
    ['Yogur natural', 61, 3.5, 4.7, 3.3, { racion: 125, racionNombre: '1 unidad' }],
    ['Yogur natural desnatado', 42, 4.3, 6, 0.1, { racion: 125, racionNombre: '1 unidad' }],
    ['Yogur griego', 133, 5.7, 4.9, 10, { racion: 150, racionNombre: '1 unidad' }],
    ['Yogur griego 0 %', 59, 10, 3.6, 0.4, { racion: 150, racionNombre: '1 unidad' }],
    ['Queso fresco batido 0 %', 47, 8, 4, 0.2, { racion: 125, racionNombre: '1 unidad' }],
    ['Requesón', 98, 11, 3.4, 4.3],
    ['Queso fresco tipo Burgos', 174, 12, 3, 12, { racion: 80, racionNombre: '1 porción' }],
    ['Mozzarella', 280, 22, 2, 21, { racion: 125, racionNombre: '1 bola' }],
    ['Queso manchego semicurado', 385, 26, 1, 31, { racion: 30, racionNombre: '1 cuña' }],
    ['Queso curado', 430, 30, 1, 35, { racion: 30, racionNombre: '1 cuña' }],
    ['Queso en lonchas', 300, 20, 4, 23, { racion: 20, racionNombre: '1 loncha' }],
    ['Queso crema', 253, 6, 4, 24, { racion: 30, racionNombre: '1 cucharada' }],
    ['Queso parmesano', 402, 36, 3, 27, { racion: 10, racionNombre: '1 cucharada rallado' }],
    ['Queso de cabra', 364, 22, 2, 30],
    ['Nata para cocinar', 195, 2.5, 3, 19, { liquido: true, racion: 30, racionNombre: '1 chorrito' }],
    ['Mantequilla', 717, 0.9, 0.1, 81, { racion: 10, racionNombre: '1 nuez' }],
    ['Kéfir', 55, 3.3, 4.5, 2.5, { liquido: true, racion: 250, racionNombre: '1 vaso' }],
    ['Helado de vainilla', 207, 3.5, 24, 11, { racion: 100, racionNombre: '1 bola doble' }],
  ],

  Legumbres: [
    ['Lentejas cocidas', 116, 9, 20, 0.4, { fibra: 8, racion: 200, racionNombre: '1 plato' }],
    ['Lentejas crudas', 336, 24, 60, 1, { fibra: 11 }],
    ['Garbanzos cocidos', 164, 9, 27, 2.6, { fibra: 8, racion: 200, racionNombre: '1 plato' }],
    ['Garbanzos crudos', 364, 19, 61, 6, { fibra: 17 }],
    ['Alubias blancas cocidas', 127, 9, 23, 0.5, { fibra: 6 }],
    ['Alubias rojas cocidas', 127, 9, 23, 0.5, { fibra: 6 }],
    ['Guisantes', 81, 5, 14, 0.4, { fibra: 5 }],
    ['Habas', 88, 8, 12, 0.7],
    ['Soja texturizada', 340, 50, 30, 1],
    ['Tofu firme', 144, 15, 4, 8, { racion: 100, racionNombre: '1 ración' }],
    ['Tempeh', 192, 20, 8, 11],
    ['Hummus', 166, 8, 14, 10, { racion: 50, racionNombre: '2 cucharadas' }],
    ['Edamame', 121, 12, 9, 5],
    ['Altramuces', 119, 16, 10, 3],
  ],

  'Cereales y pan': [
    ['Pan blanco de trigo', 265, 9, 49, 3.2, { racion: 30, racionNombre: '1 rebanada' }],
    ['Pan integral', 247, 10, 41, 3.4, { fibra: 7, racion: 30, racionNombre: '1 rebanada' }],
    ['Pan de centeno', 259, 9, 48, 3.3, { fibra: 6, racion: 30, racionNombre: '1 rebanada' }],
    ['Barra de pan', 277, 9, 55, 1.5, { racion: 60, racionNombre: '1 trozo' }],
    ['Pan de molde', 265, 8, 48, 4, { racion: 28, racionNombre: '1 rebanada' }],
    ['Pan de molde integral', 245, 9, 41, 4, { fibra: 6, racion: 28, racionNombre: '1 rebanada' }],
    ['Pan de hamburguesa', 290, 9, 50, 5, { racion: 60, racionNombre: '1 pan' }],
    ['Pan de pita', 275, 9, 55, 1.2, { racion: 60, racionNombre: '1 pita' }],
    ['Tortilla de trigo', 310, 8, 50, 8, { racion: 45, racionNombre: '1 tortilla' }],
    ['Tostadas de pan', 400, 12, 72, 6, { racion: 10, racionNombre: '1 tostada' }],
    ['Copos de avena', 375, 13, 60, 7, { fibra: 10, racion: 40, racionNombre: '1 taza' }],
    ['Salvado de avena', 246, 17, 50, 7, { fibra: 15 }],
    ['Cereales de maíz azucarados', 378, 7, 84, 1, { racion: 30, racionNombre: '1 tazón' }],
    ['Muesli', 363, 10, 66, 6, { fibra: 8, racion: 50, racionNombre: '1 tazón' }],
    ['Harina de trigo', 364, 10, 76, 1],
    ['Harina de avena', 375, 13, 60, 7],
    ['Pan rallado', 395, 13, 72, 5],
    ['Maíz dulce en conserva', 86, 3, 19, 1],
    ['Palomitas sin aceite', 387, 13, 78, 4, { fibra: 15, racion: 25, racionNombre: '1 bol' }],
    ['Cuscús cocido', 112, 3.8, 23, 0.2],
    ['Quinoa cocida', 120, 4.4, 21, 1.9, { fibra: 3 }],
  ],

  'Pasta y arroz': [
    ['Arroz blanco cocido', 130, 2.7, 28, 0.3, { racion: 200, racionNombre: '1 plato' }],
    ['Arroz blanco crudo', 360, 7, 79, 0.6, { racion: 80, racionNombre: '1 ración en crudo' }],
    ['Arroz integral cocido', 123, 2.7, 26, 1, { fibra: 2 }],
    ['Arroz integral crudo', 350, 8, 73, 3, { fibra: 4 }],
    ['Pasta cocida', 158, 6, 31, 0.9, { racion: 200, racionNombre: '1 plato' }],
    ['Pasta cruda', 371, 13, 75, 1.5, { racion: 80, racionNombre: '1 ración en cruda' }],
    ['Pasta integral cocida', 149, 6, 30, 1.3, { fibra: 4 }],
    ['Macarrones cocidos', 158, 6, 31, 0.9],
    ['Espaguetis cocidos', 158, 6, 31, 0.9],
    ['Fideos de arroz cocidos', 109, 2, 24, 0.2],
    ['Noodles instantáneos', 450, 10, 60, 19, { racion: 70, racionNombre: '1 paquete' }],
    ['Lasaña (placas secas)', 355, 12, 72, 1.5],
  ],

  'Patatas y tubérculos': [
    ['Patata cocida', 87, 2, 20, 0.1, { racion: 200, racionNombre: '1 ración' }],
    ['Patata asada', 93, 2.5, 21, 0.1, { racion: 180, racionNombre: '1 patata' }],
    ['Patatas fritas', 312, 3.4, 41, 15, { racion: 150, racionNombre: '1 ración' }],
    ['Puré de patata', 83, 2, 15, 1.5],
    ['Boniato cocido', 90, 2, 21, 0.1, { fibra: 3, racion: 180, racionNombre: '1 unidad' }],
    ['Yuca cocida', 160, 1.4, 38, 0.3],
  ],

  Verduras: [
    ['Lechuga', 15, 1.4, 1.5, 0.2, { racion: 80, racionNombre: '1 bol' }],
    ['Espinacas', 23, 2.9, 1.4, 0.4, { fibra: 2, racion: 150, racionNombre: '1 ración' }],
    ['Rúcula', 25, 2.6, 2, 0.7],
    ['Tomate', 18, 0.9, 3.9, 0.2, { racion: 120, racionNombre: '1 tomate' }],
    ['Tomate cherry', 18, 0.9, 3.9, 0.2, { racion: 15, racionNombre: '1 unidad' }],
    ['Tomate frito', 82, 1.6, 9, 4, { racion: 60, racionNombre: '2 cucharadas' }],
    ['Pepino', 15, 0.7, 3.6, 0.1, { racion: 150, racionNombre: '1/2 pepino' }],
    ['Pimiento rojo', 31, 1, 6, 0.3, { racion: 120, racionNombre: '1 pimiento' }],
    ['Pimiento verde', 20, 0.9, 4.6, 0.2],
    ['Cebolla', 40, 1.1, 9, 0.1, { racion: 100, racionNombre: '1 cebolla' }],
    ['Ajo', 149, 6.4, 33, 0.5, { racion: 5, racionNombre: '1 diente' }],
    ['Calabacín', 17, 1.2, 3.1, 0.3, { racion: 200, racionNombre: '1 unidad' }],
    ['Berenjena', 25, 1, 6, 0.2, { fibra: 3 }],
    ['Brócoli', 34, 2.8, 7, 0.4, { fibra: 3, racion: 200, racionNombre: '1 ración' }],
    ['Coliflor', 25, 1.9, 5, 0.3, { fibra: 2 }],
    ['Judías verdes', 31, 1.8, 7, 0.2, { fibra: 3 }],
    ['Zanahoria', 41, 0.9, 10, 0.2, { fibra: 3, racion: 70, racionNombre: '1 zanahoria' }],
    ['Champiñones', 22, 3.1, 3.3, 0.3, { racion: 150, racionNombre: '1 ración' }],
    ['Setas', 25, 3, 4, 0.4],
    ['Espárragos', 20, 2.2, 3.9, 0.1],
    ['Alcachofa', 47, 3.3, 11, 0.2, { fibra: 5 }],
    ['Puerro', 61, 1.5, 14, 0.3],
    ['Col', 25, 1.3, 6, 0.1, { fibra: 2 }],
    ['Repollo', 25, 1.3, 6, 0.1],
    ['Calabaza', 26, 1, 7, 0.1],
    ['Remolacha cocida', 44, 1.7, 10, 0.2],
    ['Guacamole', 150, 2, 8, 13, { racion: 50, racionNombre: '2 cucharadas' }],
    ['Pisto', 70, 1.5, 7, 4],
    ['Gazpacho', 45, 0.8, 4, 3, { liquido: true, racion: 250, racionNombre: '1 vaso' }],
    ['Ensalada mixta', 30, 1.3, 3.5, 1.2, { racion: 200, racionNombre: '1 plato' }],
  ],

  Frutas: [
    ['Plátano', 89, 1.1, 23, 0.3, { fibra: 2.6, racion: 120, racionNombre: '1 plátano' }],
    ['Manzana', 52, 0.3, 14, 0.2, { fibra: 2.4, racion: 180, racionNombre: '1 manzana' }],
    ['Pera', 57, 0.4, 15, 0.1, { fibra: 3, racion: 180, racionNombre: '1 pera' }],
    ['Naranja', 47, 0.9, 12, 0.1, { fibra: 2.4, racion: 180, racionNombre: '1 naranja' }],
    ['Mandarina', 53, 0.8, 13, 0.3, { racion: 90, racionNombre: '1 unidad' }],
    ['Fresas', 32, 0.7, 8, 0.3, { fibra: 2, racion: 150, racionNombre: '1 bol' }],
    ['Arándanos', 57, 0.7, 14, 0.3, { fibra: 2.4, racion: 100, racionNombre: '1 puñado' }],
    ['Frambuesas', 52, 1.2, 12, 0.7, { fibra: 6.5 }],
    ['Uvas', 69, 0.7, 18, 0.2, { racion: 120, racionNombre: '1 racimo pequeño' }],
    ['Sandía', 30, 0.6, 8, 0.2, { racion: 250, racionNombre: '1 tajada' }],
    ['Melón', 34, 0.8, 8, 0.2, { racion: 200, racionNombre: '1 tajada' }],
    ['Piña', 50, 0.5, 13, 0.1, { racion: 150, racionNombre: '2 rodajas' }],
    ['Kiwi', 61, 1.1, 15, 0.5, { fibra: 3, racion: 75, racionNombre: '1 kiwi' }],
    ['Melocotón', 39, 0.9, 10, 0.3, { racion: 150, racionNombre: '1 unidad' }],
    ['Cereza', 63, 1.1, 16, 0.2],
    ['Ciruela', 46, 0.7, 11, 0.3, { racion: 70, racionNombre: '1 unidad' }],
    ['Aguacate', 160, 2, 9, 15, { fibra: 7, racion: 150, racionNombre: '1/2 aguacate' }],
    ['Mango', 60, 0.8, 15, 0.4, { racion: 200, racionNombre: '1/2 unidad' }],
    ['Papaya', 43, 0.5, 11, 0.3],
    ['Higo', 74, 0.8, 19, 0.3, { racion: 50, racionNombre: '1 higo' }],
    ['Dátiles', 282, 2.5, 75, 0.4, { fibra: 8, racion: 8, racionNombre: '1 dátil' }],
    ['Pasas', 299, 3, 79, 0.5, { racion: 30, racionNombre: '1 puñado' }],
    ['Granada', 83, 1.7, 19, 1.2],
    ['Limón', 29, 1.1, 9, 0.3, { racion: 60, racionNombre: '1 limón' }],
  ],

  'Frutos secos y semillas': [
    ['Almendras', 579, 21, 22, 50, { fibra: 12, racion: 30, racionNombre: '1 puñado' }],
    ['Nueces', 654, 15, 14, 65, { fibra: 7, racion: 30, racionNombre: '1 puñado' }],
    ['Avellanas', 628, 15, 17, 61, { racion: 30, racionNombre: '1 puñado' }],
    ['Anacardos', 553, 18, 30, 44, { racion: 30, racionNombre: '1 puñado' }],
    ['Pistachos', 560, 20, 28, 45, { fibra: 10, racion: 30, racionNombre: '1 puñado' }],
    ['Cacahuetes', 567, 26, 16, 49, { fibra: 8, racion: 30, racionNombre: '1 puñado' }],
    ['Crema de cacahuete', 588, 25, 20, 50, { racion: 20, racionNombre: '1 cucharada' }],
    ['Crema de almendras', 614, 21, 19, 56, { racion: 20, racionNombre: '1 cucharada' }],
    ['Semillas de chía', 486, 17, 42, 31, { fibra: 34, racion: 15, racionNombre: '1 cucharada' }],
    ['Semillas de lino', 534, 18, 29, 42, { fibra: 27 }],
    ['Pipas de girasol', 584, 21, 20, 51, { racion: 30, racionNombre: '1 puñado' }],
    ['Pipas de calabaza', 559, 30, 11, 49, { racion: 30, racionNombre: '1 puñado' }],
    ['Sésamo', 573, 18, 23, 50],
    ['Coco rallado', 660, 7, 24, 65],
  ],

  'Grasas y aceites': [
    ['Aceite de oliva virgen extra', 884, 0, 0, 100, { liquido: true, racion: 10, racionNombre: '1 cucharada' }],
    ['Aceite de girasol', 884, 0, 0, 100, { liquido: true, racion: 10, racionNombre: '1 cucharada' }],
    ['Aceite de coco', 862, 0, 0, 100, { liquido: true, racion: 10, racionNombre: '1 cucharada' }],
    ['Aceitunas verdes', 145, 1, 4, 15, { racion: 30, racionNombre: '6 unidades' }],
    ['Aceitunas negras', 115, 0.8, 6, 11],
    ['Margarina', 717, 0.2, 0.7, 80, { racion: 10, racionNombre: '1 cucharada' }],
    ['Manteca de cerdo', 900, 0, 0, 100],
  ],

  'Salsas y condimentos': [
    ['Mayonesa', 680, 1, 1, 75, { racion: 15, racionNombre: '1 cucharada' }],
    ['Mayonesa ligera', 300, 1, 5, 30, { racion: 15, racionNombre: '1 cucharada' }],
    ['Kétchup', 102, 1.2, 24, 0.2, { racion: 15, racionNombre: '1 cucharada' }],
    ['Mostaza', 66, 4, 5, 3, { racion: 10, racionNombre: '1 cucharadita' }],
    ['Salsa de soja', 53, 8, 5, 0, { liquido: true, racion: 15, racionNombre: '1 cucharada' }],
    ['Salsa barbacoa', 172, 1, 41, 0.5, { racion: 20, racionNombre: '1 cucharada' }],
    ['Vinagre balsámico', 88, 0.5, 17, 0, { liquido: true, racion: 10, racionNombre: '1 chorrito' }],
    ['Salsa de tomate casera', 60, 1.5, 8, 2.5],
    ['Sofrito', 90, 1.2, 8, 6],
    ['Alioli', 620, 1.5, 3, 66, { racion: 15, racionNombre: '1 cucharada' }],
    ['Sal', 0, 0, 0, 0],
    ['Especias', 0, 0, 0, 0],
  ],

  Bebidas: [
    ['Agua', 0, 0, 0, 0, { liquido: true, racion: 500, racionNombre: '1 botellín' }],
    ['Café solo', 2, 0.2, 0, 0, { liquido: true, racion: 60, racionNombre: '1 taza' }],
    ['Café con leche', 40, 2.2, 3.3, 2, { liquido: true, racion: 200, racionNombre: '1 taza' }],
    ['Té e infusiones', 1, 0, 0.2, 0, { liquido: true, racion: 250, racionNombre: '1 taza' }],
    ['Zumo de naranja natural', 45, 0.7, 10, 0.2, { liquido: true, racion: 250, racionNombre: '1 vaso' }],
    ['Zumo envasado', 46, 0.5, 11, 0.1, { liquido: true, racion: 200, racionNombre: '1 brik' }],
    ['Refresco de cola', 42, 0, 10.6, 0, { liquido: true, racion: 330, racionNombre: '1 lata' }],
    ['Refresco light', 0.3, 0, 0, 0, { liquido: true, racion: 330, racionNombre: '1 lata' }],
    ['Bebida isotónica', 24, 0, 6, 0, { liquido: true, racion: 500, racionNombre: '1 botella' }],
    ['Bebida energética', 45, 0, 11, 0, { liquido: true, racion: 250, racionNombre: '1 lata' }],
    ['Cerveza', 43, 0.5, 3.6, 0, { liquido: true, racion: 330, racionNombre: '1 tercio' }],
    ['Cerveza sin alcohol', 24, 0.4, 5, 0, { liquido: true, racion: 330, racionNombre: '1 tercio' }],
    ['Vino tinto', 85, 0.1, 2.6, 0, { liquido: true, racion: 150, racionNombre: '1 copa' }],
    ['Vino blanco', 82, 0.1, 2.6, 0, { liquido: true, racion: 150, racionNombre: '1 copa' }],
    ['Destilados', 231, 0, 0, 0, { liquido: true, racion: 50, racionNombre: '1 chupito' }],
    ['Batido de chocolate', 83, 3, 12, 2.5, { liquido: true, racion: 250, racionNombre: '1 vaso' }],
  ],

  'Dulces y snacks': [
    ['Chocolate negro 70 %', 598, 7.8, 46, 43, { racion: 20, racionNombre: '2 onzas' }],
    ['Chocolate con leche', 535, 7.6, 59, 30, { racion: 20, racionNombre: '2 onzas' }],
    ['Crema de cacao', 539, 6, 58, 31, { racion: 20, racionNombre: '1 cucharada' }],
    ['Galletas María', 436, 7, 74, 12, { racion: 8, racionNombre: '1 galleta' }],
    ['Galletas con chocolate', 480, 6, 65, 22, { racion: 15, racionNombre: '1 galleta' }],
    ['Croissant', 406, 8, 46, 21, { racion: 60, racionNombre: '1 unidad' }],
    ['Magdalena', 420, 6, 50, 21, { racion: 40, racionNombre: '1 unidad' }],
    ['Donut', 452, 5, 51, 25, { racion: 60, racionNombre: '1 unidad' }],
    ['Bizcocho casero', 380, 6, 50, 17, { racion: 80, racionNombre: '1 porción' }],
    ['Tarta de queso', 321, 6, 26, 22, { racion: 120, racionNombre: '1 porción' }],
    ['Churros', 350, 5, 40, 19, { racion: 100, racionNombre: '1 ración' }],
    ['Patatas fritas de bolsa', 536, 6, 53, 34, { racion: 30, racionNombre: '1 puñado' }],
    ['Nachos de maíz', 490, 7, 60, 25, { racion: 40, racionNombre: '1 ración' }],
    ['Gominolas', 350, 5, 80, 0.2, { racion: 30, racionNombre: '1 puñado' }],
    ['Miel', 304, 0.3, 82, 0, { racion: 20, racionNombre: '1 cucharada' }],
    ['Azúcar', 400, 0, 100, 0, { racion: 5, racionNombre: '1 cucharadita' }],
    ['Mermelada', 250, 0.4, 60, 0.1, { racion: 20, racionNombre: '1 cucharada' }],
    ['Flan de huevo', 145, 4, 22, 4, { racion: 100, racionNombre: '1 unidad' }],
    ['Natillas', 120, 3.5, 19, 3, { racion: 125, racionNombre: '1 unidad' }],
    ['Barrita de cereales', 400, 6, 65, 12, { racion: 30, racionNombre: '1 barrita' }],
  ],

  Suplementos: [
    ['Proteína de suero (whey)', 380, 78, 6, 5, { racion: 30, racionNombre: '1 cacito' }],
    ['Proteína aislada', 370, 88, 2, 1, { racion: 30, racionNombre: '1 cacito' }],
    ['Proteína vegana', 360, 75, 8, 4, { racion: 30, racionNombre: '1 cacito' }],
    ['Caseína', 360, 78, 5, 3, { racion: 30, racionNombre: '1 cacito' }],
    ['Creatina monohidrato', 0, 0, 0, 0, { racion: 5, racionNombre: '1 cucharadita' }],
    ['Ganador de peso', 380, 20, 65, 5, { racion: 100, racionNombre: '1 dosis' }],
    ['Barrita de proteínas', 350, 32, 30, 10, { racion: 60, racionNombre: '1 barrita' }],
    ['Maltodextrina', 380, 0, 95, 0],
    ['Aminoácidos ramificados', 0, 0, 0, 0, { racion: 10, racionNombre: '1 dosis' }],
  ],

  Platos: [
    ['Paella de marisco', 160, 9, 20, 5, { racion: 350, racionNombre: '1 plato' }],
    ['Lentejas con chorizo', 145, 9, 17, 5, { racion: 350, racionNombre: '1 plato' }],
    ['Cocido', 155, 11, 13, 7, { racion: 400, racionNombre: '1 plato' }],
    ['Macarrones con tomate', 165, 6, 27, 4, { racion: 300, racionNombre: '1 plato' }],
    ['Espaguetis a la boloñesa', 180, 9, 22, 6, { racion: 350, racionNombre: '1 plato' }],
    ['Lasaña de carne', 190, 11, 17, 9, { racion: 300, racionNombre: '1 porción' }],
    ['Pizza margarita', 266, 11, 33, 10, { racion: 300, racionNombre: '1 pizza' }],
    ['Pizza de pepperoni', 298, 12, 31, 14, { racion: 300, racionNombre: '1 pizza' }],
    ['Tortilla de patatas', 190, 6, 14, 12, { racion: 150, racionNombre: '1 porción' }],
    ['Bocadillo de jamón', 260, 13, 35, 8, { racion: 180, racionNombre: '1 bocadillo' }],
    ['Bocadillo de tortilla', 240, 10, 32, 8, { racion: 200, racionNombre: '1 bocadillo' }],
    ['Hamburguesa completa', 260, 14, 22, 13, { racion: 250, racionNombre: '1 hamburguesa' }],
    ['Ensaladilla rusa', 180, 4, 12, 13, { racion: 200, racionNombre: '1 ración' }],
    ['Croquetas', 235, 8, 22, 13, { racion: 30, racionNombre: '1 croqueta' }],
    ['Empanadillas', 290, 8, 30, 15, { racion: 60, racionNombre: '1 unidad' }],
    ['Sushi (nigiri y maki)', 145, 6, 25, 2, { racion: 200, racionNombre: '8 piezas' }],
    ['Poke bowl', 150, 10, 18, 4, { racion: 400, racionNombre: '1 bol' }],
    ['Wok de verduras con pollo', 120, 11, 8, 4, { racion: 350, racionNombre: '1 plato' }],
    ['Crema de verduras', 55, 1.5, 7, 2, { racion: 300, racionNombre: '1 plato' }],
    ['Sopa de fideos', 45, 2, 7, 1, { racion: 300, racionNombre: '1 plato' }],
    ['Kebab', 215, 14, 20, 9, { racion: 300, racionNombre: '1 kebab' }],
    ['Burrito', 210, 9, 25, 8, { racion: 300, racionNombre: '1 burrito' }],
    ['Arroz tres delicias', 165, 6, 25, 4, { racion: 300, racionNombre: '1 plato' }],
    ['Pollo al curry con arroz', 175, 12, 20, 5, { racion: 400, racionNombre: '1 plato' }],
    ['Salmón con verduras', 145, 16, 5, 7, { racion: 350, racionNombre: '1 plato' }],
    ['Tostada con aguacate y huevo', 200, 8, 16, 12, { racion: 180, racionNombre: '1 tostada' }],
    ['Porridge de avena', 110, 4.5, 16, 2.5, { racion: 350, racionNombre: '1 bol' }],
    ['Yogur con fruta y granola', 130, 6, 18, 4, { racion: 250, racionNombre: '1 bol' }],
  ],
};

/** El id sale del nombre. Igual que en el catálogo de ejercicios, y por lo mismo. */
export function idDeAlimento(nombre: string, marca?: string): string {
  return [nombre, marca]
    .filter(Boolean)
    .join(' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const ALIMENTOS: readonly Alimento[] = Object.entries(POR_CATEGORIA).flatMap(
  ([categoria, filas]) =>
    filas.map(([nombre, kcal, proteinas, carbohidratos, grasas, extra = {}]) => ({
      id: idDeAlimento(nombre),
      nombre,
      categoria: categoria as Categoria,
      kcal,
      proteinas,
      carbohidratos,
      grasas,
      ...extra,
    })),
);

export const CATEGORIAS = Object.keys(POR_CATEGORIA) as Categoria[];

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Busca por trozos sueltos y sin acentos, igual que el buscador de ejercicios. */
export function coincideAlimento(a: Alimento, busqueda: string): boolean {
  const trozos = normalizar(busqueda).split(/\s+/).filter(Boolean);
  if (trozos.length === 0) return true;
  const paja = normalizar(`${a.nombre} ${a.marca ?? ''} ${a.categoria}`);
  return trozos.every((t) => paja.includes(t));
}

/** El catálogo con los alimentos propios delante: son los que uno come de verdad. */
export function catalogoDeAlimentos(propios: Alimento[]): Alimento[] {
  const mios = propios.map((a) => ({ ...a, propio: true }));
  const ids = new Set(mios.map((a) => a.id));
  return [...mios, ...ALIMENTOS.filter((a) => !ids.has(a.id))];
}

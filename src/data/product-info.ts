export type DetailLine = { label?: string; text: string};

export type DetailItem = {
    icon: 'materials' | 'size' | 'care';
    title: string;
    line: DetailLine[];
};

// Confirm all texts with the client before launch
export const defaultMaterials: DetailLine[] = [
   { label: 'Material superior exterior', text: 'Piel auténtica de vacuno' },
   { label: 'Material interior', text:'Piel auténtica de vacuno'},
   { label: 'Suela', text:'TR'},
];

export const sizeGuide = 
 'Con toda confianza pida su número tradicional, nuestras sandalias están desarrolladas en un escala en centímetros.';

 export const care = 'Limpiar con franela limpia y Ligeramente humeda.';
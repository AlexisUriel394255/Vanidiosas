import { defaultMaterials, sizeGuide, care} from '../data/product-info';
import type { DetailItem, DetailLine } from '../data/product-info';

type ProductLike = { materials?: DetailLine[] };

export function buildDetails(product:ProductLike): DetailItem[]{
     return [
    { icon: 'materials', title: 'Materiales', lines: product.materials ?? defaultMaterials },
    { icon: 'size', title: 'Recomendación de talla', lines: [{ text: sizeGuide }] },
    { icon: 'care', title: 'Cuidados', lines: [{ text: care }] },
  ];
}

export function formatPrice(value:number): string{
    return new Intl.NumberFormat('es-MX',{
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits:0,
    }).format(value);
}
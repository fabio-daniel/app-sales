/** Fecha local (yyyy-MM-dd) de una fecha o fecha ISO: la misma que ve el usuario en pantalla. */
export const localDate = (value: string | Date): string => {
  const d = new Date(value);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

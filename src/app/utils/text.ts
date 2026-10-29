/** Minúsculas y sin tildes, para que "camara" encuentre "Cámara". */
export const normalize = (text: string): string =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

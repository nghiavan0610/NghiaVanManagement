import { format as formatFns } from 'date-fns';
import resolveConfig from 'tailwindcss/resolveConfig';

export const tailwindConfig = () =>
  // Tailwind config
  resolveConfig('./src/css/tailwind.config.js');

export const genericFormat = (date) => {
  return formatFns(new Date(date), 'yyyy-MM-dd');
};

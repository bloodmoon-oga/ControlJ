// 1. O objeto de valores (runtime)
export const STATUS = {
  NOT_FOUND: 'Não encontrado',
  SEARCHING: 'Procurando',
  FOUND: 'Encontrado',
} as const;

// 2. Criação do tipo a partir do objeto
type StatusObject = typeof STATUS;
export type ItemStatus = StatusObject[keyof StatusObject];
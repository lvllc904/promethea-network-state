// tailwind-merge.d.ts
declare module 'tailwind-merge' {
  type ClassValue = string | number | boolean | undefined | null | ClassValue[];
  function twMerge(...classes: ClassValue[]): string;
  export default twMerge;
}

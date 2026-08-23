export interface BoxData {
  id: number
  title: string
  color: string
}

const colors: string[] = [
  '#ef444444', '#f9731644', '#f59e0b44', '#10b98144', 
  '#06b6d444', '#3b82f644', '#6366f144', '#8b5cf644', 
  '#ec489944', '#f43f5e44', '#14b8a644', '#84cc1644', 
  '#a855f744'
];

export const boxes: BoxData[] = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  title: `box ${i + 1}`,
  color: colors[i]
}))

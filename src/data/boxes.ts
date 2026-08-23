export interface BoxData {
  id: number
  title: string
}

export const boxes: BoxData[] = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  title: `box ${i + 1}`,
}))

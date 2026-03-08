export interface GridConfig {
  isEnabled: boolean;
  columns: number;
  gutter: number;
  margin: number;
  color: string;
}

export const DEFAULT_CONFIG: GridConfig = {
  isEnabled: false,
  columns: 12,
  gutter: 16,
  margin: 16,
  color: "#ef4444",
};

export const QUICK_COLUMNS = [4, 8, 12, 16, 24];

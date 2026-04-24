import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

export { useTheme };

interface Props {
  children: ReactNode;
}

export const ThemeProviderWrapper = ({ children }: Props) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};
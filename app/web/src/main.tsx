import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { AppRouter } from "./router.tsx";
import { AuthProvider } from "./providers/AuthProvider.tsx";
import { LanguageProvider } from "./providers/LanguageProvider.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<LanguageProvider>
				<AppRouter />
				<Toaster position="bottom-right" />
			</LanguageProvider>
		</AuthProvider>
	</StrictMode>,
);

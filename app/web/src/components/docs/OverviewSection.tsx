import { useTranslation } from "../../hooks/useTranslation";

interface OverviewSectionProps {
	isDarkMode: boolean;
}

export const OverviewSection = ({ isDarkMode }: OverviewSectionProps) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			<h2 className="text-sm font-mono mb-3 text-neutral-300">{t("overview.title")}</h2>

			<div>
				<p className="text-xs font-mono mb-4 text-neutral-400">{t("overview.description")}</p>

				<h3 className="text-xs font-mono mb-2 text-neutral-400">
					{t("overview.whenToUse")}
				</h3>
				<ul
					className={`list-disc list-inside space-y-0.5 mb-4 text-xs font-mono ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}
				>
					<li>{t("overview.whenToUse.rapid")}</li>
					<li>{t("overview.whenToUse.data")}</li>
					<li>{t("overview.whenToUse.educational")}</li>
					<li>{t("overview.whenToUse.clarity")}</li>
					<li>{t("overview.whenToUse.functional")}</li>
				</ul>

				<h3 className="text-xs font-mono mb-2 text-neutral-400">
					{t("overview.keyFeatures")}
				</h3>
				<div className="grid grid-cols-1 gap-2 mb-4">
					<div
						className={`p-2 border ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-neutral-100"}`}
					>
						<h4 className="text-xs font-mono mb-1 text-neutral-300">
							{t("overview.features.clean")}
						</h4>
						<p className="text-xs font-mono text-neutral-500">{t("overview.features.clean.desc")}</p>
					</div>
					<div
						className={`p-2 border ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-neutral-100"}`}
					>
						<h4 className="text-xs font-mono mb-1 text-neutral-300">
							{t("overview.features.functional")}
						</h4>
						<p className="text-xs font-mono text-neutral-500">{t("overview.features.functional.desc")}</p>
					</div>
					<div
						className={`p-2 border ${isDarkMode ? "border-neutral-700 bg-black" : "border-neutral-300 bg-neutral-100"}`}
					>
						<h4 className="text-xs font-mono mb-1 text-neutral-300">
							{t("overview.features.immutable")}
						</h4>
						<p className="text-xs font-mono text-neutral-500">{t("overview.features.immutable.desc")}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

import { useTranslation } from "../../hooks/useTranslation";

interface OverviewSectionProps {
  isDarkMode: boolean;
}

export const OverviewSection = ({ isDarkMode }: OverviewSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">{t("overview.title")}</h2>

      <div className="prose max-w-none">
        <p className="text-lg mb-6">{t("overview.description")}</p>

        <h3 className="text-lg font-semibold mb-3">
          {t("overview.whenToUse")}
        </h3>
        <ul
          className={`list-disc list-inside space-y-1 mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          <li>{t("overview.whenToUse.rapid")}</li>
          <li>{t("overview.whenToUse.data")}</li>
          <li>{t("overview.whenToUse.educational")}</li>
          <li>{t("overview.whenToUse.clarity")}</li>
          <li>{t("overview.whenToUse.functional")}</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">
          {t("overview.keyFeatures")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}
          >
            <h4 className="font-semibold mb-2">
              {t("overview.features.clean")}
            </h4>
            <p className="text-sm">{t("overview.features.clean.desc")}</p>
          </div>
          <div
            className={`p-4 rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}
          >
            <h4 className="font-semibold mb-2">
              {t("overview.features.functional")}
            </h4>
            <p className="text-sm">{t("overview.features.functional.desc")}</p>
          </div>
          <div
            className={`p-4 rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"}`}
          >
            <h4 className="font-semibold mb-2">
              {t("overview.features.immutable")}
            </h4>
            <p className="text-sm">{t("overview.features.immutable.desc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

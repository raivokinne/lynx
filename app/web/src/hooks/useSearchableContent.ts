import { useMemo } from "react";

interface SearchResult {
    section: string;
    sectionTitle: string;
    content: string;
    type: "heading" | "text" | "code";
}

export const useSearchableContent = (
    t: (key: string) => string,
): SearchResult[] => {
    return useMemo(() => {
        const content: SearchResult[] = [];

        content.push(
            {
                section: "overview",
                sectionTitle: t("overview.title"),
                content: t("overview.title"),
                type: "heading",
            },
            {
                section: "overview",
                sectionTitle: t("overview.title"),
                content: t("overview.description"),
                type: "text",
            },
            {
                section: "overview",
                sectionTitle: t("overview.title"),
                content: t("overview.whenToUse"),
                type: "heading",
            },
            {
                section: "overview",
                sectionTitle: t("overview.title"),
                content: t("overview.whenToUse.rapid"),
                type: "text",
            },
            {
                section: "overview",
                sectionTitle: t("overview.title"),
                content: t("overview.whenToUse.data"),
                type: "text",
            },
            {
                section: "overview",
                sectionTitle: t("overview.title"),
                content: t("overview.whenToUse.educational"),
                type: "text",
            },
            {
                section: "overview",
                sectionTitle: t("overview.title"),
                content: t("overview.whenToUse.clarity"),
                type: "text",
            },
            {
                section: "overview",
                sectionTitle: t("overview.title"),
                content: t("overview.whenToUse.functional"),
                type: "text",
            },
            {
                section: "overview",
                sectionTitle: t("overview.title"),
                content: t("overview.keyFeatures"),
                type: "heading",
            },
            {
                section: "overview",
                sectionTitle: t("overview.title"),
                content:
                    t("overview.features.clean") +
                    " - " +
                    t("overview.features.clean.desc"),
                type: "text",
            },
            {
                section: "overview",
                sectionTitle: t("overview.title"),
                content:
                    t("overview.features.functional") +
                    " - " +
                    t("overview.features.functional.desc"),
                type: "text",
            },
            {
                section: "overview",
                sectionTitle: t("overview.title"),
                content:
                    t("overview.features.immutable") +
                    " - " +
                    t("overview.features.immutable.desc"),
                type: "text",
            },
        );

        content.push(
            {
                section: "language",
                sectionTitle: t("language.title"),
                content: t("language.title"),
                type: "heading",
            },
            {
                section: "language",
                sectionTitle: t("language.title"),
                content: t("language.variables"),
                type: "heading",
            },
            {
                section: "language",
                sectionTitle: t("language.title"),
                content: t("language.functions"),
                type: "heading",
            },
            {
                section: "language",
                sectionTitle: t("language.title"),
                content: t("language.controlFlow"),
                type: "heading",
            },
            {
                section: "language",
                sectionTitle: t("language.title"),
                content: t("language.dataStructures"),
                type: "heading",
            },
            {
                section: "language",
                sectionTitle: t("language.title"),
                content: t("language.arrays"),
                type: "heading",
            },
            {
                section: "language",
                sectionTitle: t("language.title"),
                content: t("language.objects"),
                type: "heading",
            },
            {
                section: "language",
                sectionTitle: t("language.title"),
                content: t("language.pipelines"),
                type: "heading",
            },
            {
                section: "language",
                sectionTitle: t("language.title"),
                content: t("language.errors"),
                type: "heading",
            },
            {
                section: "language",
                sectionTitle: t("language.title"),
                content: t("language.switch"),
                type: "heading",
            },
        );

        content.push(
            {
                section: "stdlib",
                sectionTitle: t("stdlib.title"),
                content: t("stdlib.title"),
                type: "heading",
            },
            {
                section: "stdlib",
                sectionTitle: t("stdlib.title"),
                content: t("stdlib.modules"),
                type: "heading",
            },
            {
                section: "stdlib",
                sectionTitle: t("stdlib.title"),
                content: t("stdlib.arrays"),
                type: "heading",
            },
            {
                section: "stdlib",
                sectionTitle: t("stdlib.title"),
                content: t("stdlib.math"),
                type: "heading",
            },
        );

        content.push(
            {
                section: "examples",
                sectionTitle: t("examples.title"),
                content: t("examples.title"),
                type: "heading",
            },
            {
                section: "examples",
                sectionTitle: t("examples.title"),
                content: t("examples.fibonacci"),
                type: "heading",
            },
            {
                section: "examples",
                sectionTitle: t("examples.title"),
                content: t("examples.dataProcessing"),
                type: "heading",
            },
        );

        content.push(
            {
                section: "comparisons",
                sectionTitle: t("comparisons.title"),
                content: t("comparisons.title"),
                type: "heading",
            },
            {
                section: "comparisons",
                sectionTitle: t("comparisons.title"),
                content: t("comparisons.description"),
                type: "text",
            },
            {
                section: "comparisons",
                sectionTitle: t("comparisons.title"),
                content: t("comparisons.selectLanguages"),
                type: "heading",
            },
        );

        return content;
    }, [t]);
};


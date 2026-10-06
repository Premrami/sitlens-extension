import { useState } from "react";
type Tab =
    | "overview"
    | "technology"
    | "seo"
    | "ux"
    | "issues";

type Technology = {
    name: string;
    category: string;
    confidence: "high" | "medium" | "low";
    evidence: string;
};

type UXData = {
    fonts: {
        name: string;
        count: number;
    }[];

    colors: {
        value: string;
        count: number;
    }[];

    buttons: {
        count: number;

        styles: {
            text: string;
            backgroundColor: string;
            color: string;
            borderRadius: string;
            fontSize: string;
            fontWeight: string;
            padding: string;
            border: string;
        }[];
    };

    forms: {
        count: number;
        inputCount: number;
    };

    headings: {
        count: number;

        styles: {
            tag: string;
            fontFamily: string;
            fontSize: string;
            fontWeight: string;
            lineHeight: string;
            color: string;
            marginBottom: string;
        }[];
    };

    borderRadii: {
        value: string;
        count: number;
    }[];

    body: {
        backgroundColor: string;
        color: string;
        fontFamily: string;
    };
};

type PageInfo = {
    url: string;
    title: string;
    description: string;
    technologies: Technology[];
    ux: UXData;
};

type Score = {
    label: string;
    value: number;
};

function ScoreBar({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="score-row">
            <div className="score-row-header">
                <span>{label}</span>
                <strong>{value}</strong>
            </div>

            <div className="score-track">
                <div
                    className="score-fill"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

function App() {
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState("");

    const [activeTab, setActiveTab] =
        useState<Tab>("overview");

    const scores: Score[] = [
        { label: "SEO", value: 82 },
        { label: "Performance", value: 71 },
        { label: "Accessibility", value: 88 },
        { label: "UX", value: 74 },
        { label: "Conversion", value: 69 },
    ];
    const seoFindings = [
        {
            type: "warning",
            title: "Meta description",
            description:
                "A descriptive meta description helps search engines and users understand the page.",
            status: pageInfo?.description
                ? "PASS"
                : "WARNING",
        },
        {
            type: "success",
            title: "Page title",
            description:
                "The page contains a title element.",
            status: pageInfo?.title
                ? "PASS"
                : "WARNING",
        },
        {
            type: "warning",
            title: "Heading structure",
            description:
                "Heading hierarchy will be evaluated from the page structure.",
            status: "CHECK",
        },
    ];

    const uxFindings = [
        {
            type: "success",
            title: "Clear primary content",
            description:
                "The page contains visible content that communicates its primary purpose.",
            status: "PASS",
        },
        {
            type: "warning",
            title: "Conversion signals",
            description:
                "Primary calls to action will be evaluated from buttons and important links.",
            status: "CHECK",
        },
        {
            type: "warning",
            title: "Navigation clarity",
            description:
                "Navigation structure will be evaluated from the page links.",
            status: "CHECK",
        },
    ];

    const issues = [
        {
            severity: "high",
            title: "Missing or weak metadata",
            category: "SEO",
            description:
                "Review the page title and meta description to improve search visibility.",
        },
        {
            severity: "medium",
            title: "Limited conversion signals",
            category: "CONVERSION",
            description:
                "Important pages should provide clear next actions for visitors.",
        },
        {
            severity: "low",
            title: "Heading structure needs analysis",
            category: "CONTENT",
            description:
                "The heading hierarchy should be checked for logical structure.",
        },
    ];

    const analyzeWebsite = async () => {
        setIsAnalyzing(true);
        setError("");

        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });

            const currentTab = tabs[0];

            if (!currentTab?.id) {
                throw new Error("Could not find the current tab.");
            }

            const response = await chrome.tabs.sendMessage(
                currentTab.id,
                {
                    type: "GET_PAGE_INFO",
                }
            );

            if (!response?.success) {
                throw new Error("Could not read the website.");
            }

            setPageInfo(response.data);
        } catch (err) {
            console.error(err);

            setError(
                "Unable to analyze this page. Refresh the website and try again."
            );
        } finally {
            setIsAnalyzing(false);
        }
    };

    const overallScore = Math.round(
        scores.reduce((total, score) => total + score.value, 0) /
        scores.length
    );

    return (
        <div className="app">
            {/* Header */}
            <header className="topbar">
                <div className="brand">
                    <div className="brand-mark">S</div>

                    <div>
                        <div className="brand-name">SiteLens</div>
                        <div className="brand-version">AI</div>
                    </div>
                </div>

                <button className="icon-button" title="Settings">
                    ⚙
                </button>
            </header>

            {/* Main */}
            <main className="main">
                <section className="intro">
                    <div>
                        <span className="eyebrow">WEBSITE INTELLIGENCE</span>

                        <h1>
                            {pageInfo?.title || "Analyze this website"}
                        </h1>

                        <p>
                            {pageInfo?.url || "Inspect the current page for actionable insights."}
                        </p>
                    </div>

                    <button
                        className="analyze-button"
                        onClick={analyzeWebsite}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? "Analyzing..." : "Analyze"}
                    </button>
                </section>

                {error && (
                    <div className="error-card">
                        {error}
                    </div>
                )}

                {/* Score */}
                <section className="score-card">
                    <div className="score-overview">
                        <div className="score-circle">
                            <span>{overallScore}</span>
                        </div>

                        <div>
                            <span className="section-label">
                                OVERALL SCORE
                            </span>

                            <h2>
                                {overallScore >= 80
                                    ? "Strong foundation"
                                    : overallScore >= 60
                                        ? "Needs improvement"
                                        : "Needs attention"}
                            </h2>

                            <p>
                                Based on the current website analysis.
                            </p>
                        </div>
                    </div>

                    <div className="score-list">
                        {scores.map((score) => (
                            <ScoreBar
                                key={score.label}
                                label={score.label}
                                value={score.value}
                            />
                        ))}
                    </div>
                </section>

                {/* Navigation */}
                <nav className="tabs">
                    <button
                        className={`tab ${activeTab === "overview" ? "active" : ""
                            }`}
                        onClick={() => setActiveTab("overview")}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab ${activeTab === "technology" ? "active" : ""
                            }`}
                        onClick={() => setActiveTab("technology")}
                    >
                        Technology
                    </button>

                    <button
                        className={`tab ${activeTab === "seo" ? "active" : ""
                            }`}
                        onClick={() => setActiveTab("seo")}
                    >
                        SEO
                    </button>

                    <button
                        className={`tab ${activeTab === "ux" ? "active" : ""
                            }`}
                        onClick={() => setActiveTab("ux")}
                    >
                        UX
                    </button>

                    <button
                        className={`tab ${activeTab === "issues" ? "active" : ""
                            }`}
                        onClick={() => setActiveTab("issues")}
                    >
                        Issues
                    </button>
                </nav>

                {/* Findings */}
                {activeTab === "technology" && (
                    <section className="technology-section">
                        <div className="section-heading">
                            <div>
                                <span className="section-label">
                                    DETECTED TECHNOLOGIES
                                </span>

                                <h2>Technology stack</h2>
                            </div>

                            <span className="finding-count">
                                {pageInfo?.technologies?.length || 0} detected
                            </span>
                        </div>

                        {!pageInfo && (
                            <div className="empty-state">
                                <div className="empty-state-title">
                                    Analyze the website first
                                </div>

                                <p>
                                    SiteLens will inspect the current page and
                                    identify observable technologies.
                                </p>
                            </div>
                        )}

                        {pageInfo && pageInfo.technologies.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-title">
                                    No technologies confidently detected
                                </div>

                                <p>
                                    This does not mean the site uses no framework.
                                    Some technologies cannot be reliably detected
                                    from the client-side page alone.
                                </p>
                            </div>
                        )}

                        {pageInfo?.technologies.map((technology) => (
                            <article
                                className="technology-card"
                                key={`${technology.category}-${technology.name}`}
                            >
                                <div className="technology-header">
                                    <div className="technology-icon">
                                        {technology.name.charAt(0)}
                                    </div>

                                    <div className="technology-main">
                                        <div className="technology-name">
                                            {technology.name}
                                        </div>

                                        <div className="technology-category">
                                            {technology.category}
                                        </div>
                                    </div>

                                    <span
                                        className={`confidence confidence-${technology.confidence}`}
                                    >
                                        {technology.confidence}
                                    </span>
                                </div>

                                <div className="technology-evidence">
                                    {technology.evidence}
                                </div>
                            </article>
                        ))}
                    </section>
                )}
                {activeTab === "overview" && (
                    <section className="findings">
                        <div className="section-heading">
                            <div>
                                <span className="section-label">
                                    ANALYSIS
                                </span>

                                <h2>Key findings</h2>
                            </div>

                            <span className="finding-count">
                                3 findings
                            </span>
                        </div>

                        <article className="finding">
                            <div className="finding-icon warning">
                                !
                            </div>

                            <div className="finding-content">
                                <div className="finding-title">
                                    Missing meta description
                                </div>

                                <p>
                                    This page does not provide a meta description.
                                    Add one that clearly explains the page content.
                                </p>

                                <span className="finding-tag seo">
                                    SEO
                                </span>
                            </div>
                        </article>

                        <article className="finding">
                            <div className="finding-icon success">
                                ✓
                            </div>

                            <div className="finding-content">
                                <div className="finding-title">
                                    Clear page heading
                                </div>

                                <p>
                                    The page has a clear primary heading that
                                    communicates its main purpose.
                                </p>

                                <span className="finding-tag content">
                                    CONTENT
                                </span>
                            </div>
                        </article>

                        <article className="finding">
                            <div className="finding-icon warning">
                                !
                            </div>

                            <div className="finding-content">
                                <div className="finding-title">
                                    Limited conversion signals
                                </div>

                                <p>
                                    The page has limited visible calls to action
                                    for guiding visitors toward the next step.
                                </p>

                                <span className="finding-tag conversion">
                                    CONVERSION
                                </span>
                            </div>
                        </article>
                    </section>
                )}

                {activeTab === "seo" && (
                    <section className="findings">
                        <div className="section-heading">
                            <div>
                                <span className="section-label">
                                    SEARCH OPTIMIZATION
                                </span>

                                <h2>SEO analysis</h2>
                            </div>

                            <span className="finding-count">
                                3 checks
                            </span>
                        </div>

                        {seoFindings.map((finding) => (
                            <article className="finding" key={finding.title}>
                                <div
                                    className={`finding-icon ${finding.type === "success"
                                        ? "success"
                                        : "warning"
                                        }`}
                                >
                                    {finding.type === "success" ? "✓" : "!"}
                                </div>

                                <div className="finding-content">
                                    <div className="finding-title">
                                        {finding.title}
                                    </div>

                                    <p>{finding.description}</p>

                                    <span className="finding-tag seo">
                                        {finding.status}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
                {activeTab === "ux" && pageInfo && (
                    <section className="ux-section">
                        <div className="section-heading">
                            <div>
                                <span className="section-label">
                                    USER EXPERIENCE
                                </span>

                                <h2>Design system</h2>
                            </div>
                        </div>

                        {/* Typography */}

                        <div className="ux-card">
                            <div className="ux-card-title">
                                Typography
                            </div>

                            <div className="ux-main-value">
                                {pageInfo.ux.body.fontFamily}
                            </div>

                            <div className="ux-subtitle">
                                Primary font
                            </div>

                            <div className="ux-list">
                                {pageInfo.ux.fonts
                                    .slice(0, 5)
                                    .map((font) => (
                                        <div
                                            className="ux-list-row"
                                            key={font.name}
                                        >
                                            <span>{font.name}</span>

                                            <span>
                                                {font.count} elements
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Colors */}

                        <div className="ux-card">
                            <div className="ux-card-title">
                                Color palette
                            </div>

                            <div className="color-grid">
                                {pageInfo.ux.colors
                                    .slice(0, 8)
                                    .map((color) => (
                                        <div
                                            className="color-item"
                                            key={color.value}
                                        >
                                            <div
                                                className="color-swatch"
                                                style={{
                                                    backgroundColor:
                                                        color.value,
                                                }}
                                            />

                                            <div className="color-info">
                                                <strong>
                                                    {color.value}
                                                </strong>

                                                <span>
                                                    {color.count} uses
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Buttons */}

                        <div className="ux-card">
                            <div className="ux-card-title">
                                Buttons & CTAs
                            </div>

                            <div className="ux-stat-row">
                                <div>
                                    <strong>
                                        {pageInfo.ux.buttons.count}
                                    </strong>

                                    <span>
                                        detected buttons
                                    </span>
                                </div>

                                {pageInfo.ux.buttons.styles[0] && (
                                    <div>
                                        <strong>
                                            {
                                                pageInfo.ux.buttons.styles[0]
                                                    .borderRadius
                                            }
                                        </strong>

                                        <span>
                                            common radius
                                        </span>
                                    </div>
                                )}
                            </div>

                            {pageInfo.ux.buttons.styles
                                .slice(0, 5)
                                .map((button, index) => (
                                    <div
                                        className="button-preview"
                                        key={`${button.text}-${index}`}
                                    >
                                        <button
                                            style={{
                                                backgroundColor:
                                                    button.backgroundColor,
                                                color: button.color,
                                                borderRadius:
                                                    button.borderRadius,
                                                fontSize:
                                                    button.fontSize,
                                                fontWeight:
                                                    button.fontWeight,
                                                padding:
                                                    button.padding,
                                                border:
                                                    button.border,
                                            }}
                                        >
                                            {button.text}
                                        </button>

                                        <div>
                                            <span>
                                                {button.fontSize}
                                            </span>

                                            <span>
                                                {button.borderRadius}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Layout */}

                        <div className="ux-card">
                            <div className="ux-card-title">
                                Layout & structure
                            </div>

                            <div className="ux-stat-grid">
                                <div>
                                    <strong>
                                        {pageInfo.ux.headings.count}
                                    </strong>

                                    <span>headings</span>
                                </div>

                                <div>
                                    <strong>
                                        {pageInfo.ux.forms.count}
                                    </strong>

                                    <span>forms</span>
                                </div>

                                <div>
                                    <strong>
                                        {pageInfo.ux.forms.inputCount}
                                    </strong>

                                    <span>form fields</span>
                                </div>

                                <div>
                                    <strong>
                                        {pageInfo.ux.borderRadii.length}
                                    </strong>

                                    <span>radius styles</span>
                                </div>
                            </div>
                        </div>

                        {/* Heading styles */}

                        <div className="ux-card">
                            <div className="ux-card-title">
                                Heading styles
                            </div>

                            {pageInfo.ux.headings.styles
                                .slice(0, 6)
                                .map((heading, index) => (
                                    <div
                                        className="heading-preview"
                                        key={`${heading.tag}-${index}`}
                                    >
                                        <div
                                            style={{
                                                fontFamily:
                                                    heading.fontFamily,
                                                fontSize:
                                                    heading.fontSize,
                                                fontWeight:
                                                    heading.fontWeight,
                                                lineHeight:
                                                    heading.lineHeight,
                                                color:
                                                    heading.color,
                                            }}
                                        >
                                            {heading.tag.toUpperCase()}
                                        </div>

                                        <span>
                                            {heading.fontSize} ·{" "}
                                            {heading.fontWeight}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </section>
                )}
                {activeTab === "issues" && (
                    <section className="findings">
                        <div className="section-heading">
                            <div>
                                <span className="section-label">
                                    PRIORITIZED ISSUES
                                </span>

                                <h2>Issues to fix</h2>
                            </div>

                            <span className="finding-count">
                                {issues.length} issues
                            </span>
                        </div>

                        {issues.map((issue) => (
                            <article className="finding" key={issue.title}>
                                <div className="finding-icon warning">
                                    !
                                </div>

                                <div className="finding-content">
                                    <div className="finding-title">
                                        {issue.title}
                                    </div>

                                    <p>{issue.description}</p>

                                    <span className="finding-tag">
                                        {issue.category}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </section>
                )}

                {/* Page information */}
                {activeTab === "overview" && pageInfo && (
                    <section className="page-info">
                        <div className="section-heading">
                            <div>
                                <span className="section-label">
                                    PAGE DATA
                                </span>

                                <h2>Detected information</h2>
                            </div>
                        </div>

                        <div className="info-row">
                            <span>Title</span>
                            <strong>{pageInfo.title}</strong>
                        </div>

                        <div className="info-row">
                            <span>Description</span>
                            <strong>
                                {pageInfo.description || "Not found"}
                            </strong>
                        </div>

                        <div className="info-row">
                            <span>URL</span>
                            <strong>{pageInfo.url}</strong>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default App;
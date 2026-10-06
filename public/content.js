console.log("SiteLens content script loaded");

function analyzeUX() {
    const elements = Array.from(
        document.querySelectorAll(
            "body *"
        )
    );

    const visibleElements = elements.filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            rect.width > 0 &&
            rect.height > 0
        );
    });

    /*
     * --------------------------------
     * Fonts
     * --------------------------------
     */

    const fontUsage = new Map();

    visibleElements.forEach((element) => {
        const style = window.getComputedStyle(element);

        const fontFamily = style.fontFamily
            .split(",")[0]
            .trim()
            .replace(/['"]/g, "");

        if (!fontFamily) {
            return;
        }

        fontUsage.set(
            fontFamily,
            (fontUsage.get(fontFamily) || 0) + 1
        );
    });

    const fonts = [...fontUsage.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({
            name,
            count,
        }));

    /*
     * --------------------------------
     * Colors
     * --------------------------------
     */

    const colorUsage = new Map();

    visibleElements.forEach((element) => {
        const style = window.getComputedStyle(element);

        const colors = [
            style.color,
            style.backgroundColor,
            style.borderColor,
        ];

        colors.forEach((color) => {
            if (
                color &&
                color !== "transparent" &&
                color !== "rgba(0, 0, 0, 0)"
            ) {
                colorUsage.set(
                    color,
                    (colorUsage.get(color) || 0) + 1
                );
            }
        });
    });

    const colors = [...colorUsage.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([value, count]) => ({
            value,
            count,
        }));

    /*
     * --------------------------------
     * Buttons
     * --------------------------------
     */

    const buttons = Array.from(
        document.querySelectorAll(
            'button, input[type="button"], input[type="submit"], a[class*="button"], a[class*="btn"]'
        )
    );

    const buttonStyles = buttons
        .map((button) => {
            const style = window.getComputedStyle(button);

            return {
                text:
                    button.textContent?.trim() ||
                    button.getAttribute("aria-label") ||
                    "Unnamed",

                backgroundColor:
                    style.backgroundColor,

                color: style.color,

                borderRadius:
                    style.borderRadius,

                fontSize:
                    style.fontSize,

                fontWeight:
                    style.fontWeight,

                padding:
                    style.padding,

                border:
                    style.border,
            };
        })
        .slice(0, 30);

    /*
     * --------------------------------
     * Forms
     * --------------------------------
     */

    const forms = document.querySelectorAll("form");

    const inputs = document.querySelectorAll(
        "input, textarea, select"
    );

    /*
     * --------------------------------
     * Layout
     * --------------------------------
     */

    const bodyStyle = window.getComputedStyle(
        document.body
    );

    const headingElements = Array.from(
        document.querySelectorAll("h1, h2, h3")
    );

    const headingStyles = headingElements
        .slice(0, 20)
        .map((heading) => {
            const style = window.getComputedStyle(
                heading
            );

            return {
                tag: heading.tagName.toLowerCase(),

                fontFamily:
                    style.fontFamily
                        .split(",")[0]
                        .trim()
                        .replace(/['"]/g, ""),

                fontSize:
                    style.fontSize,

                fontWeight:
                    style.fontWeight,

                lineHeight:
                    style.lineHeight,

                color:
                    style.color,

                marginBottom:
                    style.marginBottom,
            };
        });

    /*
     * --------------------------------
     * Border radius
     * --------------------------------
     */

    const radiusUsage = new Map();

    visibleElements.forEach((element) => {
        const style = window.getComputedStyle(element);

        const radius = style.borderRadius;

        if (
            radius &&
            radius !== "0px"
        ) {
            radiusUsage.set(
                radius,
                (radiusUsage.get(radius) || 0) + 1
            );
        }
    });

    const borderRadii = [...radiusUsage.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([value, count]) => ({
            value,
            count,
        }));

    return {
        fonts,
        colors,
        buttons: {
            count: buttons.length,
            styles: buttonStyles,
        },
        forms: {
            count: forms.length,
            inputCount: inputs.length,
        },
        headings: {
            count: headingElements.length,
            styles: headingStyles,
        },
        borderRadii,
        body: {
            backgroundColor:
                bodyStyle.backgroundColor,

            color:
                bodyStyle.color,

            fontFamily:
                bodyStyle.fontFamily
                    .split(",")[0]
                    .trim()
                    .replace(/['"]/g, ""),
        },
    };
}
function detectTechnologies() {
    const technologies = [];

    const html = document.documentElement.outerHTML;
    const scripts = Array.from(document.scripts)
        .map((script) => script.src)
        .filter(Boolean);

    const links = Array.from(document.querySelectorAll("link"))
        .map((link) => link.href)
        .filter(Boolean);

    const resources = [...scripts, ...links].join(" ");

    function addTechnology(name, category, confidence, evidence) {
        technologies.push({
            name,
            category,
            confidence,
            evidence,
        });
    }

    /*
     * --------------------------------
     * Frameworks
     * --------------------------------
     */

    if (
        document.querySelector("#__next") ||
        html.includes("__NEXT_DATA__") ||
        resources.includes("/_next/")
    ) {
        addTechnology(
            "Next.js",
            "Frontend Framework",
            "high",
            "Detected Next.js runtime markers or /_next/ assets."
        );
    }

    if (
        window.React ||
        html.includes("data-reactroot") ||
        html.includes("__REACT_DEVTOOLS_GLOBAL_HOOK__")
    ) {
        addTechnology(
            "React",
            "Frontend Framework",
            "medium",
            "Detected React-related runtime or DOM markers."
        );
    }

    if (
        window.Vue ||
        html.includes("data-v-") ||
        resources.includes("vue")
    ) {
        addTechnology(
            "Vue",
            "Frontend Framework",
            "medium",
            "Detected Vue-related DOM or asset markers."
        );
    }

    if (
        html.includes("ng-version") ||
        resources.includes("@angular/")
    ) {
        addTechnology(
            "Angular",
            "Frontend Framework",
            "high",
            "Detected Angular DOM or asset markers."
        );
    }

    /*
     * --------------------------------
     * CMS / Ecommerce
     * --------------------------------
     */

    if (
        html.includes("wp-content") ||
        html.includes("wp-includes") ||
        resources.includes("wp-content") ||
        resources.includes("wp-includes")
    ) {
        addTechnology(
            "WordPress",
            "CMS",
            "high",
            "Detected WordPress asset paths."
        );
    }

    if (
        html.includes("cdn.shopify.com") ||
        resources.includes("cdn.shopify.com") ||
        html.includes("Shopify.theme")
    ) {
        addTechnology(
            "Shopify",
            "Ecommerce",
            "high",
            "Detected Shopify CDN or runtime markers."
        );
    }

    if (
        html.includes("webflow") ||
        resources.includes("webflow")
    ) {
        addTechnology(
            "Webflow",
            "Website Builder",
            "medium",
            "Detected Webflow asset or HTML markers."
        );
    }

    if (
        html.includes("wix.com") ||
        resources.includes("wixstatic.com")
    ) {
        addTechnology(
            "Wix",
            "Website Builder",
            "high",
            "Detected Wix asset markers."
        );
    }

    /*
     * --------------------------------
     * CSS / UI
     * --------------------------------
     */

    const classNames = Array.from(
        document.querySelectorAll("[class]")
    )
        .map((element) => element.className)
        .join(" ");

    const classTokens = classNames
        .split(/\s+/)
        .filter(Boolean);

    const tailwindPatterns = [
        /^sm:/,
        /^md:/,
        /^lg:/,
        /^xl:/,
        /^2xl:/,
        /^hover:/,
        /^focus:/,
        /^dark:/,
        /^max-w-\[/,
        /^min-h-\[/,
        /^grid-cols-/,
        /^gap-/,
        /^space-[xy]-/,
        /^rounded-(none|sm|md|lg|xl|2xl|full)/,
        /^shadow-(sm|md|lg|xl|2xl)/,
        /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/,
        /^bg-(transparent|white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-/,
        /^px-\d+/,
        /^py-\d+/,
        /^mx-\d+/,
        /^my-\d+/,
        /^mt-\d+/,
        /^mb-\d+/,
        /^ml-\d+/,
        /^mr-\d+/,
        /^items-/,
        /^justify-/,
        /^content-/,
        /^font-/,
    ];

    const tailwindMatches = classTokens.filter((token) =>
        tailwindPatterns.some((pattern) => pattern.test(token))
    );

    const uniqueTailwindMatches = [
        ...new Set(tailwindMatches),
    ];

    if (uniqueTailwindMatches.length >= 6) {
        addTechnology(
            "Tailwind CSS",
            "CSS Framework",
            "medium",
            `Detected ${uniqueTailwindMatches.length} Tailwind-style utility patterns.`
        );
    }

    if (
        html.includes("bootstrap") ||
        resources.includes("bootstrap")
    ) {
        addTechnology(
            "Bootstrap",
            "CSS Framework",
            "medium",
            "Detected Bootstrap stylesheet or asset references."
        );
    }

    /*
     * --------------------------------
     * Analytics
     * --------------------------------
     */

    if (
        html.includes("googletagmanager.com") ||
        resources.includes("googletagmanager.com")
    ) {
        addTechnology(
            "Google Tag Manager",
            "Analytics",
            "high",
            "Detected Google Tag Manager assets."
        );
    }

    if (
        html.includes("google-analytics.com") ||
        html.includes("gtag(") ||
        html.includes("GoogleAnalyticsObject")
    ) {
        addTechnology(
            "Google Analytics",
            "Analytics",
            "high",
            "Detected Google Analytics runtime markers."
        );
    }

    if (
        html.includes("connect.facebook.net") ||
        resources.includes("connect.facebook.net") ||
        html.includes("fbq(")
    ) {
        addTechnology(
            "Meta Pixel",
            "Analytics",
            "high",
            "Detected Meta Pixel runtime markers."
        );
    }

    /*
     * --------------------------------
     * Infrastructure
     * --------------------------------
     */

    if (
        resources.includes("cloudflare") ||
        html.includes("cf-ray") ||
        html.includes("__cf_")
    ) {
        addTechnology(
            "Cloudflare",
            "Infrastructure",
            "medium",
            "Detected Cloudflare-related assets or runtime markers."
        );
    }

    if (
        resources.includes("vercel") ||
        html.includes("vercel")
    ) {
        addTechnology(
            "Vercel",
            "Infrastructure",
            "medium",
            "Detected Vercel-related asset markers."
        );
    }

    if (
        resources.includes("netlify") ||
        html.includes("netlify")
    ) {
        addTechnology(
            "Netlify",
            "Infrastructure",
            "medium",
            "Detected Netlify-related asset markers."
        );
    }

    /*
     * --------------------------------
     * Fonts
     * --------------------------------
     */

    if (
        resources.includes("fonts.googleapis.com") ||
        resources.includes("fonts.gstatic.com")
    ) {
        addTechnology(
            "Google Fonts",
            "Fonts",
            "high",
            "Detected Google Fonts resources."
        );
    }

    return technologies;
}

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.type !== "GET_PAGE_INFO") {
            return;
        }

        const pageInfo = {
            url: window.location.href,
            title: document.title,
            description:
                document
                    .querySelector('meta[name="description"]')
                    ?.getAttribute("content") || "",

            technologies: detectTechnologies(),

            ux: analyzeUX(),
        };

        console.log(
            "SiteLens page information:",
            pageInfo
        );

        sendResponse({
            success: true,
            data: pageInfo,
        });
    }
);
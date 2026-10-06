console.log("SiteLens content script loaded");

const pageInfo = {
    url: window.location.href,
    title: document.title,
    description:
        document
            .querySelector('meta[name="description"]')
            ?.getAttribute("content") || "",
};

console.log("SiteLens page information:", pageInfo);
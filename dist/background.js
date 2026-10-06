chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.windowId) {
        return;
    }

    await chrome.sidePanel.open({
        windowId: tab.windowId,
    });
});
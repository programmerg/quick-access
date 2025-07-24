chrome.runtime.onInstalled.addListener((details) => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        // chrome.tabs.create({ url: "index.html" });
        // chrome.runtime.setUninstallURL('https://programmerg.github.io/quick-access/');
    }
});
chrome.runtime.onInstalled.addListener((details) => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.runtime.setUninstallURL('https://example.com/extension-survey');
    }
});
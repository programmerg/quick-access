if (typeof browser === 'undefined') {
  window.browser = chrome ?? {};
}

browser.runtime?.onInstalled.addListener((details) => {
    browser.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true });

    if (details.reason === browser.runtime?.OnInstalledReason.INSTALL) {
        // browser.tabs?.create({ url: "index.html" });
        // browser.runtime?.setUninstallURL('https://programmerg.github.io/quick-access/');
    }
});
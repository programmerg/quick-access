if (typeof browser === 'undefined') {
  browser = chrome ?? {};
}

browser.runtime?.onInstalled.addListener((details) => {
    browser.sidePanel?.setPanelBehavior({ openPanelOnActionClick: true });

    if (details.reason === browser.runtime?.OnInstalledReason.INSTALL) {
        // browser.tabs?.create({ url: "index.html" });
        // browser.runtime?.setUninstallURL('https://programmerg.github.io/quick-access/');
    }
});

if (/(Opera|OPR)/i.test(navigator.userAgent)) {
    browser.tabs?.onCreated.addListener((tab) => {
        if (
            (tab.pendingUrl && String(tab.pendingUrl).startsWith('chrome://startpage')) || 
            (tab.url && String(tab.url).startsWith('chrome://startpage'))
        ) {
            browser.tabs?.update(tab.id, { url: "index.html" });
        }
    });
}
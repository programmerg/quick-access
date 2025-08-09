export class Permission {

    static defaults = [
        'topSites',
        'history',
        'bookmarks',
        'readingList',
        'tabGroups',
    ];

    static async hasAccessTo(permissions) {
        const result = await browser.permissions?.contains({ permissions });
        return result;
    }

    static async all() {
        const results = await browser.permissions?.getAll();
        return results?.permissions;
    }

    static async request(permissions) {
        await browser.permissions?.request({ permissions });
    }
    
    static async remove(permissions) {
        await browser.permissions?.remove({ permissions });
    }
}
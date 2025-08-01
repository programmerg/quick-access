export class Permission {

    static defaults = [
        'history',
        'bookmarks',
        'readingList',
        'tabGroups',
    ];

    static async hasAccessTo(permissions) {
        return await chrome.permissions.contains({ permissions });
    }

    static async all() {
        return (await chrome.permissions.getAll())?.permissions;
    }

    static async request(permissions) {
        return await chrome.permissions.request({ permissions });
    }
    
    static async remove(permissions) {
        return await chrome.permissions.remove({ permissions });
    }
}
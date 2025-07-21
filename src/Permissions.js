export class Permissions {

    static defaults = [
        'bookmarks',
        'readingList',
        'tabGroups',
    ];

    static async hasAccessTo(permissions) {
        return await chrome.permissions.contains({ permissions });
    }

    static async all() {
        return await chrome.permissions.getAll();
    }

    static async request(permissions) {
        return await chrome.permissions.request({ permissions });
    }
    
    static async remove(permissions) {
        return await chrome.permissions.remove({ permissions });
    }
}
export class TopSite {

    constructor({ url, title }) {
        this.title = title;
        this.url = url;         // pkey
    }

    static async all() {
        return await this.find();
    }

    static async list() {
        return [
            { id: '', title: chrome.i18n.getMessage('root_folder') },
        ];
    }

    static async find(parentId = '') {
        if (parentId !== '') return [];
        return await chrome.topSites.get();
    }

    static async get(url) {
        return (await this.find('')).find(item => item.url === url);
    }

    async save({ title, url }) {
        // not availabe
    }

    async remove() {
        // not available
    }

    open() {
        window.location.assign(this.url);
    }

}
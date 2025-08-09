export class TopSite {

    constructor({ url, title }) {
        this.title = title;
        this.url = url;         // pkey
    }

    static async all() {
        const results = await this.find();
        return results;
    }

    static async list() {
        return [
            new this({ id: '', title: browser.i18n?.getMessage('root_folder') }),
        ];
    }

    static async find(parentId = '') {
        if (parentId !== '') return [];

        const results = await browser.topSites?.get();
        return results.map(item => new this(item)) ?? [];
    }

    static async get(url) {
        const result = await this.find('');
        return result.find(item => item.url === url);
    }

    async save({ title, url }) {
        // not availabe
        return this;
    }

    async remove() {
        // not available
    }

    async open(newTab = false) {
        window.open(this.url, newTab ? '_blank' : '_self');
    }

}
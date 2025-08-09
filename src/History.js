export class History {

    constructor({url, title, id, lastVisitTime, children, typedCount, visitCount}) {
        this.title = title;
        this.url = url;
        this.id = url ?? id;
        this.index = null;
        this.parentId = (new Date(lastVisitTime)).setHours(0,0,0,0);
        this.createdAt = lastVisitTime;
        this.updatedAt = lastVisitTime;
        this.color = null;
        this.children = children;
        this.typedCount = typedCount;
        this.visitCount = visitCount;
    }

    static async all() {
        const results = await browser.history?.search({ text: '' });
        return results.map(item => new this(item)) ?? [];
    }

    static async list() {
        const results = new Array(30).fill();
        return results.map((_, index) => {
            const today = new Date();
            const day = new Date(today.setDate(today.getDate() - index));
            day.setHours(0,0,0,0);
            return { id: day.getTime(), title: day.toLocaleDateString() };
        });
    }

    static async find(parentId) {
        let results = [];

        if (parentId == '') {
            results = await this.list();

        } else {
            let timestamp  = new Date(parentId);
            const startTime = timestamp.setHours(0,0,0,0);
            const endTime = timestamp.setHours(24,0,0,0);
            results = await browser.history?.search({ text: '', startTime, endTime });
        }
        return results.map(item => new this(item)) ?? [];
    }
    
    static async get(url) {
        const results = await this.all();
        return results
          .filter(item => item.url === url)
          .map(item => new this(item)) ?? [];
    }
      
    async save({ url }) {
        const result = {};

        if (!this.id) { // create
            result = await browser.history?.addUrl({ url });

        } else { // edit
            // history items can't be edited
        }
        return Object.assign(this, result);
    }

    async remove() {
        if (!this.url) {
            const startTime = this.id;
            const endTime = new Date(this.id).setHours(24,0,0,0);
            await browser.history?.deleteRange({ startTime, endTime });

        } else {
            await browser.history?.deleteUrl({ url: this.url })
        }
    }

    async open(newTab = false) {
        window.open(this.url, newTab ? '_blank' : '_self');
    }
}
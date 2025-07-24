export class History {

    constructor({url, title, id, lastVisitTime, typedCount, visitCount}) {
        this.url = url;
        this.title = title;
        this.id = id;
        this.lastVisitTime = lastVisitTime;
        this.typedCount = typedCount;
        this.visitCount = visitCount;
    }

    static async all() {
        return (await chrome.history.search({ text: '' }))
          .map(item => new this(item)) || [];
    }

    static async list() {
        // TODO: implement
    }

    static async find(endTime) {
        return (await chrome.history.search({ endTime: endTime }))
          .map(item => new this(item)) || [];
    }
    
    static async get(url) {
        return (await this.all())
          .filter(item => item.url === url)
          .map(item => new this(item)) || [];
    }
      
    async save({ url }) {
        return await chrome.history.addUrl({ url });
    }

    async remove() {
        if (!this.url) {
            // page groups can't be deleted
        } else {
            return await chrome.history.deleteUrl({ url: this.url })
        }
    }

    open() {
        window.location.assign(this.url);
    }
}
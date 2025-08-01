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
        return (await chrome.history.search({ text: '' }))
          .map(item => new this(item)) || [];
    }

    static async list() {
        return new Array(30).fill().map((_, index) => {
            const today = new Date();
            const day = new Date(today.setDate(today.getDate() - index));
            day.setHours(0,0,0,0);
            return { id: day.getTime(), title: day.toLocaleDateString() };
        });
    }

    static async find(parentId) {
        if (parentId == '') {
            return this.list().map(item => new this(item));
        } else {
            let timestamp  = new Date(parentId);
            const startTime = timestamp.setHours(0,0,0,0);
            const endTime = timestamp.setHours(24,0,0,0);
            return (await chrome.history.search({ text: '', startTime, endTime }))
                .map(item => new this(item)) || [];
        }
    }
    
    static async get(url) {
        return (await this.all())
          .filter(item => item.url === url)
          .map(item => new this(item)) || [];
    }
      
    async save({ url }) {
        if (!this.id) {
            return await chrome.history.addUrl({ url });
        } else {
            // history items can't be edited
        }
    }

    async remove() {
        if (!this.url) {
            const startTime = this.id;
            const endTime = new Date(this.id).setHours(24,0,0,0);
            return await chrome.history.deleteRange({ startTime, endTime });

        } else {
            return await chrome.history.deleteUrl({ url: this.url })
        }
    }

    open(newTab = false) {
        window.open(this.url, newTab ? '_blank' : '_self');
    }
}
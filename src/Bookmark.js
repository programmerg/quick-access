export class Bookmark {

    constructor({ title, url, id, index, parentId, dateAdded, dateGroupModified, syncing, children }) {
        this.title = title;         // not null
        this.url = url;
        this.id = id;               // pkey
        this.index = index;
        this.parentId = parentId;
        this.createdAt = dateAdded;
        this.updatedAt = dateGroupModified;
        this.color = null;
        this.children = children;
        this.syncing = syncing;
    }

    static async all() {
        const tree = await browser.bookmarks?.getTree();

        function traverse(nodes) {
            return nodes.map(node => {
                let childrenInstances = [];
                if (node && node.children && node.children.length > 0) {
                    childrenInstances = traverse(node.children);
                }
                return new this({ ...node, children: childrenInstances });
            });
        }
        return traverse(tree ?? []);
    }
    
    static async list() {
        const tree = await browser.bookmarks?.getTree();

        function traverse(nodes, folders = [], level = 0) {
            for (const node of nodes) {
                if (node.url === undefined) {
                    const indentation = ' '.repeat(level * 2);
                    folders.push({ 
                        id: (node.id || '').toString(), 
                        title: indentation + (node.title || browser.i18n?.getMessage('root_folder')) 
                    });
                    if (node && node.children) traverse(node.children, folders, level + 1);
                }
            }
            return folders;
        }
        return traverse(tree ?? []);
    }

    static async find(parentId = '') {
        const isFirefox = navigator.userAgent.indexOf("Firefox") != -1;
        if (parentId === '' && !isFirefox) parentId = 0;

        const results = await browser.bookmarks?.getChildren(parentId.toString());
        return results.map(item => new this(item)) ?? [];
    }

    static async get(id) {
        const result = await browser.bookmarks?.get(id.toString());
        return new this(result);
    }

    async save({ title, url, parentId, index }) {
        let result = {};

        if (!this.id) { // create
            result = await browser.bookmarks?.create({ title, url, parentId });

        } else { // update
            if (index || parentId) { // move or reorder
                result = await browser.bookmarks?.move(this.id, { parentId: parentId ?? this.parentId, index });
            }
            
            if (title || url) { // edit
                result = await browser.bookmarks?.update(this.id, { title, url });
            }
        }
        return Object.assign(this, result);
    }

    async remove() {
        if (!this.url) { // bookmark group
            await browser.bookmarks?.removeTree(this.id);
        } else {
            await browser.bookmarks?.remove(this.id);
        }     
    }

    async open(newTab = false) {
        window.open(this.url, newTab ? '_blank' : '_self');
    }
}
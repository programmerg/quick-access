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
        function traverse(nodes) {
            return nodes.map(node => {
                let childrenInstances = [];
                if (node.children && node.children.length > 0) {
                    childrenInstances = traverse(node.children);
                }
                return new this({ ...node, children: childrenInstances });
            });
        }
        return traverse(await chrome.bookmarks.getTree());
    }
    
    static async list() {
        function traverse(nodes, folders = [], level = 0) {
            for (const node of nodes) {
                if (node.url === undefined) {
                    const indentation = ' '.repeat(level * 2);
                    folders.push({ 
                        id: (node.id || '').toString(), 
                        title: indentation + (node.title || chrome.i18n.getMessage('root_folder')) 
                    });
                    if (node.children) traverse(node.children, folders, level + 1);
                }
            }
            return folders;
        }
        return traverse(await chrome.bookmarks.getTree());
    }

    static async find(parentId = '') {
        if (parentId === '') parentId = 0;
        return (await chrome.bookmarks.getChildren(parentId.toString()))
            .map(item => new this(item)) || [];
    }

    static async get(id) {
        return await chrome.bookmarks.get(id.toString());
    }

    async save({ title, url, parentId, index }) {
        if (!this.id) { // create
            await chrome.bookmarks.create({ title, url, parentId });

        } else { // update
            if (index || parentId) { // move or reorder
                await chrome.bookmarks.move(this.id, { parentId: parentId ?? this.parentId, index });
            }
            
            if (title || url) { // edit
                await chrome.bookmarks.update(this.id, { title, url });
            }
        }
    }

    async remove() {
        if (!this.url) { // bookmark group
            await chrome.bookmarks.removeTree(this.id);
        } else {
            await chrome.bookmarks.remove(this.id);
        }     
    }

    open(newTab = false) {
        window.open(this.url, newTab ? '_blank' : '_self');
    }
}
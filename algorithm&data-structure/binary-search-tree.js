class BinarySearchTree {

    constructor() {
        this.root = null;
    }

    insert(data) {
        let n = new Node(data, null, null);
        if (!this.root) {
            return this.root = n;
        }
        let currentNode = this.root;
        let parent = null;
        while (1) {
            parent = currentNode;
            if (data < currentNode.data) {
                currentNode = currentNode.left;
                if (currentNode === null) {
                    parent.left = n;
                    break;
                }
            } else {
                currentNode = currentNode.right;
                if (currentNode === null) {
                    parent.right = n;
                    break;
                }
            }
        }
    }

    remove(data) {
        this.root = this.removeNode(this.root, data)
    }

    removeNode(node, data) {
        if (node == null) {
            return null;
        }

        if (data == node.data) {
            // no children node
            if (node.left == null && node.right == null) {
                return null;
            }
            if (node.left == null) {
                return node.right;
            }
            if (node.right == null) {
                return node.left;
            }

            let getSmallest = function (node) {
                if (node.left === null && node.right == null) {
                    return node;
                }
                if (node.left != null) {
                    return node.left;
                }
                if (node.right !== null) {
                    return getSmallest(node.right);
                }

            }
            let temNode = getSmallest(node.right);
            node.data = temNode.data;
            node.right = this.removeNode(temNode.right, temNode.data);
            return node;

        } else if (data < node.data) {
            node.left = this.removeNode(node.left, data);
            return node;
        } else {
            node.right = this.removeNode(node.right, data);
            return node;
        }
    }

    find(data) {
        var current = this.root;
        while (current != null) {
            if (data == current.data) {
                break;
            }
            if (data < current.data) {
                current = current.left;
            } else {
                current = current.right
            }
        }
        return current.data;
    }

}


module.exports = BinarySearchTree;
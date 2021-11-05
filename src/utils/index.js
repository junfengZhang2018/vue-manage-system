export default {
    storage: {
        //存储
        set(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },
        //取出数据
        get(key) {
            return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null;
        },
        // 删除数据
        remove(key) {
            localStorage.removeItem(key);
        }
    },
}
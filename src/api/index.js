import request from '../utils/request';

export const login = data => {
    return request({
        url: '/public/login',
        method: 'post',
        data
    });
};

export const getMsg = data => {
    return request({
        url: '/msg/list',
        method: 'post',
        data
    });
};

export const delMsg = data => {
    return request({
        url: '/msg/delete',
        method: 'post',
        data
    });
};

export const updateMsg = data => {
    return request({
        url: '/msg/update',
        method: 'post',
        data
    });
};

export const addMsg = data => {
    return request({
        url: '/msg/add',
        method: 'post',
        data
    });
};

export const getProduct = data => {
    return request({
        url: '/product/list',
        method: 'post',
        data,
    });
};

export const delProduct = data => {
    return request({
        url: '/product/delete',
        method: 'post',
        data
    });
};

export const updateProduct = data => {
    return request({
        url: '/product/update',
        method: 'post',
        data,
        form: true
    });
};

export const addProduct = data => {
    return request({
        url: '/product/add',
        method: 'post',
        data,
        form: true
    });
};

export const delPic = data => {
    return request({
        url: '/common/delete-img',
        method: 'post',
        data
    });
};
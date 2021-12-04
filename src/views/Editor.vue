<template>
    <div>
        <!-- <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-calendar"></i> 表单
                </el-breadcrumb-item>
                <el-breadcrumb-item>富文本编辑器</el-breadcrumb-item>
            </el-breadcrumb>
        </div> -->
        <div class="container">
            <!-- <div class="plugins-tips">
                wangEditor：轻量级 web 富文本编辑器，配置方便，使用简单。
                访问地址：
                <a href="https://www.wangeditor.com/doc/" target="_blank">wangEditor</a>
            </div> -->
            <div class="mgb20" ref='editor'></div>
            <!-- <el-button type="primary" @click="syncHTML">提交</el-button> -->
        </div>
    </div>
</template>

<script>
import WangEditor from "wangEditor";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { delPic } from "@/api/index";
export default {
    name: "editor",
    props: ['info'],
    setup(props, { emit }) {
        const editor = ref();
        let instance;
        // 所有上传的图片数组
        let allUploaded = [],
            startUploaded = [];
        const onchange = (html) => {
            // html 即变化之后的内容
            emit('update:info', html);
            console.log(html);
        }
        // 发送删除文件请求
        const deleteImage = (fileArr) => {
            delPic({ fileArr });
        }
        /**
        * 取出区域内所有img的src
        */
        const getSrc = (html) => {
            var imgReg = /<img.*?(?:>|\/>)/gi
            // 匹配src属性
            var srcReg = /src=[\\"]?([^\\"]*)[\\"]?/i
            var arr = html.match(imgReg)
            let imgs = []
            if (arr) {
                for (let i = 0; i < arr.length; i++) {
                    var src = arr[i].match(srcReg)[1]
                    imgs.push(src)
                }
            }
            return imgs
        }

        const diff = (a, b) => a.filter(function (val) { return b.indexOf(val) === -1 });

        const confirmContent = () => {
            const confirmImg = getSrc(instance.txt.html());
            let diffArr = diff(startUploaded.concat(allUploaded), confirmImg);
            if (diffArr.length) {
                diffArr = diffArr.map(item => {
                    const [ , filename ] = item.split('/public');
                    return filename;
                })
                deleteImage(diffArr);
            }
        }

        const cancelContent = () => {
            allUploaded = allUploaded.map(item => {
                const [ , filename ] = item.split('/public');
                return filename;
            })
            if (allUploaded.length) {
                deleteImage(allUploaded);
            }
        }

        onMounted(() => {
            instance = new WangEditor(editor.value);
            instance.config.excludeMenus = [
                'video',
                'table',
                'code',
            ];
            instance.config.zIndex = 1;
            instance.config.uploadImgMaxLength = 1;
            instance.config.uploadImgServer = `${import.meta.env.VITE_API}/common/upload-img`;
            instance.config.uploadFileName = 'image';
            instance.config.pasteIgnoreImg = true;
            instance.config.uploadImgHeaders = {
                token: localStorage.getItem('token')
            }
            instance.config.uploadImgHooks = {
                // 图片上传并返回了结果，图片插入已成功
                success: function(xhr) {
                    const { errno, data: [{url}] } = JSON.parse(xhr.response);
                    if (errno === 0) {
                        allUploaded.push(url);
                    }
                },
            }
            instance.config.onchange = function (html) {
                onchange(html)
            };
            instance.create();
            if (props.info) {
                instance.txt.html(props.info);
                startUploaded = getSrc(instance.txt.html());
            }
        });
        onBeforeUnmount(() => {
            instance.destroy();
            instance = null;
        });
        return {
            editor,
            confirmContent,
            cancelContent
        };
    },
};
</script>

<style>
</style>
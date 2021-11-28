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
            <el-button type="primary" @click="syncHTML">提交</el-button>
        </div>
    </div>
</template>

<script>
import WangEditor from "wangEditor";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
export default {
    name: "editor",
    setup() {
        const editor = ref(null);
        const content = reactive({
            html: "",
            text: "",
        });
        let instance;
        // 图片数组
        let imgsrc;
        const onchange = (html) => {
            // html 即变化之后的内容
            if (imgsrc.length !== 0) {
              let nowimgs = getSrc(html)
              let merge = imgsrc.concat(nowimgs).filter(function (v, i, arr) {
                return arr.indexOf(v) === arr.lastIndexOf(v)
              })
              console.log(merge)
              for (let x in merge) {
                let colds = merge[x].split('/')
                console.log('删除文件', colds)
                // this.deleteImage(colds) //服务器删除文件
              }
              imgsrc = nowimgs
            }
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

        onMounted(() => {
            instance = new WangEditor(editor.value);
            instance.config.excludeMenus = [
                'video',
                'table',
                'code',
            ];
            instance.config.zIndex = 1;
            instance.config.uploadImgMaxLength = 1;
            instance.config.uploadImgServer = `${import.meta.env.VITE_API}/product/upload-img`;
            instance.config.uploadFileName = 'image';
            instance.config.uploadImgHeaders = {
                token: localStorage.getItem('token')
            }
            instance.config.uploadImgHooks = {
                // 图片上传并返回了结果，图片插入已成功
                success: function(xhr) {
                    console.log('success', xhr)
                    imgsrc = getSrc(instance.txt.html())
                },
            }
            instance.config.onchange = function (html) {
                onchange(html)
            };
            instance.create();
        });
        onBeforeUnmount(() => {
            instance.destroy();
            instance = null;
        });
        const syncHTML = () => {
            content.html = instance.txt.html();
            console.log(content.html);
        };
        return {
            syncHTML,
            editor,
            content,
        };
    },
};
</script>

<style>
</style>
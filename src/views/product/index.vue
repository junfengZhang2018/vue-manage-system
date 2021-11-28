<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 商品管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.name" placeholder="名称" class="handle-input mr10" clearable></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-button style="margin-bottom: 10px" type="primary" icon="el-icon-circle-plus-outline" @click="add">新增</el-button>
            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
                <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
                <el-table-column prop="name" label="名称"></el-table-column>
                <el-table-column prop="desc" label="描述"></el-table-column>
                <el-table-column prop="oldPrice" label="原价"></el-table-column>
                <el-table-column prop="price" label="折扣价"></el-table-column>
                <el-table-column prop="image" label="主图">
                    <template #default="scope">
                        <el-image v-if="scope.row.image" style="width: 100px; height: 100px" :src="imageUrl + scope.row.image" fit="fill" :preview-src-list="[imageUrl + scope.row.image]"></el-image>
                    </template>
                </el-table-column>
                <el-table-column label="是否在首页展示">
                    <template #default="scope">
                        {{scope.row.homePageShow ? '是' : '否'}}
                    </template>
                </el-table-column>
                <el-table-column prop="updateTime" label="修改时间"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template #default="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑
                        </el-button>
                        <el-button type="text" icon="el-icon-delete" class="red"
                            @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next, jumper" :current-page="query.pageNum"
                    :page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog :title="ifAdd ? '新增' : '编辑'" v-model="editVisible" width="80%" @close="resetForm" v-if="editVisible">
            <el-scrollbar style="height:100%">
                <div style="height:420px;">
                    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
                        <el-form-item label="名称" prop="name">
                            <el-input v-model="form.name" maxlength="30"></el-input>
                        </el-form-item>
                        <el-form-item label="原价" prop="oldPrice">
                            <el-input v-model="form.oldPrice" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="折扣价" prop="price">
                            <el-input v-model="form.price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="是否在首页展示">
                            <el-select v-model="form.homePageShow">
                                <el-option
                                  v-for="item in showOption"
                                  :key="item.value"
                                  :label="item.label"
                                  :value="item.value"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="描述" prop="desc">
                            <el-input v-model="form.desc" type="textarea" :rows="5"></el-input>
                        </el-form-item>
                    </el-form>
                    <ul class="imageField">
                        <li v-for="(item, i) in imageList" :key="i">
                            <p><span v-if="!i" style="color: red">*</span> {{item.name}}</p>
                            <el-upload :ref="'upload'+i" class="avatar-uploader" accept=".jpg,.jpeg,.png" action="#" :file-list="item.fileList" :limit="limit" list-type="picture-card" :on-change="handleChange(i)" :on-remove="handleRemove(i)" :on-preview="handlePictureCardPreview" :auto-upload="false" :multiple="false" :class="{'hide': item.hideUploadEdit}">
                                <i class="el-icon-plus"></i>
                            </el-upload>
                        </li>
                    </ul>
                    <Editor />
                </div>
            </el-scrollbar>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editVisible = false">取 消</el-button>
                    <el-button type="primary" @click="saveEdit">确 定</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog v-model="dialogVisible" custom-class="imgDialog">
            <el-image style="width: 500px" :src="dialogImageUrl" fit="fill" :preview-src-list="[dialogImageUrl]"></el-image>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive, watch, onMounted, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import WangEditor from "wangEditor";
import Editor from '../Editor.vue'
import { getProduct, delProduct, updateProduct, addProduct } from "@/api/index";

export default {
    name: "msg",
    components: {
        Editor
    },
    setup() {
        const router = useRouter();
        const imageUrl = import.meta.env.VITE_IMAGEURL;
        const showOption = [
            { value: 0, label: '否' },
            { value: 1, label: '是' }
        ];
        const formRef = ref(null);
        const rules = {
            name: [
                {
                    required: true,
                    message: "请输入商品名",
                    trigger: "blur",
                },
            ],
            desc: [
                { required: true, message: "请输入商品描述", trigger: "blur" },
            ],
            oldPrice: [
                { required: true, message: "请输入原价", trigger: "blur" },
            ],
            price: [
                { required: true, message: "请输入折扣价", trigger: "blur" },
            ],
        };
        const query = reactive({
            name: '',
            pageNum: 1,
            pageSize: 10,
        });
        const tableData = ref([]);
        const pageTotal = ref(0);
        // 获取表格数据
        const getData = () => {
            getProduct(query).then((res) => {
                tableData.value = res.list;
                pageTotal.value = res.total;
            });
        };
        getData();

        // 查询操作
        const handleSearch = () => {
            query.pageNum = 1;
            getData();
        };
        // 分页导航
        const handlePageChange = (val) => {
            query.pageNum = val;
            getData();
        };

        // 删除操作
        const handleDelete = ({id}) => {
            // 二次确认删除
            ElMessageBox.confirm("确定要删除吗？", "提示", {
                type: "warning",
            })
                .then(() => {
                    delProduct({id}).then(res => {
                        ElMessage.success("删除成功");
                        getData();
                    })
                })
                .catch(() => {});
        };
        // 新增或编辑
        let ifAdd = ref(false);
        // 表格编辑时弹窗和保存
        const editVisible = ref(false);
        let form = reactive({
            name: '',
            desc: '',
            oldPrice: '',
            price: '',
            homePageShow: 0
        });

        let formdata = new FormData();
        const resetForm = () => {
            Object.keys(form).forEach((item) => {
                form[item] = '';
            });
            delete form.id;
            imgField.forEach((item, i) => {
                imageList[i].fileList = [];
                imageList[i].hideUploadEdit = false;
            })
            formdata = new FormData();
        }

        const imgField = ['image', 'detailImage1', 'detailImage2', 'detailImage3'];
        let imageList = reactive([{
            name: '主图',
            hideUploadEdit: false,
            fileList: []
        }, {
            name: '副图1',
            hideUploadEdit: false,
            fileList: []
        }, {
            name: '副图2',
            hideUploadEdit: false,
            fileList: []
        }, {
            name: '副图3',
            hideUploadEdit: false,
            fileList: []
        },
        //  {
        //     name: '副图4',
        //     hideUploadEdit: false,
        //     fileList: []
        // }
        ])
        
        const handleEdit = (row) => {
            // router.push('/product/form');
            ifAdd.value = false;
            Object.keys(form).forEach((item) => {
                form[item] = row[item];
            });
            form.id = row.id;
            imgField.forEach((item, i) => {
                if (row[item]) {
                    imageList[i].fileList.push({ url: imageUrl + row[item] });
                    fieldObj[item] = true;
                    imageList[i].hideUploadEdit = true;
                }
            })
            editVisible.value = true;
        };

        let dialogImageUrl = ref('');
        let dialogVisible = ref(false);

        // 新增
        const add = () => {
            editVisible.value = true;
            ifAdd.value = true;
        }

        const handlePictureCardPreview = (file) => {
            dialogImageUrl.value = file.url;
            dialogVisible.value = true;
        }
        
        let fieldObj = {};
        let limit = ref(1);
        
        const handleRemove = (i) => {
            return (file, fileList) => {
                fieldObj[imgField[i]] = null;
                imageList[i].hideUploadEdit = fileList.length >= limit.value;
            }
        }

        // 保存
        const saveEdit = () => {
            formRef.value.validate(valid => {
                if (valid) {
                    if (!fieldObj.image) {
                        ElMessage.error('请上传主图');
                        return;
                    }
                    let method = ifAdd.value ? addProduct : updateProduct;
                    Object.keys(form).forEach(k => {
                        formdata.append(k, form[k]);
                    })
                    for (let k in fieldObj) {
                        if (fieldObj[k] instanceof File || fieldObj[k] === null) {
                            formdata.append(k, fieldObj[k]);
                        }
                    }
                    method(formdata).then(res => {
                        editVisible.value = false;
                        ElMessage.success(`${ifAdd.value ? '新增' : '修改'}成功`);
                        resetForm();
                        getData();
                    }, err => {
                        formdata = new FormData();
                    })
                }
            })
        };

        // const editor = ref(null);
        // const content = reactive({
        //     html: "",
        //     text: "",
        // });
        // let instance;
        // onMounted(() => {
        //     instance = new WangEditor(editor.value);
        //     instance.config.zIndex = 1;
        //     instance.create();
        // });
        // onBeforeUnmount(() => {
        //     instance.destroy();
        //     instance = null;
        // });
        // const syncHTML = () => {
        //     content.html = instance.txt.html();
        //     console.log(content.html);
        // };

        return {
            imageUrl,
            query,
            tableData,
            pageTotal,
            editVisible,
            form,
            ifAdd,
            limit,
            imageList,
            rules,
            formRef,
            fieldObj,
            imgField,
            handleSearch,
            handlePageChange,
            handleDelete,
            handleEdit,
            saveEdit,
            add,
            resetForm,
            handleRemove,
            handlePictureCardPreview,
            dialogImageUrl,
            dialogVisible,
            showOption,
            // 编辑器
            // syncHTML,
            // editor,
            // content,
        };
    },
    methods: {
        handleChange(i) {
            return (file, fileList) => {
                const isIMG = file.raw.type.includes('image');
                const isLt10M = file.size / 1024 / 1024 < 10;

                if (!isIMG) {
                    ElMessage.error('只能上传图片!');
                    this.$refs['upload'+i].clearFiles();
                    return;
                }
                if (!isLt10M) {
                    ElMessage.error('上传图片大小不能超过 10MB!')
                    this.$refs['upload'+i].clearFiles();
                    return;
                }
                this.fieldObj[this.imgField[i]] = file.raw;
                this.imageList[i].hideUploadEdit = fileList.length >= this.limit;
            }
        }
    }
};
</script>

<style scoped lang="scss">
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.imageField {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    li {
        p {
            text-align: center;
        }
    }
}
</style>
<style>
    .imgDialog {
        display: flex;
        justify-content: center;
    }
</style>
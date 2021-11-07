<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 消息管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.title" placeholder="标题" class="handle-input mr10" clearable></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-button style="margin-bottom: 10px" type="primary" icon="el-icon-circle-plus-outline" @click="add">新增</el-button>
            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
                <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
                <el-table-column prop="title" label="标题"></el-table-column>
                <el-table-column prop="content" label="内容"></el-table-column>
                <el-table-column prop="author" label="修改人"></el-table-column>
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
        <el-dialog :title="ifAdd ? '新增' : '编辑'" v-model="editVisible" width="30%" @close="resetForm">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="70px">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="form.title" maxlength="30"></el-input>
                </el-form-item>
                <el-form-item label="内容" prop="content">
                    <el-input v-model="form.content" type="textarea" :rows="5"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editVisible = false">取 消</el-button>
                    <el-button type="primary" @click="saveEdit">确 定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getMsg, delMsg, updateMsg, addMsg } from "@/api/index";

export default {
    name: "msg",
    setup() {
        const rules = {
            title: [
                {
                    required: true,
                    message: "请输入标题",
                    trigger: "blur",
                },
            ],
            content: [
                { required: true, message: "请输入内容", trigger: "blur" },
            ],
        };
        const formRef = ref(null);
        const query = reactive({
            title: "",
            pageNum: 1,
            pageSize: 10,
        });
        const tableData = ref([]);
        const pageTotal = ref(0);
        // 获取表格数据
        const getData = () => {
            getMsg(query).then((res) => {
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
                    delMsg({id}).then(res => {
                        ElMessage.success("删除成功");
                        getData();
                    })
                })
                .catch(() => {});
        };
        
        // 表格编辑时弹窗和保存
        const editVisible = ref(false);
        let form = reactive({
            title: '',
            content: ''
        });
        let ifAdd = ref(false);
        const resetForm = () => {
            Object.keys(form).forEach((item) => {
                form[item] = '';
            });
            delete form.id;
        }
        
        const handleEdit = (row) => {
            ifAdd.value = false;
            Object.keys(form).forEach((item) => {
                form[item] = row[item];
            });
            form.id = row.id;
            editVisible.value = true;
        };
        // 保存
        const saveEdit = () => {
            formRef.value.validate(valid => {
                if (valid) {
                    let method = ifAdd.value ? addMsg : updateMsg;
                    method(form).then(res => {
                        editVisible.value = false;
                        ElMessage.success(`${ifAdd.value ? '新增' : '修改'}成功`);
                        getData();
                    })
                }
            })
            
        };
        // 新增
        const add = () => {
            editVisible.value = true;
            ifAdd.value = true;
        }
        
        return {
            query,
            tableData,
            pageTotal,
            editVisible,
            form,
            ifAdd,
            rules,
            formRef,
            handleSearch,
            handlePageChange,
            handleDelete,
            handleEdit,
            saveEdit,
            add,
            resetForm,
        };
    },
};
</script>

<style scoped>
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
</style>

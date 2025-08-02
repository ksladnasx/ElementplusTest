<template>
    <div class="employee-management">
        <el-card class="header-card">
            <template #header>
                <div class="card-header">
                    <span class="title">
                        <el-icon>
                            <User />
                        </el-icon>
                        员工管理
                    </span>
                    <div class="header-actions">
                        <el-button type="primary" @click="showAddDialog">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            新增员工
                        </el-button>
                        <el-input v-model="searchKeyword" placeholder="搜索员工姓名" style="width: 200px; margin-left: 10px"
                            clearable>
                            <template #prefix>
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </template>
                        </el-input>
                    </div>
                </div>
            </template>

            <!-- 员工列表 -->
            <el-table :data="filteredEmployees" style="width: 100%" v-loading="loading" empty-text="暂无员工数据">
                <el-table-column prop="name" label="姓名" min-width="120">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="viewEmployeeDetail(row)">
                            {{ row.name }}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="phone" label="电话" min-width="150" />
                <el-table-column prop="createTime" label="创建时间" min-width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.createTime) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="editEmployee(row)">
                            <el-icon>
                                <Edit />
                            </el-icon>
                            编辑
                        </el-button>
                        <el-button type="danger" link @click="deleteEmployee(row)">
                            <el-icon>
                                <Delete />
                            </el-icon>
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 新增/编辑员工对话框 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑员工' : '新增员工'" width="500px"
            :close-on-click-modal="false">
            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入员工姓名" />
                </el-form-item>
                <el-form-item label="电话" prop="phone">
                    <el-input v-model="formData.phone" placeholder="请输入联系电话" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="submitting">
                        {{ isEdit ? '更新' : '确定' }}
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { User, Plus, Search, Edit, Delete } from '@element-plus/icons-vue';
import type { Employee, EmployeeFormData } from '../types';
import { employeeStorage } from '../utils/storage';

// 响应式数据
const loading = ref(false);
const searchKeyword = ref('');
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const employees = ref<Employee[]>([]);
const selectedEmployee = ref<Employee | null>(null);

const formRef = ref<FormInstance>();
const formData = ref<EmployeeFormData>({
    name: '',
    phone: ''
});

// 表单验证规则
const formRules: FormRules = {
    name: [
        { required: true, message: '请输入员工姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ]
};

// 计算属性
const filteredEmployees = computed(() => {
    if (!searchKeyword.value) return employees.value;
    return employees.value.filter(emp =>
        emp.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
});

// 方法
const loadEmployees = () => {
    loading.value = true;
    try {
        employees.value = employeeStorage.getAll();
    } catch (error) {
        ElMessage.error('加载员工数据失败');
    } finally {
        loading.value = false;
    }
};

const showAddDialog = () => {
    isEdit.value = false;
    formData.value = { name: '', phone: '' };
    dialogVisible.value = true;
};

const editEmployee = (employee: Employee) => {
    isEdit.value = true;
    selectedEmployee.value = employee;
    formData.value = { name: employee.name, phone: employee.phone || '' };
    dialogVisible.value = true;
};

const submitForm = async () => {
    if (!formRef.value) return;

    try {
        await formRef.value.validate();
        submitting.value = true;

        if (isEdit.value) {
            // 编辑员工
            const success = employeeStorage.update(selectedEmployee.value!.id, formData.value);
            if (success) {
                ElMessage.success('员工信息更新成功');
            } else {
                ElMessage.error('更新失败');
            }
        } else {
            // 新增员工
            employeeStorage.add(formData.value);
            ElMessage.success('员工添加成功');
        }
        dialogVisible.value = false;
        loadEmployees();
    } catch (error) {
        console.error('表单验证失败:', error);
    } finally {
        submitting.value = false;
    }
};

const deleteEmployee = async (employee: Employee) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除员工 "${employee.name}" 吗？删除后无法恢复。`,
            '确认删除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );

        const success = employeeStorage.delete(employee.id);
        if (success) {
            ElMessage.success('员工删除成功');
            loadEmployees();
        } else {
            ElMessage.error('删除失败');
        }
    } catch {
        // 用户取消删除
    }
};

const viewEmployeeDetail = (employee: Employee) => {
    ElMessage.info(`查看员工详情：${employee.name}`);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
};

// 生命周期
onMounted(() => {
    loadEmployees();
});
</script>

<style scoped>
.employee-management {
    padding: 20px;
}

.header-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.title {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
}

.title .el-icon {
    margin-right: 8px;
}

.header-actions {
    display: flex;
    align-items: center;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>
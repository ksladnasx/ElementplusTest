<template>
    <div class="bill-management">
        <el-card class="header-card">
            <template #header>
                <div class="card-header">
                    <span class="title">
                        <el-icon>
                            <Document />
                        </el-icon>
                        账单管理
                    </span>
                    <div class="header-actions">
                        <el-button type="primary" @click="showAddDialog">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            新增账单
                        </el-button>
                        <el-select v-model="selectedEmployeeId" placeholder="选择员工筛选" clearable
                            style="width: 200px; margin-left: 10px">
                            <el-option v-for="employee in employees" :key="employee.id" :label="employee.name"
                                :value="employee.id" />
                        </el-select>
                    </div>
                </div>
            </template>

            <!-- 账单列表 -->
            <el-table :data="filteredBills" style="width: 100%" v-loading="loading" empty-text="暂无账单数据">
                <el-table-column prop="createTime" label="录入时间" min-width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.createTime) }}
                    </template>
                </el-table-column>
                <el-table-column prop="employeeId" label="员工姓名" min-width="120">
                    <template #default="{ row }">
                        {{ getEmployeeName(row.employeeId) }}
                    </template>
                </el-table-column>
                <el-table-column prop="workDays" label="工作天数" width="100" />
                <el-table-column prop="borrowAmount" label="借款金额" width="120">
                    <template #default="{ row }">
                        <span class="text-danger">{{ formatMoney(row.borrowAmount) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="receiveAmount" label="得款金额" width="120">
                    <template #default="{ row }">
                        <span class="text-success">{{ formatMoney(row.receiveAmount) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" min-width="150" />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button type="danger" link @click="deleteBill(row)">
                            <el-icon>
                                <Delete />
                            </el-icon>
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 新增账单对话框 -->
        <el-dialog v-model="dialogVisible" title="新增账单" width="500px" :close-on-click-modal="false">
            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
                <el-form-item label="选择员工" prop="employeeId">
                    <el-select v-model="formData.employeeId" placeholder="请选择员工" style="width: 100%">
                        <el-option v-for="employee in employees" :key="employee.id" :label="employee.name"
                            :value="employee.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="工作天数" prop="workDays">
                    <el-input-number v-model="formData.workDays" :min="0" :max="365" style="width: 100%"
                        placeholder="请输入工作天数" />
                </el-form-item>
                <el-form-item label="借款金额" prop="borrowAmount">
                    <el-input-number v-model="formData.borrowAmount" :min="0" :precision="2" style="width: 100%"
                        placeholder="请输入借款金额" />
                </el-form-item>
                <el-form-item label="得款金额" prop="receiveAmount">
                    <el-input-number v-model="formData.receiveAmount" :min="0" :precision="2" style="width: 100%"
                        placeholder="请输入得款金额" />
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注信息（可选）" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="submitting">
                        确定
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Document, Plus, Delete } from '@element-plus/icons-vue';
import type { BillRecord, BillFormData, Employee } from '../types';
import { billStorage, employeeStorage } from '../utils/storage';

// 响应式数据
const loading = ref(false);
const dialogVisible = ref(false);
const submitting = ref(false);
const bills = ref<BillRecord[]>([]);
const employees = ref<Employee[]>([]);
const selectedEmployeeId = ref('');

const formRef = ref<FormInstance>();
const formData = ref<BillFormData>({
    employeeId: '',
    workDays: 0,
    borrowAmount: 0,
    receiveAmount: 0,
    remark: ''
});

// 表单验证规则
const formRules: FormRules = {
    employeeId: [
        { required: true, message: '请选择员工', trigger: 'change' }
    ],
    workDays: [
        { required: true, message: '请输入工作天数', trigger: 'blur' },
        { type: 'number', min: 0, message: '工作天数不能小于0', trigger: 'blur' }
    ],
    borrowAmount: [
        { required: true, message: '请输入借款金额', trigger: 'blur' },
        { type: 'number', min: 0, message: '借款金额不能小于0', trigger: 'blur' }
    ],
    receiveAmount: [
        { required: true, message: '请输入得款金额', trigger: 'blur' },
        { type: 'number', min: 0, message: '得款金额不能小于0', trigger: 'blur' }
    ]
};

// 计算属性
const filteredBills = computed(() => {
    if (!selectedEmployeeId.value) return bills.value;
    return bills.value.filter(bill => bill.employeeId === selectedEmployeeId.value);
});

// 方法
const loadData = () => {
    loading.value = true;
    try {
        bills.value = billStorage.getAll();
        employees.value = employeeStorage.getAll();
    } catch (error) {
        ElMessage.error('加载数据失败');
    } finally {
        loading.value = false;
    }
};

const showAddDialog = () => {
    if (employees.value.length === 0) {
        ElMessage.warning('请先添加员工');
        return;
    }

    formData.value = {
        employeeId: '',
        workDays: 0,
        borrowAmount: 0,
        receiveAmount: 0,
        remark: ''
    };
    dialogVisible.value = true;
};

const submitForm = async () => {
    if (!formRef.value) return;

    try {
        await formRef.value.validate();
        submitting.value = true;

        billStorage.add(formData.value);
        ElMessage.success('账单添加成功');
        dialogVisible.value = false;
        loadData();
    } catch (error) {
        console.error('表单验证失败:', error);
    } finally {
        submitting.value = false;
    }
};

const deleteBill = async (bill: BillRecord) => {
    try {
        await ElMessageBox.confirm(
            '确定要删除这条账单记录吗？删除后无法恢复。',
            '确认删除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );

        const success = billStorage.delete(bill.id);
        if (success) {
            ElMessage.success('账单删除成功');
            loadData();
        } else {
            ElMessage.error('删除失败');
        }
    } catch {
        // 用户取消删除
    }
};

const getEmployeeName = (employeeId: string) => {
    const employee = employees.value.find(emp => emp.id === employeeId);
    return employee ? employee.name : '未知员工';
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
};

const formatMoney = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
};

// 生命周期
onMounted(() => {
    loadData();
});
</script>

<style scoped>
.bill-management {
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

.text-success {
    color: #67c23a;
}

.text-danger {
    color: #f56c6c;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>
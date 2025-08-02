<template>
    <div class="statistics">
        <!-- 总体统计 -->
        <el-row :gutter="20" class="stats-row">
            <el-col :span="6">
                <el-card class="stat-card">
                    <div class="stat-item">
                        <div class="stat-icon">
                            <el-icon>
                                <User />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ totalEmployees }}</div>
                            <div class="stat-label">员工总数</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card">
                    <div class="stat-item">
                        <div class="stat-icon">
                            <el-icon>
                                <Document />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ totalBills }}</div>
                            <div class="stat-label">账单总数</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card">
                    <div class="stat-item">
                        <div class="stat-icon">
                            <el-icon>
                                <Money />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value text-danger">{{ formatMoney(totalBorrowAmount) }}</div>
                            <div class="stat-label">总借款金额</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card">
                    <div class="stat-item">
                        <div class="stat-icon">
                            <el-icon>
                                <Wallet />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value text-success">{{ formatMoney(totalReceiveAmount) }}</div>
                            <div class="stat-label">总得款金额</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 员工统计表格 -->
        <el-card class="employee-stats-card">
            <template #header>
                <div class="card-header">
                    <span class="title">
                        <el-icon>
                            <DataAnalysis />
                        </el-icon>
                        员工统计详情
                    </span>
                    <div class="header-actions">
                        <el-input v-model="searchKeyword" placeholder="搜索员工姓名" style="width: 200px" clearable>
                            <template #prefix>
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </template>
                        </el-input>
                    </div>
                </div>
            </template>

            <el-table :data="filteredEmployeeStats" style="width: 100%" v-loading="loading" empty-text="暂无员工数据">
                <el-table-column prop="employee.name" label="员工姓名" min-width="120">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="viewEmployeeDetail(row.employee)">
                            {{ row.employee.name }}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="totalWorkDays" label="总工作天数" width="120" />
                <el-table-column prop="totalBorrowAmount" label="总借款金额" width="140">
                    <template #default="{ row }">
                        <span class="text-danger">{{ formatMoney(row.totalBorrowAmount) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="totalReceiveAmount" label="总得款金额" width="140">
                    <template #default="{ row }">
                        <span class="text-success">{{ formatMoney(row.totalReceiveAmount) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="balance" label="余额" width="140">
                    <template #default="{ row }">
                        <span :class="row.balance >= 0 ? 'text-success' : 'text-danger'">
                            {{ formatMoney(row.balance) }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="viewEmployeeDetail(row.employee)">
                            <el-icon>
                                <View />
                            </el-icon>
                            查看详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 员工详情对话框 -->
        <el-dialog v-model="detailDialogVisible" title="员工详情" width="800px">
            <div v-if="selectedEmployee" class="employee-detail">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="姓名">
                        {{ selectedEmployee.name }}
                    </el-descriptions-item>
                    <el-descriptions-item label="电话">
                        {{ selectedEmployee.phone || '未填写' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="创建时间">
                        {{ formatDate(selectedEmployee.createTime) }}
                    </el-descriptions-item>
                </el-descriptions>

                <!-- 员工账单统计 -->
                <div class="stats-section">
                    <h3>账单统计</h3>
                    <el-row :gutter="20">
                        <el-col :span="6">
                            <el-card class="stat-card">
                                <div class="stat-item">
                                    <div class="stat-value">{{ employeeStats.totalWorkDays }}</div>
                                    <div class="stat-label">总工作天数</div>
                                </div>
                            </el-card>
                        </el-col>
                        <el-col :span="6">
                            <el-card class="stat-card">
                                <div class="stat-item">
                                    <div class="stat-value text-danger">{{ formatMoney(employeeStats.totalBorrowAmount)
                                        }}</div>
                                    <div class="stat-label">总借款金额</div>
                                </div>
                            </el-card>
                        </el-col>
                        <el-col :span="6">
                            <el-card class="stat-card">
                                <div class="stat-item">
                                    <div class="stat-value text-success">{{
                                        formatMoney(employeeStats.totalReceiveAmount) }}
                                    </div>
                                    <div class="stat-label">总得款金额</div>
                                </div>
                            </el-card>
                        </el-col>
                        <el-col :span="6">
                            <el-card class="stat-card">
                                <div class="stat-item">
                                    <div class="stat-value"
                                        :class="employeeStats.balance >= 0 ? 'text-success' : 'text-danger'">
                                        {{ formatMoney(employeeStats.balance) }}
                                    </div>
                                    <div class="stat-label">余额</div>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>

                <!-- 账单记录列表 -->
                <div class="bills-section">
                    <h3>账单记录</h3>
                    <el-table :data="employeeBills" style="width: 100%">
                        <el-table-column prop="createTime" label="日期" width="120">
                            <template #default="{ row }">
                                {{ formatDate(row.createTime) }}
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
                        <el-table-column prop="remark" label="备注" />
                    </el-table>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
    User, Document, Money, Wallet, DataAnalysis, Search, View
} from '@element-plus/icons-vue';
import type { Employee } from '../types';
import { employeeStorage, billStorage } from '../utils/storage';

// 响应式数据
const loading = ref(false);
const searchKeyword = ref('');
const detailDialogVisible = ref(false);
const selectedEmployee = ref<Employee | null>(null);
const employeeBills = ref<any[]>([]);
const employeeStats = ref({
    totalWorkDays: 0,
    totalBorrowAmount: 0,
    totalReceiveAmount: 0,
    balance: 0
});

const employees = ref<Employee[]>([]);
const bills = ref<any[]>([]);

// 计算属性
const totalEmployees = computed(() => employees.value.length);
const totalBills = computed(() => bills.value.length);
const totalBorrowAmount = computed(() =>
    bills.value.reduce((sum, bill) => sum + bill.borrowAmount, 0)
);
const totalReceiveAmount = computed(() =>
    bills.value.reduce((sum, bill) => sum + bill.receiveAmount, 0)
);

const employeeStatsList = computed(() => {
    return employees.value.map(employee => {
        const employeeBills = bills.value.filter(bill => bill.employeeId === employee.id);
        const totalWorkDays = employeeBills.reduce((sum, bill) => sum + bill.workDays, 0);
        const totalBorrowAmount = employeeBills.reduce((sum, bill) => sum + bill.borrowAmount, 0);
        const totalReceiveAmount = employeeBills.reduce((sum, bill) => sum + bill.receiveAmount, 0);
        const balance = totalReceiveAmount - totalBorrowAmount;

        return {
            employee,
            totalWorkDays,
            totalBorrowAmount,
            totalReceiveAmount,
            balance
        };
    });
});

const filteredEmployeeStats = computed(() => {
    if (!searchKeyword.value) return employeeStatsList.value;
    return employeeStatsList.value.filter(stat =>
        stat.employee.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
});

// 方法
const loadData = () => {
    loading.value = true;
    try {
        employees.value = employeeStorage.getAll();
        bills.value = billStorage.getAll();
    } catch (error) {
        ElMessage.error('加载数据失败');
    } finally {
        loading.value = false;
    }
};

const viewEmployeeDetail = (employee: Employee) => {
    selectedEmployee.value = employee;
    loadEmployeeStats(employee.id);
    detailDialogVisible.value = true;
};

const loadEmployeeStats = (employeeId: string) => {
    const employeeBillsList = billStorage.getByEmployeeId(employeeId);
    employeeBills.value = employeeBillsList;

    employeeStats.value = employeeBillsList.reduce((stats, bill) => {
        stats.totalWorkDays += bill.workDays;
        stats.totalBorrowAmount += bill.borrowAmount;
        stats.totalReceiveAmount += bill.receiveAmount;
        return stats;
    }, {
        totalWorkDays: 0,
        totalBorrowAmount: 0,
        totalReceiveAmount: 0,
        balance: 0
    });

    employeeStats.value.balance = employeeStats.value.totalReceiveAmount - employeeStats.value.totalBorrowAmount;
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
.statistics {
    padding: 20px;
}

.stats-row {
    margin-bottom: 20px;
}

.stat-card {
    height: 120px;
}

.stat-item {
    display: flex;
    align-items: center;
    height: 100%;
}

.stat-icon {
    font-size: 48px;
    color: #409eff;
    margin-right: 20px;
}

.stat-content {
    flex: 1;
}

.stat-value {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 8px;
}

.stat-label {
    color: #909399;
    font-size: 14px;
}

.employee-stats-card {
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

.employee-detail {
    padding: 20px 0;
}

.stats-section {
    margin: 20px 0;
}

.stats-section h3 {
    margin-bottom: 15px;
    color: #606266;
}

.stat-card {
    text-align: center;
}

.stat-item {
    padding: 10px;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 5px;
}

.stat-label {
    color: #909399;
    font-size: 14px;
}

.bills-section {
    margin-top: 20px;
}

.bills-section h3 {
    margin-bottom: 15px;
    color: #606266;
}

.text-success {
    color: #67c23a;
}

.text-danger {
    color: #f56c6c;
}
</style>
// 员工信息
export interface Employee {
  id: string;
  name: string;
  phone?: string;
  createTime: string;
}

// 账单记录
export interface BillRecord {
  id: string;
  employeeId: string;
  workDays: number;
  borrowAmount: number;
  receiveAmount: number;
  createTime: string;
  remark?: string;
}

// 员工统计信息
export interface EmployeeStats {
  employee: Employee;
  totalWorkDays: number;
  totalBorrowAmount: number;
  totalReceiveAmount: number;
  balance: number; // 余额 = 得款 - 借款
}

// 新增员工表单数据
export interface EmployeeFormData {
  name: string;
  phone: string;
}

// 新增账单表单数据
export interface BillFormData {
  employeeId: string;
  workDays: number;
  borrowAmount: number;
  receiveAmount: number;
  remark: string;
}

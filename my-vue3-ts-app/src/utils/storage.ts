import type { Employee, BillRecord } from "../types";

const EMPLOYEES_KEY = "bill_system_employees";
const BILLS_KEY = "bill_system_bills";

// 员工数据存储
export const employeeStorage = {
  // 获取所有员工
  getAll(): Employee[] {
    try {
      const data = localStorage.getItem(EMPLOYEES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("获取员工数据失败:", error);
      return [];
    }
  },

  // 保存所有员工
  saveAll(employees: Employee[]): void {
    try {
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    } catch (error) {
      console.error("保存员工数据失败:", error);
    }
  },

  // 添加员工
  add(employee: Omit<Employee, "id" | "createTime">): Employee {
    const employees = this.getAll();
    const newEmployee: Employee = {
      ...employee,
      id: generateId(),
      createTime: new Date().toISOString(),
    };
    employees.push(newEmployee);
    this.saveAll(employees);
    return newEmployee;
  },

  // 更新员工
  update(id: string, employee: Partial<Employee>): boolean {
    const employees = this.getAll();
    const index = employees.findIndex((emp) => emp.id === id);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...employee };
      this.saveAll(employees);
      return true;
    }
    return false;
  },

  // 删除员工
  delete(id: string): boolean {
    const employees = this.getAll();
    const filtered = employees.filter((emp) => emp.id !== id);
    if (filtered.length !== employees.length) {
      this.saveAll(filtered);
      return true;
    }
    return false;
  },

  // 根据ID获取员工
  getById(id: string): Employee | undefined {
    const employees = this.getAll();
    return employees.find((emp) => emp.id === id);
  },
};

// 账单数据存储
export const billStorage = {
  // 获取所有账单
  getAll(): BillRecord[] {
    try {
      const data = localStorage.getItem(BILLS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("获取账单数据失败:", error);
      return [];
    }
  },

  // 保存所有账单
  saveAll(bills: BillRecord[]): void {
    try {
      localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
    } catch (error) {
      console.error("保存账单数据失败:", error);
    }
  },

  // 添加账单
  add(bill: Omit<BillRecord, "id" | "createTime">): BillRecord {
    const bills = this.getAll();
    const newBill: BillRecord = {
      ...bill,
      id: generateId(),
      createTime: new Date().toISOString(),
    };
    bills.push(newBill);
    this.saveAll(bills);
    return newBill;
  },

  // 删除账单
  delete(id: string): boolean {
    const bills = this.getAll();
    const filtered = bills.filter((bill) => bill.id !== id);
    if (filtered.length !== bills.length) {
      this.saveAll(filtered);
      return true;
    }
    return false;
  },

  // 根据员工ID获取账单
  getByEmployeeId(employeeId: string): BillRecord[] {
    const bills = this.getAll();
    return bills.filter((bill) => bill.employeeId === employeeId);
  },
};

// 生成唯一ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 数据导出
export const exportData = () => {
  const employees = employeeStorage.getAll();
  const bills = billStorage.getAll();
  const data = { employees, bills, exportTime: new Date().toISOString() };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bill_system_backup_${
    new Date().toISOString().split("T")[0]
  }.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// 数据导入
export const importData = (
  file: File
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.employees && data.bills) {
          employeeStorage.saveAll(data.employees);
          billStorage.saveAll(data.bills);
          resolve({ success: true, message: "数据导入成功" });
        } else {
          resolve({ success: false, message: "文件格式不正确" });
        }
      } catch (error) {
        resolve({ success: false, message: "文件解析失败" });
      }
    };
    reader.readAsText(file);
  });
};

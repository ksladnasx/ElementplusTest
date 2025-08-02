import { createRouter, createWebHistory } from "vue-router";
import EmployeeManagement from "../components/EmployeeManagement.vue";
import BillManagement from "../components/BillManagement.vue";
import Statistics from "../components/Statistics.vue";

const routes = [
  {
    path: "/",
    redirect: "/employees",
  },
  {
    path: "/employees",
    name: "Employees",
    component: EmployeeManagement,
    meta: {
      title: "员工管理",
    },
  },
  {
    path: "/bills",
    name: "Bills",
    component: BillManagement,
    meta: {
      title: "账单管理",
    },
  },
  {
    path: "/statistics",
    name: "Statistics",
    component: Statistics,
    meta: {
      title: "数据统计",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

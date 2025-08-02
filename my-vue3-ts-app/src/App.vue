<template>
  <div id="app" :class="{ 'dark-mode': isDark }">
    <el-container class="app-container">
      <!-- 桌面端侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '250px'" class="sidebar desktop-sidebar">
        <div class="logo">
          <el-icon size="24">
            <Money />
          </el-icon>
          <span v-show="!isCollapse">账单管理系统</span>
        </div>

        <el-menu :default-active="activeMenu" class="sidebar-menu" :router="true" :collapse="isCollapse"
          :background-color="isDark ? '#1a1a1a' : '#ffffff'" :text-color="isDark ? '#e0e0e0' : '#303133'"
          :active-text-color="isDark ? '#409eff' : '#409eff'">
          <el-menu-item index="/employees">
            <el-icon>
              <User />
            </el-icon>
            <span>员工管理</span>
          </el-menu-item>
          <el-menu-item index="/bills">
            <el-icon>
              <Document />
            </el-icon>
            <span>账单管理</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon>
              <DataAnalysis />
            </el-icon>
            <span>数据统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="header">
          <div class="header-left">
            <!-- 移动端菜单按钮 -->
            <el-button type="text" @click="showMobileMenu" class="mobile-menu-btn">
              <el-icon size="20">
                <Menu />
              </el-icon>
            </el-button>
            <!-- 桌面端收起按钮 -->
            <el-button type="text" @click="toggleCollapse" class="collapse-btn desktop-only">
              <el-icon size="20">
                <Fold v-if="!isCollapse" />
                <Expand v-else />
              </el-icon>
            </el-button>
            <el-breadcrumb separator="/" class="breadcrumb">
              <el-breadcrumb-item>首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <div class="header-right">
            <el-dropdown @command="handleDataCommand" class="desktop-only">
              <el-button type="primary" plain>
                <el-icon>
                  <Setting />
                </el-icon>
                数据管理
                <el-icon class="el-icon--right">
                  <ArrowDown />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="export">导出数据</el-dropdown-item>
                  <el-dropdown-item command="import">导入数据</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- 移动端数据管理按钮 -->
            <el-button type="primary" plain @click="showMobileDataMenu" class="mobile-only">
              <el-icon>
                <Setting />
              </el-icon>
            </el-button>

            <ThemeSwitcher v-model:is-dark="isDark" />
          </div>
        </el-header>

        <!-- 主内容 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <!-- 移动端侧边栏抽屉 -->
    <el-drawer v-model="mobileMenuVisible" title="菜单" direction="ltr" size="280px" class="mobile-drawer">
      <div class="mobile-logo">
        <el-icon size="24">
          <Money />
        </el-icon>
        <span>账单管理系统</span>
      </div>
      <el-menu :default-active="activeMenu" class="mobile-menu" :router="true"
        :background-color="isDark ? '#1a1a1a' : '#ffffff'" :text-color="isDark ? '#e0e0e0' : '#303133'"
        :active-text-color="isDark ? '#409eff' : '#409eff'" @select="closeMobileMenu">
        <el-menu-item index="/employees">
          <el-icon>
            <User />
          </el-icon>
          <span>员工管理</span>
        </el-menu-item>
        <el-menu-item index="/bills">
          <el-icon>
            <Document />
          </el-icon>
          <span>账单管理</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon>
            <DataAnalysis />
          </el-icon>
          <span>数据统计</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>

    <!-- 移动端数据管理抽屉 -->
    <el-drawer v-model="mobileDataMenuVisible" title="数据管理" direction="rtl" size="280px">
      <div class="mobile-data-menu">
        <el-button type="primary" @click="handleExport" style="width: 100%; margin-bottom: 15px;">
          <el-icon>
            <Download />
          </el-icon>
          导出数据
        </el-button>
        <el-button type="success" @click="showImportDialog" style="width: 100%;">
          <el-icon>
            <Upload />
          </el-icon>
          导入数据
        </el-button>
      </div>
    </el-drawer>

    <!-- 文件上传对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入数据" width="90%" :close-on-click-modal="false">
      <el-upload ref="uploadRef" :auto-upload="false" :on-change="handleFileChange" :show-file-list="false"
        accept=".json">
        <el-button type="primary">选择文件</el-button>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 JSON 文件，且不超过 10MB
          </div>
        </template>
      </el-upload>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImport" :loading="importing">
            确认导入
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Money, User, Document, DataAnalysis, Setting, ArrowDown, Fold, Expand, Menu, Download, Upload
} from '@element-plus/icons-vue';
import ThemeSwitcher from './components/ThemeSwitcher.vue';
import { exportData, importData } from './utils/storage';

// 路由相关
const router = useRouter();
const route = useRoute();

// 响应式数据
const isDark = ref(false);
const isCollapse = ref(false);
const mobileMenuVisible = ref(false);
const mobileDataMenuVisible = ref(false);
const importDialogVisible = ref(false);
const importing = ref(false);
const selectedFile = ref<File | null>(null);

// 计算属性
const activeMenu = computed(() => route.path);

const currentPageTitle = computed(() => {
  const routeMap: Record<string, string> = {
    '/employees': '员工管理',
    '/bills': '账单管理',
    '/statistics': '数据统计'
  };
  return routeMap[route.path] || '首页';
});

// 方法
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

const showMobileMenu = () => {
  mobileMenuVisible.value = true;
};

const closeMobileMenu = () => {
  mobileMenuVisible.value = false;
};

const showMobileDataMenu = () => {
  mobileDataMenuVisible.value = true;
};

const showImportDialog = () => {
  mobileDataMenuVisible.value = false;
  importDialogVisible.value = true;
};

const handleDataCommand = (command: string) => {
  switch (command) {
    case 'export':
      handleExport();
      break;
    case 'import':
      importDialogVisible.value = true;
      break;
  }
};

const handleExport = () => {
  try {
    exportData();
    ElMessage.success('数据导出成功');
  } catch (error) {
    ElMessage.error('数据导出失败');
  }
};

const handleFileChange = (file: any) => {
  selectedFile.value = file.raw;
};

const confirmImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件');
    return;
  }

  try {
    importing.value = true;
    const result = await importData(selectedFile.value);

    if (result.success) {
      ElMessage.success(result.message);
      importDialogVisible.value = false;
      // 刷新页面以更新数据
      window.location.reload();
    } else {
      ElMessage.error(result.message);
    }
  } catch (error) {
    ElMessage.error('导入失败');
  } finally {
    importing.value = false;
  }
};

// 初始化路由
onMounted(() => {
  // 如果没有路由，默认跳转到员工管理页面
  if (route.path === '/') {
    router.push('/employees');
  }
});
</script>

<style>
#app {
  height: 100vh;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.app-container {
  height: 100vh;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #ffffff;
  color: #303133;
  border-right: 1px solid #e4e7ed;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fafafa;
  transition: all 0.3s ease;
}

.logo .el-icon {
  margin-right: 8px;
  color: #409eff;
  transition: margin 0.3s ease;
}

.sidebar-menu {
  border-right: none;
  background-color: transparent;
}

.sidebar-menu .el-menu-item {
  color: #606266;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
  border-left-color: #409eff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
  border-left-color: #409eff;
}

/* 头部样式 */
.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mobile-menu-btn {
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.collapse-btn {
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.breadcrumb {
  flex: 1;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.main-content {
  background-color: #f5f7fa;
  padding: 0;
}

/* 移动端样式 */
.mobile-drawer {
  .mobile-logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    color: #303133;
    border-bottom: 1px solid #e4e7ed;
    background-color: #fafafa;
    margin-bottom: 20px;
  }

  .mobile-logo .el-icon {
    margin-right: 8px;
    color: #409eff;
  }

  .mobile-menu {
    border-right: none;
  }
}

.mobile-data-menu {
  padding: 20px;
}

/* 深色主题样式 */
.dark-mode .sidebar {
  background-color: #1a1a1a;
  border-right-color: #333;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.dark-mode .logo {
  background-color: #2a2a2a;
  color: #e0e0e0;
  border-bottom-color: #333;
}

.dark-mode .sidebar-menu .el-menu-item {
  color: #a0a0a0;
}

.dark-mode .sidebar-menu .el-menu-item:hover {
  background-color: #2a2a2a;
  color: #409eff;
  border-left-color: #409eff;
}

.dark-mode .sidebar-menu .el-menu-item.is-active {
  background-color: #1e3a5f;
  color: #409eff;
  border-left-color: #409eff;
}

.dark-mode .header {
  background-color: #2a2a2a;
  border-bottom-color: #333;
  color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-mode .mobile-menu-btn:hover,
.dark-mode .collapse-btn:hover {
  background-color: #333;
  color: #409eff;
}

.dark-mode .main-content {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

.dark-mode .mobile-logo {
  background-color: #2a2a2a;
  color: #e0e0e0;
  border-bottom-color: #333;
}

/* 移动端样式 */
.mobile-drawer {
  .mobile-logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    color: #303133;
    border-bottom: 1px solid #e4e7ed;
    background-color: #fafafa;
    margin-bottom: 20px;
  }

  .mobile-logo .el-icon {
    margin-right: 8px;
    color: #409eff;
  }

  .mobile-menu {
    border-right: none;
  }
}

.mobile-data-menu {
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .desktop-sidebar {
    display: none !important;
  }

  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: inline-flex !important;
  }

  .header {
    padding: 0 15px;
  }

  .header-left {
    gap: 10px;
  }

  .header-right {
    gap: 10px;
  }

  .breadcrumb {
    display: none;
  }

  .main-content {
    padding: 10px;
  }

  /* 移动端表格优化 */
  .el-table {
    font-size: 12px;
  }

  .el-table .cell {
    padding: 8px 4px;
  }

  .el-card {
    margin-bottom: 10px;
  }

  .el-card__header {
    padding: 15px;
  }

  .el-card__body {
    padding: 15px;
  }
}

@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }

  .desktop-only {
    display: inline-flex !important;
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .header {
    padding: 0 10px;
  }

  .header-left {
    gap: 8px;
  }

  .header-right {
    gap: 8px;
  }

  .mobile-menu-btn,
  .collapse-btn {
    padding: 6px;
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .header {
    padding: 0 10px;
  }

  .header-left {
    gap: 8px;
  }

  .header-right {
    gap: 8px;
  }

  .mobile-menu-btn,
  .collapse-btn {
    padding: 6px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 侧边栏收起时的样式调整 */
.sidebar:has(.el-menu--collapse) .logo {
  padding: 0 8px;
}

.sidebar:has(.el-menu--collapse) .logo .el-icon {
  margin-right: 0;
}

/* 确保菜单项在收起时正确显示 */
.el-menu--collapse .el-menu-item {
  padding: 0 20px !important;
}

.el-menu--collapse .el-menu-item .el-icon {
  margin-right: 0;
}

/* 移动端抽屉样式优化 */
.el-drawer__header {
  padding: 20px;
  margin-bottom: 0;
  border-bottom: 1px solid #e4e7ed;
}

.dark-mode .el-drawer__header {
  border-bottom-color: #333;
}

/* 移动端表格优化 */
@media (max-width: 768px) {
  .el-table {
    font-size: 12px;
  }

  .el-table .cell {
    padding: 8px 4px;
  }

  .el-card {
    margin-bottom: 10px;
  }

  .el-card__header {
    padding: 15px;
  }

  .el-card__body {
    padding: 15px;
  }
}
</style>
<template>
  <div class="file-manager-container">
    <!-- 头部搜索和筛选区域 -->
    <el-card class="search-filter-area">
      <div class="search-filter-wrapper">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索文件名"
            clearable
            @input="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="filter-box">
          <el-select v-model="fileTypeFilter" placeholder="文件类型" @change="handleSearch" clearable>
            <el-option v-for="item in fileTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          
          <el-select v-model="sortOption" placeholder="排序方式" @change="handleSearch">
            <el-option v-for="item in sortOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          
          <el-button type="primary" @click="handleViewChange('grid')">
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-button type="primary" @click="handleViewChange('list')">
            <el-icon><List /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 文件上传和下载组件 -->
    <FileUploadDownload 
      ref="fileUploadDownloadRef"
      @upload-complete="handleUploadComplete"
      @download-complete="handleDownloadComplete"
    />
    
    <!-- 路径导航区 -->
    <div class="path-navigation">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/page1' }" @click.native="navigateToRoot">根目录</el-breadcrumb-item>
        <el-breadcrumb-item 
          v-for="(item, index) in currentPath" 
          :key="index" 
          :to="{ path: getPathTo(index) }"
          @click.native="navigateToPath(index)"
        >
          {{ item }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 文件列表区域 - 网格视图 -->
    <div v-if="viewMode === 'grid'" class="files-grid">
      <el-card v-for="file in filteredFiles" :key="file.id" class="file-card" shadow="hover" @click="handleFileClick(file)">
        <div class="file-icon">
          <el-icon v-if="file.type === 'folder'" :size="40" :color="'#E6A23C'"><Folder /></el-icon>
          <el-icon v-else-if="file.type === 'image'" :size="40" :color="'#67C23A'"><Picture /></el-icon>
          <el-icon v-else-if="file.type === 'document'" :size="40" :color="'#409EFF'"><Document /></el-icon>
          <el-icon v-else-if="file.type === 'video'" :size="40" :color="'#F56C6C'"><VideoPlay /></el-icon>
          <el-icon v-else :size="40" :color="'#909399'"><Files /></el-icon>
        </div>
        <div class="file-name" :title="file.name">{{ file.name }}</div>
        <div class="file-info">{{ file.size || '-' }} | {{ file.modifiedDate }}</div>
        
        <div class="file-actions">
          <el-dropdown trigger="click" @click.stop>
            <el-icon :size="18"><More /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="file.type !== 'folder'" @click.stop="handleDownload(file)">
                  <el-icon><Download /></el-icon> 下载
                </el-dropdown-item>
                <el-dropdown-item @click.stop="handleRename(file)">
                  <el-icon><Edit /></el-icon> 重命名
                </el-dropdown-item>
                <el-dropdown-item divided @click.stop="handleDelete(file)">
                  <el-icon><Delete /></el-icon> 删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-card>
    </div>
    
    <!-- 文件列表区域 - 列表视图 -->
    <el-card v-if="viewMode === 'list'">
      <el-table :data="filteredFiles" style="width: 100%">
        <el-table-column label="名称" min-width="220">
          <template #default="scope">
            <div class="file-name-cell" @click="handleFileClick(scope.row)">
              <el-icon v-if="scope.row.type === 'folder'" :color="'#E6A23C'"><Folder /></el-icon>
              <el-icon v-else-if="scope.row.type === 'image'" :color="'#67C23A'"><Picture /></el-icon>
              <el-icon v-else-if="scope.row.type === 'document'" :color="'#409EFF'"><Document /></el-icon>
              <el-icon v-else-if="scope.row.type === 'video'" :color="'#F56C6C'"><VideoPlay /></el-icon>
              <el-icon v-else :color="'#909399'"><Files /></el-icon>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120"></el-table-column>
        <el-table-column prop="size" label="大小" width="120"></el-table-column>
        <el-table-column prop="modifiedDate" label="修改日期" width="180"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button v-if="scope.row.type !== 'folder'" size="small" @click.stop="handleDownload(scope.row)">下载</el-button>
            <el-dropdown trigger="click" @click.stop>
              <el-button size="small">
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click.stop="handleRename(scope.row)">重命名</el-dropdown-item>
                  <el-dropdown-item divided @click.stop="handleDelete(scope.row)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 重命名对话框 -->
    <el-dialog v-model="renameDialogVisible" title="重命名" width="30%">
      <el-input v-model="newFileName" placeholder="请输入新文件名"></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="renameDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRename">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { 
  Search, Grid, List, Folder, Document, 
  Picture, VideoPlay, Files, Download, 
  Edit, Delete, More, ArrowDown 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import FileUploadDownload from '@/components/FileUploadDownload.vue';

// 文件上传下载组件引用
const fileUploadDownloadRef = ref(null);

// 视图模式：网格或列表
const viewMode = ref('grid');

// 搜索和筛选
const searchKeyword = ref('');
const fileTypeFilter = ref('');
const sortOption = ref('name-asc');

// 文件路径
const currentPath = ref([]);

// 当前选中的文件（用于重命名）
const selectedFile = ref(null);
const renameDialogVisible = ref(false);
const newFileName = ref('');

// 文件类型选项
const fileTypes = [
  { label: '所有类型', value: '' },
  { label: '文件夹', value: 'folder' },
  { label: '图像', value: 'image' },
  { label: '文档', value: 'document' },
  { label: '视频', value: 'video' },
  { label: '其他', value: 'other' }
];

// 排序选项
const sortOptions = [
  { label: '名称 (A-Z)', value: 'name-asc' },
  { label: '名称 (Z-A)', value: 'name-desc' },
  { label: '修改日期 (新-旧)', value: 'date-desc' },
  { label: '修改日期 (旧-新)', value: 'date-asc' },
  { label: '大小 (大-小)', value: 'size-desc' },
  { label: '大小 (小-大)', value: 'size-asc' }
];

// 模拟文件数据
const fileList = reactive([
  {
    id: 1,
    name: '文档资料',
    type: 'folder',
    modifiedDate: '2023-07-10 15:30',
    path: '文档资料',
    children: [
      {
        id: 11,
        name: '项目计划书.docx',
        type: 'document',
        size: '2.5MB',
        modifiedDate: '2023-07-09 11:20'
      },
      {
        id: 12,
        name: '季度报告.pdf',
        type: 'document',
        size: '4.8MB',
        modifiedDate: '2023-07-08 09:15'
      }
    ]
  },
  {
    id: 2,
    name: '图片素材',
    type: 'folder',
    modifiedDate: '2023-07-09 12:45',
    path: '图片素材',
    children: [
      {
        id: 21,
        name: '产品照片.jpg',
        type: 'image',
        size: '3.2MB',
        modifiedDate: '2023-07-07 16:30'
      },
      {
        id: 22,
        name: '团队合照.png',
        type: 'image',
        size: '5.1MB',
        modifiedDate: '2023-07-06 14:20'
      }
    ]
  },
  {
    id: 3,
    name: '营销方案.pptx',
    type: 'document',
    size: '8.7MB',
    modifiedDate: '2023-07-08 10:15'
  },
  {
    id: 4,
    name: '产品演示.mp4',
    type: 'video',
    size: '45.3MB',
    modifiedDate: '2023-07-07 13:40'
  },
  {
    id: 5,
    name: '客户反馈统计.xlsx',
    type: 'document',
    size: '1.2MB',
    modifiedDate: '2023-07-06 16:25'
  },
  {
    id: 6,
    name: '公司标志.svg',
    type: 'image',
    size: '0.5MB',
    modifiedDate: '2023-07-05 09:50'
  },
  {
    id: 7,
    name: '会议记录',
    type: 'folder',
    modifiedDate: '2023-07-04 14:30',
    path: '会议记录'
  },
  {
    id: 8,
    name: '软件安装包.zip',
    type: 'other',
    size: '128.6MB',
    modifiedDate: '2023-07-03 11:15'
  }
]);

// 当前显示的文件列表（根据路径决定）
const currentFiles = computed(() => {
  if (currentPath.value.length === 0) {
    return fileList;
  } else {
    // 根据路径获取当前文件夹的内容
    let result = fileList;
    for (const folder of currentPath.value) {
      const foundFolder = result.find(file => file.name === folder && file.type === 'folder');
      result = foundFolder?.children || [];
    }
    return result;
  }
});

// 筛选和排序后的文件列表
const filteredFiles = computed(() => {
  // 先筛选
  let result = currentFiles.value.filter(file => {
    // 文件类型筛选
    if (fileTypeFilter.value && file.type !== fileTypeFilter.value) {
      return false;
    }
    
    // 搜索关键词筛选
    if (searchKeyword.value && !file.name.toLowerCase().includes(searchKeyword.value.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // 再排序
  const [field, order] = sortOption.value.split('-');
  result.sort((a, b) => {
    let compareResult = 0;
    
    // 文件夹总是排在前面
    if (a.type === 'folder' && b.type !== 'folder') {
      return -1;
    } else if (a.type !== 'folder' && b.type === 'folder') {
      return 1;
    }
    
    // 根据选择的字段进行排序
    if (field === 'name') {
      compareResult = a.name.localeCompare(b.name);
    } else if (field === 'date') {
      compareResult = new Date(a.modifiedDate) - new Date(b.modifiedDate);
    } else if (field === 'size') {
      // 对于文件夹，大小为0
      const sizeA = a.type === 'folder' ? 0 : parseFileSize(a.size);
      const sizeB = b.type === 'folder' ? 0 : parseFileSize(b.size);
      compareResult = sizeA - sizeB;
    }
    
    // 应用排序方向
    return order === 'asc' ? compareResult : -compareResult;
  });
  
  return result;
});

// 解析文件大小字符串为数字（用于排序）
function parseFileSize(sizeStr) {
  if (!sizeStr) return 0;
  
  const size = parseFloat(sizeStr);
  if (sizeStr.includes('KB')) return size * 1024;
  if (sizeStr.includes('MB')) return size * 1024 * 1024;
  if (sizeStr.includes('GB')) return size * 1024 * 1024 * 1024;
  return size;
}

// 获取到指定索引的路径
function getPathTo(index) {
  // 实际项目中应该返回实际路由路径
  return '/page1';
}

// 导航到根目录
function navigateToRoot() {
  currentPath.value = [];
}

// 导航到指定路径
function navigateToPath(index) {
  currentPath.value = currentPath.value.slice(0, index + 1);
}

// 处理搜索和筛选
function handleSearch() {
  // 筛选在计算属性中处理
}

// 切换视图模式
function handleViewChange(mode) {
  viewMode.value = mode;
}

// 处理文件点击
function handleFileClick(file) {
  if (file.type === 'folder') {
    // 进入文件夹
    currentPath.value.push(file.name);
  } else {
    // 预览非文件夹类型的文件
    previewFile(file);
  }
}

// 预览文件
function previewFile(file) {
  // 根据文件类型执行不同的预览操作
  if (file.type === 'image') {
    ElMessage.success(`预览图片: ${file.name}`);
    // 实际应用中可以打开图片预览弹窗
  } else if (file.type === 'document') {
    ElMessage.success(`预览文档: ${file.name}`);
    // 实际应用中可以打开文档预览
  } else if (file.type === 'video') {
    ElMessage.success(`播放视频: ${file.name}`);
    // 实际应用中可以打开视频播放器
  } else {
    // 对于不能直接预览的文件类型，提示下载
    ElMessage.info(`此类型文件不支持预览，您可以下载后查看`);
  }
}

// 处理下载
function handleDownload(file) {
  if (file.type === 'folder') {
    ElMessage.warning('文件夹不支持直接下载');
    return;
  }
  
  // 调用文件上传下载组件的下载方法
  if (fileUploadDownloadRef.value) {
    fileUploadDownloadRef.value.downloadFile(file);
  } else {
    ElMessage.error('下载组件未初始化');
    // 提供一个简单的备选下载方式
    simulateDownload(file);
  }
}

// 模拟文件下载（当组件引用不可用时的备用方案）
function simulateDownload(file) {
  ElMessage.success(`正在下载文件: ${file.name}`);
  // 在实际应用中，这里可以使用浏览器的下载API
  // 例如创建一个a标签并模拟点击
  // const a = document.createElement('a');
  // a.href = file.url || '#';
  // a.download = file.name;
  // document.body.appendChild(a);
  // a.click();
  // document.body.removeChild(a);
}

// 处理重命名
function handleRename(file) {
  selectedFile.value = file;
  newFileName.value = file.name;
  renameDialogVisible.value = true;
}

// 确认重命名
function confirmRename() {
  if (!newFileName.value) {
    ElMessage.warning('文件名不能为空');
    return;
  }
  
  // 检查是否有同名文件
  const sameNameFile = currentFiles.value.find(
    file => file.name === newFileName.value && file.id !== selectedFile.value.id
  );
  if (sameNameFile) {
    ElMessage.error(`已存在同名文件或文件夹: ${newFileName.value}`);
    return;
  }
  
  // 更新文件名
  selectedFile.value.name = newFileName.value;
  ElMessage.success('重命名成功');
  renameDialogVisible.value = false;
}

// 处理删除
function handleDelete(file) {
  ElMessageBox.confirm(`确定要删除${file.type === 'folder' ? '文件夹' : '文件'} "${file.name}" 吗？${file.type === 'folder' ? '文件夹内的所有文件将被删除！' : ''}`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从当前文件列表中删除
    const files = currentFiles.value;
    const index = files.findIndex(f => f.id === file.id);
    if (index !== -1) {
      files.splice(index, 1);
      ElMessage.success('删除成功');
    }
  }).catch(() => {
    // 用户取消删除
  });
}

// 处理上传完成事件
function handleUploadComplete(data) {
  const { file, folder } = data;
  
  // 获取文件类型
  let fileType = 'other';
  const extension = file.name.split('.').pop().toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    fileType = 'image';
  } else if (['doc', 'docx', 'pdf', 'txt', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension)) {
    fileType = 'document';
  } else if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv'].includes(extension)) {
    fileType = 'video';
  }
  
  // 创建新文件对象
  const newFile = {
    id: Date.now(), // 使用时间戳作为临时ID
    name: file.name,
    type: fileType,
    size: formatFileSize(file.size),
    modifiedDate: formatDate(new Date())
  };
  
  // 根据目标文件夹添加文件
  if (folder === 'root') {
    // 添加到根目录
    fileList.push(newFile);
  } else {
    // 添加到指定文件夹
    const targetFolder = findFolderById(fileList, folder);
    if (targetFolder && targetFolder.children) {
      targetFolder.children.push(newFile);
    } else {
      // 如果找不到目标文件夹，添加到当前目录
      currentFiles.value.push(newFile);
    }
  }
}

// 处理下载完成事件
function handleDownloadComplete(data) {
  // 在实际项目中，可能需要记录下载历史或执行其他操作
  console.log('下载完成:', data);
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 根据ID查找文件夹
function findFolderById(files, id) {
  for (const file of files) {
    if (file.id.toString() === id.toString() && file.type === 'folder') {
      return file;
    }
    
    if (file.children) {
      const found = findFolderById(file.children, id);
      if (found) return found;
    }
  }
  
  return null;
}

onMounted(() => {
  // 可以在这里加载初始文件列表
  // 或者执行其他初始化操作
});
</script>

<style scoped>
.file-manager-container {
  padding: 20px;
  height: calc(100vh - 150px);
  overflow-y: auto;
}

.search-filter-area {
  margin-bottom: 20px;
}

.search-filter-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.filter-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.path-navigation {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.file-card {
  position: relative;
  text-align: center;
  cursor: pointer;
  padding: 15px;
  transition: all 0.3s;
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.file-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-icon {
  margin-bottom: 10px;
  font-size: 40px;
}

.file-name {
  font-weight: bold;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-info {
  font-size: 12px;
  color: #909399;
}

.file-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.file-card:hover .file-actions {
  opacity: 1;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.file-name-cell:hover {
  color: #409EFF;
}

/* 适配移动设备 */
@media (max-width: 768px) {
  .file-manager-container {
    padding: 10px;
  }
  
  .search-filter-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box, .filter-box {
    width: 100%;
  }
  
  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
  
  .file-card {
    height: 140px;
    padding: 10px;
  }
}
</style> 
<template>
  <div class="file-upload-download">
    <!-- 上传区域 -->
    <el-card class="upload-area" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文件上传</span>
          <el-button type="primary" size="small" @click="openUploadDialog">上传文件</el-button>
        </div>
      </template>
      
      <!-- 最近上传记录 -->
      <div v-if="uploadHistory.length > 0" class="upload-history">
        <h4>最近上传记录</h4>
        <div class="history-list">
          <div v-for="(item, index) in uploadHistory" :key="index" class="history-item">
            <div class="file-info">
              <el-icon v-if="getFileIcon(item.name).icon" :color="getFileIcon(item.name).color">
                <component :is="getFileIcon(item.name).icon"></component>
              </el-icon>
              <span class="file-name" :title="item.name">{{ item.name }}</span>
            </div>
            <span class="file-status" :class="item.status">
              {{ item.status === 'success' ? '成功' : item.status === 'error' ? '失败' : '上传中' }}
              <template v-if="item.status === 'uploading'">
                {{ Math.floor(item.progress) }}%
              </template>
            </span>
          </div>
        </div>
      </div>
      <div v-else class="empty-history">
        <el-icon :size="48" :color="'#909399'"><Upload /></el-icon>
        <p>还没有上传文件记录</p>
        <el-button type="primary" @click="openUploadDialog">点击上传</el-button>
      </div>
    </el-card>
    
    <!-- 下载区域 -->
    <el-card class="download-area" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文件下载</span>
        </div>
      </template>
      
      <!-- 最近下载记录 -->
      <div v-if="downloadHistory.length > 0" class="download-history">
        <h4>最近下载记录</h4>
        <div class="history-list">
          <div v-for="(item, index) in downloadHistory" :key="index" class="history-item">
            <div class="file-info">
              <el-icon v-if="getFileIcon(item.name).icon" :color="getFileIcon(item.name).color">
                <component :is="getFileIcon(item.name).icon"></component>
              </el-icon>
              <span class="file-name" :title="item.name">{{ item.name }}</span>
            </div>
            <span class="file-status" :class="item.status">
              {{ item.status === 'success' ? '成功' : item.status === 'error' ? '失败' : '下载中' }}
              <template v-if="item.status === 'downloading'">
                {{ Math.floor(item.progress) }}%
              </template>
            </span>
          </div>
        </div>
      </div>
      <div v-else class="empty-history">
        <el-icon :size="48" :color="'#909399'"><Download /></el-icon>
        <p>还没有下载文件记录</p>
      </div>
      
      <!-- 选择文件下载提示 -->
      <div class="download-tip">
        <p>点击文件列表中的文件进行下载</p>
      </div>
    </el-card>
    
    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传文件" width="500px">
      <el-upload
        class="upload-dialog"
        drag
        multiple
        :before-upload="beforeUpload"
        :http-request="customUpload"
        :file-list="uploadFileList"
        :on-remove="handleRemoveFile"
        :auto-upload="false"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持任意类型文件上传，单个文件大小不超过100MB
          </div>
        </template>
      </el-upload>
      
      <!-- 选择目标文件夹 -->
      <div class="folder-selection">
        <p>上传到文件夹：</p>
        <el-select v-model="selectedFolder" placeholder="选择目标文件夹">
          <el-option label="根目录" value="root"></el-option>
          <el-option v-for="folder in folderList" :key="folder.id" :label="folder.name" :value="folder.id"></el-option>
        </el-select>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload" :disabled="uploadFileList.length === 0">开始上传</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, defineEmits, computed, onMounted } from 'vue';
import { 
  Document, Picture, VideoPlay, Files, UploadFilled, 
  Download, Upload, FolderOpened, FolderDelete, FolderAdd 
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const emit = defineEmits(['upload-complete', 'download-complete']);

// 上传相关
const uploadDialogVisible = ref(false);
const uploadFileList = ref([]);
const uploadHistory = ref([]);
const selectedFolder = ref('root');

// 下载相关
const downloadHistory = ref([]);

// 文件夹列表
const folderList = ref([]);

// 获取文件图标
const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  // 图片文件
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return { icon: 'Picture', color: '#67C23A' };
  }
  
  // 文档文件
  if (['doc', 'docx', 'pdf', 'txt', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension)) {
    return { icon: 'Document', color: '#409EFF' };
  }
  
  // 视频文件
  if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv'].includes(extension)) {
    return { icon: 'VideoPlay', color: '#F56C6C' };
  }
  
  // 其他文件
  return { icon: 'Files', color: '#909399' };
};

// 打开上传对话框
const openUploadDialog = () => {
  uploadDialogVisible.value = true;
};

// 上传前处理
const beforeUpload = (file) => {
  // 检查文件大小，限制100MB
  const isLessThan100MB = file.size / 1024 / 1024 < 100;
  if (!isLessThan100MB) {
    ElMessage.error('文件大小不能超过100MB');
    return false;
  }
  return true;
};

// 移除文件
const handleRemoveFile = (file) => {
  const index = uploadFileList.value.indexOf(file);
  if (index !== -1) {
    uploadFileList.value.splice(index, 1);
  }
};

// 自定义上传方法
const customUpload = (options) => {
  const { file } = options;
  
  // 将文件添加到上传列表
  uploadFileList.value.push(file);
  
  return false; // 阻止自动上传
};

// 提交上传
const submitUpload = () => {
  // 关闭对话框
  uploadDialogVisible.value = false;
  
  // 循环处理每个文件
  uploadFileList.value.forEach(file => {
    // 创建新的上传记录
    const uploadRecord = {
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
      folder: selectedFolder.value
    };
    
    // 添加到上传历史
    uploadHistory.value.unshift(uploadRecord);
    
    // 模拟上传进度
    const interval = setInterval(() => {
      uploadRecord.progress += Math.random() * 20;
      
      if (uploadRecord.progress >= 100) {
        uploadRecord.progress = 100;
        uploadRecord.status = 'success';
        clearInterval(interval);
        
        // 发出上传完成事件
        emit('upload-complete', {
          file: file,
          folder: selectedFolder.value
        });
        
        // 更新上传成功消息
        ElMessage.success(`文件 ${file.name} 上传成功`);
      }
    }, 500);
  });
  
  // 清空上传列表
  uploadFileList.value = [];
};

// 模拟下载文件
const downloadFile = (file) => {
  // 创建新的下载记录
  const downloadRecord = {
    name: file.name,
    size: file.size || '未知',
    status: 'downloading',
    progress: 0
  };
  
  // 添加到下载历史
  downloadHistory.value.unshift(downloadRecord);
  
  // 模拟下载进度
  const interval = setInterval(() => {
    downloadRecord.progress += Math.random() * 20;
    
    if (downloadRecord.progress >= 100) {
      downloadRecord.progress = 100;
      downloadRecord.status = 'success';
      clearInterval(interval);
      
      // 发出下载完成事件
      emit('download-complete', {
        file: file
      });
      
      // 更新下载成功消息
      ElMessage.success(`文件 ${file.name} 下载成功`);
    }
  }, 500);
  
  // 实际项目中，这里应该触发浏览器下载
  // 例如：window.open(file.url) 或者使用 a 标签下载
};

// 获取文件夹列表
const getFolders = () => {
  // 模拟获取文件夹列表
  folderList.value = [
    { id: 1, name: '文档资料' },
    { id: 2, name: '图片素材' },
    { id: 7, name: '会议记录' }
  ];
};

// 暴露方法给父组件使用
defineExpose({
  downloadFile
});

onMounted(() => {
  getFolders();
});
</script>

<style scoped>
.file-upload-download {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.upload-area, .download-area {
  flex: 1;
  min-height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 70%;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-status {
  font-size: 12px;
}

.file-status.success {
  color: #67C23A;
}

.file-status.error {
  color: #F56C6C;
}

.file-status.uploading, .file-status.downloading {
  color: #E6A23C;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
}

.empty-history p {
  margin: 15px 0;
}

.upload-dialog {
  width: 100%;
}

.folder-selection {
  margin-top: 20px;
}

.download-tip {
  margin-top: 15px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style> 
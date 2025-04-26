<template>
  <div class="mall-container scrollable">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :span="6" v-for="(item, index) in overviewData" :key="index">
        <el-card shadow="hover" class="overview-card">
          <div class="card-content">
            <div class="icon-container" :style="{ backgroundColor: item.color }">
              <el-icon :size="30" :color="'#fff'">
                <component :is="item.icon"></component>
              </el-icon>
            </div>
            <div class="card-right">
              <div class="card-value">{{ item.value }}</div>
              <div class="card-title">{{ item.title }}</div>
            </div>
          </div>
          <div class="card-bottom">
            <div class="trend" :class="item.trend === 'up' ? 'up' : 'down'">
              <el-icon :size="14" v-if="item.trend === 'up'"><ArrowUp /></el-icon>
              <el-icon :size="14" v-else><ArrowDown /></el-icon>
              <span>{{ item.trendValue }}</span>
            </div>
            <div class="period">与上周相比</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-area">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>商品销售趋势</span>
              <el-radio-group v-model="salesTrendTimeRange" size="small" @change="updateSalesTrendChart">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="salesTrendChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>商品类别分布</span>
            </div>
          </template>
          <div ref="categoryChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 商品管理表格 -->
    <el-card shadow="hover" class="product-table-card">
      <template #header>
        <div class="table-header">
          <span>商品管理</span>
          <div class="header-right">
            <el-input
              v-model="searchQuery"
              placeholder="搜索商品名称"
              clearable
              class="search-input"
              @clear="getProducts"
              @keyup.enter="getProducts"
            >
              <template #append>
                <el-button @click="getProducts">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
            <el-button type="primary" @click="handleAdd">新增商品</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="products" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="商品名称"></el-table-column>
        <el-table-column prop="category" label="分类"></el-table-column>
        <el-table-column prop="price" label="价格">
          <template #default="scope">
            ¥ {{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '在售' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 返回顶部按钮 -->
    <el-backtop target=".mall-container" :right="20" :bottom="20" />

    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增商品' : '编辑商品'"
      width="500px"
    >
      <el-form
        :model="productForm"
        :rules="rules"
        ref="productFormRef"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品分类" prop="category">
          <el-select v-model="productForm.category" placeholder="请选择商品分类" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input-number v-model="productForm.price" :precision="2" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="商品库存" prop="stock">
          <el-input-number v-model="productForm.stock" :min="0" :precision="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-radio-group v-model="productForm.status">
            <el-radio label="在售">在售</el-radio>
            <el-radio label="下架">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            type="textarea"
            v-model="productForm.description"
            placeholder="请输入商品描述"
            :rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowUp, ArrowDown, Goods, ShoppingCart, UserFilled, Wallet, Search } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

// 数据相关
const overviewData = ref([])
const categoryOptions = ref([])
const salesTrendTimeRange = ref('month')
const salesTrendChart = ref(null)
const categoryChart = ref(null)

// 商品表格相关
const loading = ref(false)
const products = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

// 商品表单相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const productFormRef = ref(null)
const productForm = reactive({
  id: '',
  name: '',
  category: '',
  price: 0,
  stock: 0,
  status: '在售',
  description: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入商品库存', trigger: 'blur' }],
  status: [{ required: true, message: '请选择商品状态', trigger: 'change' }]
}

// 获取概览数据
const getOverviewData = async () => {
  try {
    const res = await proxy.$api.getOverviewData()
    overviewData.value = res
  } catch (error) {
    console.error('获取概览数据失败:', error)
  }
}

// 获取分类选项
const getCategoryOptions = async () => {
  try {
    const res = await proxy.$api.getCategoryOptions()
    categoryOptions.value = res
  } catch (error) {
    console.error('获取分类选项失败:', error)
  }
}

// 更新销售趋势图表
const updateSalesTrendChart = async () => {
  try {
    const data = await proxy.$api.getSalesTrendData({ timeRange: salesTrendTimeRange.value })
    
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['销售额', '订单量']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.xAxis
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          smooth: true,
          data: data.series[0].data,
          itemStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0)' }
              ]
            }
          }
        },
        {
          name: '订单量',
          type: 'line',
          smooth: true,
          data: data.series[1].data,
          itemStyle: {
            color: '#67C23A'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                { offset: 1, color: 'rgba(103, 194, 58, 0)' }
              ]
            }
          }
        }
      ]
    }
    
    salesTrendChart.value.setOption(option)
  } catch (error) {
    console.error('获取销售趋势数据失败:', error)
  }
}

// 更新商品类别分布图表
const updateCategoryChart = async () => {
  try {
    const data = await proxy.$api.getCategoryDistributionData()
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: data.map(item => item.name)
      },
      series: [
        {
          name: '商品类别',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data
        }
      ]
    }
    
    categoryChart.value.setOption(option)
  } catch (error) {
    console.error('获取商品类别分布数据失败:', error)
  }
}

// 获取商品列表
const getProducts = async () => {
  loading.value = true
  try {
    const res = await proxy.$api.getProductList({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value
    })
    
    products.value = res.list
    total.value = res.total
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 分页相关方法
const handleSizeChange = (val) => {
  pageSize.value = val
  getProducts()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getProducts()
}

// 添加商品
const handleAdd = () => {
  dialogType.value = 'add'
  productForm.id = ''
  productForm.name = ''
  productForm.category = ''
  productForm.price = 0
  productForm.stock = 0
  productForm.status = '在售'
  productForm.description = ''
  dialogVisible.value = true
  
  // 清除表单验证
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
}

// 编辑商品
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.keys(productForm).forEach(key => {
    productForm[key] = row[key]
  })
  dialogVisible.value = true
}

// 删除商品
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除商品"${row.name}"吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await proxy.$api.deleteProduct({ id: row.id })
      ElMessage.success('删除成功')
      getProducts()
    } catch (error) {
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const submitForm = async () => {
  if (!productFormRef.value) return
  
  productFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await proxy.$api.addProduct(productForm)
          ElMessage.success('添加成功')
        } else {
          await proxy.$api.updateProduct(productForm)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        getProducts()
      } catch (error) {
        console.error(dialogType.value === 'add' ? '添加商品失败:' : '更新商品失败:', error)
        ElMessage.error(dialogType.value === 'add' ? '添加商品失败' : '更新商品失败')
      }
    }
  })
}

// 初始化
onMounted(async () => {
  // 获取数据概览
  await getOverviewData()
  
  // 获取分类选项
  await getCategoryOptions()
  
  // 初始化图表
  salesTrendChart.value = echarts.init(proxy.$refs.salesTrendChart)
  categoryChart.value = echarts.init(proxy.$refs.categoryChart)
  
  // 更新图表数据
  await updateSalesTrendChart()
  await updateCategoryChart()

  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    salesTrendChart.value.resize()
    categoryChart.value.resize()
  })
  
  // 获取商品列表
  await getProducts()
})
</script>

<style lang="less" scoped>
.mall-container {
  padding: 20px;
  height: calc(100vh - 60px);  /* 假设顶部导航栏高度为60px，根据实际情况调整 */
  overflow-y: auto;
  position: relative;  /* 为返回顶部按钮提供定位上下文 */
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  
  .data-overview {
    margin-bottom: 20px;
    
    .overview-card {
      height: 140px;
      
      .card-content {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        
        .icon-container {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 15px;
        }
        
        .card-right {
          .card-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .card-title {
            font-size: 14px;
            color: #909399;
          }
        }
      }
      
      .card-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        
        .trend {
          display: flex;
          align-items: center;
          
          &.up {
            color: #67C23A;
          }
          
          &.down {
            color: #F56C6C;
          }
          
          .el-icon {
            margin-right: 4px;
          }
        }
        
        .period {
          color: #909399;
        }
      }
    }
  }
  
  .chart-area {
    margin-bottom: 20px;
    
    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .chart {
        height: 340px;
      }
    }
  }
  
  .product-table-card {
    margin-bottom: 50px;  /* 增加底部间距，确保与页面底部有足够空间 */
    
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-right {
        display: flex;
        align-items: center;
        
        .search-input {
          width: 250px;
          margin-right: 15px;
        }
      }
    }
    
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style> 
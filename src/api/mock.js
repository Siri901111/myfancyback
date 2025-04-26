import Mock from 'mockjs'
import homeApi from './mockData/home'
import userApi from './mockData/user'
import mallApi from './mockData/mall'
Mock.setup({
    timeout: '200-600'  // 设置延迟时间
})

// 首页相关
Mock.mock(/\/api\/home\/getTableData/, 'get', homeApi.getTableData)
Mock.mock(/\/api\/home\/getCountData/, 'get', homeApi.getCountData)
Mock.mock(/\/api\/home\/getChartData/, 'get', homeApi.getChartData)

// 用户相关
Mock.mock(/\/api\/home\/getUserData.*/, 'get', userApi.getUserList)
Mock.mock(/\/api\/user\/deleteUser/, 'get', userApi.deleteUser)
Mock.mock(/\/api\/user\/addUser/, 'post', userApi.createUser)
Mock.mock(/\/api\/user\/editUser/, 'post', userApi.updateUser)


// 商城相关
Mock.mock(/\/api\/mall\/getOverviewData/, 'get', mallApi.getOverviewData)
Mock.mock(/\/api\/mall\/getCategoryOptions/, 'get', mallApi.getCategoryOptions)
Mock.mock(/\/api\/mall\/getSalesTrendData/, 'get', mallApi.getSalesTrendData)
Mock.mock(/\/api\/mall\/getCategoryDistributionData/, 'get', mallApi.getCategoryDistributionData)
Mock.mock(/\/api\/mall\/getProductList/, 'get', mallApi.getProductList)
Mock.mock(/\/api\/mall\/addProduct/, 'post', mallApi.addProduct)
Mock.mock(/\/api\/mall\/updateProduct/, 'post', mallApi.updateProduct)
Mock.mock(/\/api\/mall\/deleteProduct/, 'get', mallApi.deleteProduct)
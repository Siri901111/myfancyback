// 商品管理页面的模拟数据

export default {
  // 获取商城数据概览
  getOverviewData: () => {
    return {
      code: 200,
      data: [
        { 
          title: '总销售额', 
          value: '¥ 126,560', 
          icon: 'Wallet', 
          color: '#409EFF', 
          trend: 'up', 
          trendValue: '12%' 
        },
        { 
          title: '访问量', 
          value: '88,846', 
          icon: 'UserFilled', 
          color: '#67C23A', 
          trend: 'up', 
          trendValue: '8%' 
        },
        { 
          title: '订单量', 
          value: '3,256', 
          icon: 'ShoppingCart', 
          color: '#E6A23C', 
          trend: 'down', 
          trendValue: '3%' 
        },
        { 
          title: '商品数', 
          value: '1,689', 
          icon: 'Goods', 
          color: '#F56C6C', 
          trend: 'up', 
          trendValue: '5%' 
        }
      ]
    }
  },

  // 获取商品分类选项
  getCategoryOptions: () => {
    return {
      code: 200,
      data: [
        { value: '电子产品', label: '电子产品' },
        { value: '服装', label: '服装' },
        { value: '食品', label: '食品' },
        { value: '家居用品', label: '家居用品' },
        { value: '图书', label: '图书' },
        { value: '美妆', label: '美妆' },
        { value: '玩具', label: '玩具' }
      ]
    }
  },

  // 获取销售趋势图表数据
  getSalesTrendData: (params) => {
    const timeRange = params?.timeRange || 'month' // 默认月视图
    
    const data = {
      week: {
        xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        series: [
          {
            name: '销售额',
            data: [12000, 13200, 10100, 13400, 19000, 23400, 21300]
          },
          {
            name: '订单量',
            data: [320, 332, 301, 334, 390, 330, 320]
          }
        ]
      },
      month: {
        xAxis: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
        series: [
          {
            name: '销售额',
            data: [22000, 19200, 25100, 31400, 29000, 33400, 41300]
          },
          {
            name: '订单量',
            data: [520, 632, 701, 834, 790, 930, 1020]
          }
        ]
      },
      year: {
        xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        series: [
          {
            name: '销售额',
            data: [102000, 119200, 150100, 131400, 190000, 234000, 213000, 224000, 230000, 245000, 290000, 330000]
          },
          {
            name: '订单量',
            data: [1520, 1632, 1701, 1834, 1990, 2130, 2220, 2330, 2450, 2650, 2850, 3100]
          }
        ]
      }
    }

    return {
      code: 200,
      data: data[timeRange]
    }
  },

  // 获取商品类别分布数据
  getCategoryDistributionData: () => {
    return {
      code: 200,
      data: [
        { value: 1048, name: '电子产品' },
        { value: 735, name: '服装' },
        { value: 580, name: '食品' },
        { value: 484, name: '家居用品' },
        { value: 300, name: '美妆' },
        { value: 200, name: '玩具' },
        { value: 100, name: '其他' }
      ]
    }
  },

  // 获取商品列表数据
  getProductList: (params) => {
    const { page = 1, pageSize = 10, search = '' } = params || {}
    
    // 生成基础商品数据（固定生成100条）
    const baseList = []
    const categoryOptions = [
      '电子产品', '服装', '食品', '家居用品', '图书', '美妆', '玩具'
    ]
    
    for (let i = 0; i < 100; i++) {
      baseList.push({
        id: i + 1,
        name: `商品${i + 1}`,
        category: categoryOptions[i % categoryOptions.length],
        price: Math.floor(Math.random() * 1000) + 100,
        stock: Math.floor(Math.random() * 1000),
        status: Math.random() > 0.3 ? '在售' : '下架',
        description: `这是商品${i + 1}的描述信息，提供了商品的基本信息和特性。`
      })
    }
    
    // 过滤搜索
    let filteredList = baseList
    if (search) {
      filteredList = baseList.filter(item => 
        item.name.includes(search) || 
        item.category.includes(search)
      )
    }
    
    // 计算总数
    const total = filteredList.length
    
    // 分页
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + parseInt(pageSize)
    const paginatedList = filteredList.slice(startIndex, endIndex)
    
    return {
      code: 200,
      data: {
        list: paginatedList,
        total
      }
    }
  },
  
  // 添加商品
  addProduct: (params) => {
    return {
      code: 200,
      data: {
        message: '添加商品成功',
        ...params
      }
    }
  },
  
  // 编辑商品
  updateProduct: (params) => {
    return {
      code: 200,
      data: {
        message: '更新商品成功',
        ...params
      }
    }
  },
  
  // 删除商品
  deleteProduct: (params) => {
    return {
      code: 200,
      data: {
        message: '删除商品成功',
        id: params.id
      }
    }
  }
} 
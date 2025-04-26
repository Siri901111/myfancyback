<script setup>
import { ref,getCurrentInstance,onMounted, reactive } from 'vue'
// import axios from 'axios'
import *  as echarts from 'echarts'

const {proxy} = getCurrentInstance()
proxy.$api

// 添加observer变量
const observer = ref(null)

const getImageUrl = (user)=>{
  return new URL(`../assets/images/${user}.png`,import.meta.url).href
}
// 这个 tableData 是假数据，等会我们使用 axios 请求 mock 数据
const tableData = ref([])
const countData = ref([])
const chartData = ref([])

// 折线图和柱状图 两个图表共用的公共配置
// echarts
const xOptions = reactive({
  // 图例文字颜色
  textStyle: {
    color: "#333",
  },
  legend: {},
  grid: {
    left: "20%",
  },
  // 提示框
  tooltip: {
    trigger: "axis",
  },
  xAxis: {
    type: "category", // 类目轴
    data: [],
    axisLine: {
      lineStyle: {
        color: "#17b3a3",
      },
    },
    axisLabel: {
      interval: 0,
      color: "#333",
    },
  },
  yAxis: [
    {
      type: "value",
      axisLine: {
        lineStyle: {
          color: "#17b3a3",
        },
      },
    },
  ],
  color: ["#2ec7c9", "#b6a2de", "#5ab1ef", "#ffb980", "#d87a80", "#8d98b3"],
  series: [],
});

const pieOptions = reactive({
  tooltip: {
    trigger: "item",
  },
  legend: {},
  color: [
    "#0f78f4",
    "#dd536b",
    "#9462e5",
    "#a6a6a6",
    "#e1bb22",
    "#39c362",
    "#3ed1cf",
  ],
  series: [],
});

const tableLabel = ref({
  name: "课程",
  todayBuy: "今日购买",
  monthBuy: "本月购买",
  totalBuy: "总购买"
})

// axios({
//   url:'/api/home/getTableData',
//   method:'get'
// }).then(res=>{
//   console.log(res);
//   // 造假数据 把交互的请求的流程 根据接口文档跑通 还要制造出数据
//   // mock.js生成随机数据，拦截ajax请求
//   if(res.data.code===200){
//     tableData.value=res.data.data.tableData
//   }
// })
const getTableData = async ()=>{
  const data = await proxy.$api.getTableData()
  // console.log(data);
  tableData.value=data.tableData
}

const getCountData = async ()=>{
  const data = await proxy.$api.getCountData()
  // console.log(data);
  countData.value = data;

}

const getChartData  = async ()=>{
  const {orderData,userData,videoData} = await proxy.$api.getChartData()
  // 对第一个图标进行x轴和series赋值
  xOptions.xAxis.data = orderData.date;
  xOptions.series = Object.keys(orderData.data[0]).map(val=>{
    return{
      name:val,
      data:orderData.data.map(item => item [val]),
      type:'line',
    }
  })
  const oneEcharts = echarts.init(proxy.$refs['echart'])
  oneEcharts.setOption(xOptions)

  // 对第二个表格进行渲染
  xOptions.xAxis.data = userData.map(item=>item.date)
  xOptions.series=[
    {
      name:'新增用户',
      data:userData.map(item=>item.new),
      type:'bar'

    },
    {
      name:'活跃用户',
      data:userData.map(item=>item.active),
      type:'bar'

    }
  ]
  const twoEcharts = echarts.init(proxy.$refs['userEchart'])
  twoEcharts.setOption(xOptions)

  // 对饼状图进行渲染
  pieOptions.series=[
    {
      data:videoData,
      type:'pie'
    }
  ]
  const threeEcharts = echarts.init(proxy.$refs['videoEchart'])
  threeEcharts.setOption(pieOptions)


  // 监听页面变化
  // resizeobserver 如果监听的容器大小发生变化 改变了以后会执行回调函数
  observer.value = new ResizeObserver((en)=>{
    // const observer = ref(null)
    oneEcharts.resize()
    twoEcharts.resize()
    threeEcharts.resize()
  })

  // 如果容器存在
  if (proxy.$refs['echart']){  // 注意：这里应该是 'echart'，而不是 'echarts'
    observer.value.observe(proxy.$refs['echart'])  // 注意：方法名应该是 observe，而不是 observer
  }
}

onMounted(()=>{
  getTableData()
  getCountData()
  getChartData()
})
</script>

<template>
  <el-row class="home" :gutter="20">
    <el-col :span="8" style="margin-top:20px"> 
        <el-card shadow="hover">
          <div class="user">
            <img :src="getImageUrl('user')" class="user"/>
            <div class="user-info">
              <p class="user-info-admin">Admin</p>
              <p class="user-info-p">Super Administrator</p>
            </div>
          </div>
          <div class="login-info">
              <p>lastLoginTime: <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2025</span></p>
              <p>lastLoginLocation:<span>London</span></p>
          </div>
        </el-card>
        <!-- 下面的卡片 -->
        <el-card shadow="hover" class="user-table" :span="8" >
            <el-table :data="tableData">
              <el-table-column
                v-for="(val,key) in tableLabel"
                :key="key" 
                :prop="key"
                :label="val"
                width="100%" 
              >
                  
              </el-table-column>
            </el-table>
        </el-card>
    </el-col>
    <el-col :span="16" style="margin-top:20px"> 
    <div class="num">
      <el-card
      :body-style="{padding:0}"
      v-for="item in countData"
      :key="item.name"
      shadow="hover"
      >
      <div class="icon-text-container">
      <component :is="item.icon" 
      class = "icons" 
      :style="{background:item.color}">
      </component>
      <div class="detail">
        <p class="num">${{item.value}}</p>
        <p class="txt">${{item.name}}</p>
      </div>
      </div>
      </el-card>
    </div>
    <el-card class="top-echart" shadow="hover"> 
      <div ref="echart" style="height : 280px">

      </div>
    </el-card>
    <div class="graph">
      <el-card>
        <div ref="userEchart" style="height : 240px">

        </div>
      </el-card>
      <el-card>
        <div ref="videoEchart" style="height : 240px">
          
        </div>
      </el-card>
    </div>
    </el-col>
  </el-row>
</template>

<style scoped lang="less">
  .home{
    height: 100%;
    overflow: hidden;
    .user{
      display: flex;
      align-items: center;
      border-bottom: 1px solid;
      margin-bottom: 20px;
      img{
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-right:40px ;
      }
      .user-info{
        .p{        
          line-height: 40px;
        }
        .user-info-p{
          color: #999;
          margin-top:10px ;
        }
        .user-info-admin{
          font-size: 30px;
        }
      }
    }
    .login-info{
      p{
        line-height: 30px;
        font-size: 14px;
        color: #999;
        span{
          color: #666;
          margin-left: 60px; 
        }
      }
    }
    .user-table{
      overflow: hidden;
      margin-top: 20px;
      //表格内字体控制
      .el-table {
        font-size: 15px; // 统一设置表格整体字体大小，可按需调整（如 11px、10px）
      }
    }
    .num{
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      font-size: 10px;
      .el-card{
        // display: flex;
        width: 32%;
        margin-bottom:20px ;
        padding: 10px;
        align-items: center;
      }
       .icon-text-container {
          display: flex;         /* 确保内部元素横向排列 */
          align-items: center;
          height: 35px;
      }
      .icons{
        margin-left: -10px;
        width: 40px;
        height: 60px;
        font-size: 10px;
        text-align: center;
        line-height: 80px;
        color: #fff;
      }
      .detail{
        margin-left: 15px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .num{
          font-size: 20px;
          margin-bottom: 10px;

        }
        .txt{
          font-size: 12px;
          text-align: center;
          color: #999;
        }
      }
    }
  }
  .graph{
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    .el-card{
      width:48%;
      height: 260px;
    }
  }
</style>

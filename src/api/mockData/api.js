/**
 * 整个项目api的统一管理
 */
import request from "./request";
// 请求首页左侧表格数据
export default {
  getTableData(){
    return request({
      url:'/home/getTable',
      method:'get',
      mock:true,
    });
  },
  getCountData(){
    return request({
      url:'/home/getCountData',
      method:'get',
      mock:true,
    });
  },
  getChartData(){
    return request({
      url:'/home/getChartData',
      method:'get',
      mock:true,
    });
  },
  getUserData(params){
    return request({
      url:'/home/getUserData',
      method:'get',
      mock:true,
      data: params
    });
  },
  deleteUser(data){
    return request({
      url:"/user/deleteUser",
      method : "get",
      mock: true,
      data,
    })
  },
  addUser(data){
    return request({
      url:"/user/addUser",
      method : "post",
      mock: true,
      data,
    })
  },
  editUser(data){
    return request({
      url:"/user/editUser",
      method : "post",
      mock: true,
      data,
    })
  },
  getOverviewData() {
    return request({
      url: '/mall/getOverviewData',
      method: 'get',
      mock: true,
    });
  },
  getCategoryOptions() {
    return request({
      url: '/mall/getCategoryOptions',
      method: 'get',
      mock: true,
    });
  },
  getSalesTrendData(data) {
    return request({
      url: '/mall/getSalesTrendData',
      method: 'get',
      mock: true,
      data,
    });
  },
  getCategoryDistributionData() {
    return request({
      url: '/mall/getCategoryDistributionData',
      method: 'get',
      mock: true,
    });
  },
  getProductList(data) {
    return request({
      url: '/mall/getProductList',
      method: 'get',
      mock: true,
      data,
    });
  },
  addProduct(data) {
    return request({
      url: '/mall/addProduct',
      method: 'post',
      mock: true,
      data,
    });
  },
  updateProduct(data) {
    return request({
      url: '/mall/updateProduct',
      method: 'post',
      mock: true,
      data,
    });
  },
  deleteProduct(data) {
    return request({
      url: '/mall/deleteProduct',
      method: 'get',
      mock: true,
      data,
    });
  },
};
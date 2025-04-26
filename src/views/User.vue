<script setup>
import {ref,getCurrentInstance,onMounted,reactive,nextTick} from 'vue'
import {ElMessageBox,ElMessage}from 'element-plus' 
const handleClick = () => {
  console.log('click')
}

const tableData = ref([])

const {proxy} = getCurrentInstance();
const getUserData = async ()=>{
  console.log('正在请求用户数据，当前页码:', config.page)
    const requestParams = {
      page: config.page,
      pageSize: 10,
      name: config.name
    }
    console.log('发送请求参数:', requestParams)
    let data = await proxy.$api.getUserData(requestParams)
    console.log('接收到的数据:', data)
    if (data && data.list) {
      tableData.value = data.list.map(item=>({
        ...item,
        sexLabel : item.sex === '1' ? '男' : '女'
      }))
      config.total = data.count
      console.log('数据已更新，当前页数据条数:', tableData.value.length)
    } else {
      console.error('返回数据格式不正确:', data)
    }
   
}


const tableLabel = reactive([
  {
    prop:'name',
    label:'姓名'
  },
  {
    prop:'age',
    label:'年龄'
  },
    {
    prop:'sexLabel',
    label:'性别'
  },
    {
    prop:'birth',
    label:'出生日期',
    width:200
  },
    {
    prop:'addr',
    label:'地址'
  },
])
const formInline = reactive({
  keyWord:''
})
const config = reactive({
  name:'',
  total:0,
  page:1
})
const handleChange = (page)=>{
  // console.log('页码改变:', page)
  config.page = page
  getUserData()
}
const handleSearch = ()=>{
  config.name=formInline.keyWord;
  getUserData();
}
const handleDelete = (val)=>{
  ElMessageBox.confirm("Are you sure to delete?").then(async()=>{
    await proxy.$api.deleteUser({id:val.id});
    ElMessage({
      showClose:true,
      message:'Succeeded to delete!',
      type:'success'
    })
    getUserData()
  })
}
const action = ref('add')
const dialogVisible = ref(false)
const formUser = reactive({
  sex:'1',
})
//表单校验规则
const rules = reactive({
  name: [{ required: true, 
  message: "姓名是必填项", trigger: "blur" }],  
  age: [
    { required: true, message: "年龄是必填项", trigger: "blur" },   
    { type: "number", message: "年龄必须是数字" },  ],  
    sex: [{ required: true, message: "性别是必选项", trigger: "change" }], 
    birth: [{ required: true, message: "出生日期是必选项" }],  
    addr:[{ required: true, message: '地址是必填项' }]
})
//这个方法之前定义过
  const handleAdd = () => {
    action.value="add"    
    //打开对话窗    
    dialogVisible.value=true
  }
//对话框右上角的关闭事件
  const handleClose = () => {
    //获取到表单dom，执行resetFields重置表单    
    proxy.$refs["userForm"].resetFields()
    //关闭对话框    
    dialogVisible.value=false
  }
//对话框右下角的取消事件
  const handleCancel = () => {
    proxy.$refs["userForm"].resetFields()
    dialogVisible.value=false
  }
// 格式化日期
  const timeFormat = (time)=>{
    var time = new Date(time)
    var year = time.getFullYear()
    var month = time.getMonth()+1
    var date = time.getDate()
    function add(m){
      return m<10 ? "0" + m : m
    }
    return year +'-'+add(month)+"-"+add(date)
  }
  
  const onSubmit = ()=>{
    // 校验
    proxy.$refs['userForm'].validate(async (valid)=>{
      if(valid){
        let res = null;
        formUser.birth = /^\d{4}-\d{2}-\d{2}$/.test(formUser.birth) ? formUser.birth : 
        timeFormat(formUser.birth)
        if(action.value === 'add'){
            console.log(formUser);
            res = await proxy.$api.addUser(formUser)
          }else{
            res = await proxy.$api.editUser(formUser)
          }
        if(res){
            dialogVisible.value = false
            proxy.$refs['userForm'].resetFields()
            getUserData()
          }
      }else{
          ElMessage({
            showClose:true,
            message:"请输入正确的内容",
            type:'error',
          })
        }
      
    })
  }
  const handleEdit= (val) =>{
    action.value = 'edit'
    dialogVisible.value = true
    Object.assign(formUser,{...val,sex:''+val.sex})
    nextTick(()=>{
      Object.assign(formUser,{...val,sex:''+val.sex})
    })
  }

onMounted(()=>{
  getUserData()
})
</script>

<template>
<div>
  <div class="user-header">
    <el-button type="primary" @click="handleAdd">Add</el-button>
    <el-form inline="true" class="el-form" :model="formInline">
      <el-form-item label="Please Input" class="form-label">
        <el-input placeholder="username" v-model="formInline.keyWord"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">Search</el-button>
      </el-form-item>
    </el-form>
  </div>
  <div class="table">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column
        v-for ="item in tableLabel"
        :key='item.prop'
        :width="item.width ? item.width : 200"
        :prop="item.prop" 
        :label="item.label"
      />

      <el-table-column fixed="right" label="Operations" min-width="120">
        <template #="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" >
            Edit
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pager"
    background
    layout="prev,pager,next" 
    size:small
    :total="config.total"
    @current-change = "handleChange"/>
  </div>
  <el-dialog
    v-model="dialogVisible"
    :title="action == 'add' ? '新增用户' : '编辑用户'"
    width="35%"
    :before-close="handleClose"
  >
       <!--需要注意的是设置了:inline="true"，
        会对el-select的样式造成影响，我们通过给他设置一个class=select-clearn
        在css进行处理-->
    <el-form :inline="true"  :model="formUser" :rules="rules" ref="userForm">
      <el-row>
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="formUser.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年龄" prop="age">
            <el-input v-model.number="formUser.age" placeholder="请输入年龄" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item class="select-clearn" label="性别" prop="sex">
            <el-select  v-model="formUser.sex" placeholder="请选择">
              <el-option label="男" value="1" />
              <el-option label="女" value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出生日期" prop="birth">
            <el-date-picker
              v-model="formUser.birth"
              type="date"
              placeholder="请输入"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item
          label="地址"
          prop="addr"
        >
          <el-input v-model="formUser.addr" placeholder="请输入地址" />
        </el-form-item>
      </el-row>
      <el-row style="justify-content: flex-end">
        <el-form-item>
          <el-button type="primary" @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </el-form-item>
      </el-row>
    </el-form>
  </el-dialog>
</div>
</template>

<style scoped lang="less">
  .user-header{
    display: flex;
    justify-content: space-between;

  }
  .table{
    position: relative;
    height: 600px;
    .pager{
      position: absolute;
      right: 50px;
      bottom: 30px;
      // margin-bottom:20px ;
    }
    .el-table{
      width: 100%;
      height: 580px;
    }
  }
  .select-clean{
    display: flex;
  }
</style>

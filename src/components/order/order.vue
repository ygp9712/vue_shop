<template>
  <div class="container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容"  class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="parseInt(scope.row.pay_status)">已付款</el-tag>
            <el-tag type="danger" v-if="!parseInt(scope.row.pay_status)">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send">
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editAddress(scope.row)" icon="el-icon-edit"></el-button>
            <el-button size="mini" type="success" @click="editProgress(scope.row)" icon="el-icon-location"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 编辑地址的对话框 -->
    <el-dialog title="修改订单地址" width="50%" @close="addressDialogClosed"
    :visible.sync="addressDialogVisible">
      <!-- 主体区域 -->
      <el-form :model="addressForm" :rules="addressFormRules"
        ref="addressFormRef"  label-width="100px">
        <el-form-item label="省市区/县" prop="address1" required>
          <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2" required>
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑进度的对话框 -->
    <el-dialog title="物流进度" width="50%" @close="progressDialogClosed"
    :visible.sync="progressDialogVisible">
      <!-- 主体区域 -->
      <el-timeline>
        <el-timeline-item
        v-for="(item, index) of progressInfo" :key="index"
        :timestamp="item.time">
          {{item.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  name: 'order',
  data () {
    return {
      addressDialogVisible: false,
      progressDialogVisible: false,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderList: [],
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          {
            required: true,
            message: '请输入省市区县',
            trigger: 'blur'
          }
        ],
        address2: [
          {
            required: true,
            message: '请输入详细地址',
            trigger: 'blur'
          }
        ]
      },
      cityData,
      progressInfo: []
    }
  },
  methods: {
    async editProgress () {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败!')
      }
      this.progressInfo = res.data
      this.progressDialogVisible = true
    },
    editAddress (row) {
      this.addressDialogVisible = true
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.total = res.data.total
      this.orderList = res.data.goods
    },
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    progressDialogClosed () {}
  },
  created () {
    this.getOrderList()
  }
}
</script>

<style lang="stylus" scoped>
  .el-cascader
    width: 100%
</style>

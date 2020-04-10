<template>
  <div class="container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table class="treeTable" :data="cateList" :columns="columns"
      :selection-type="false" :expand-type="false" show-index
      index-text="#" border :show-row-hover="false">
        <template slot="isok" slot-scope="scope">
          <i style="color: lightgreen;" class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
          <i style="color: red;" class="el-icon-error" v-else></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" size="mini" type="success">二级</el-tag>
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" @click="showEditDialog(scope.row.cat_id)">
            <i class="el-icon-edit"></i>编辑
          </el-button>
          <el-button size="mini" type="danger" @click="deleteCate(scope.row.cat_id)">
            <i class="el-icon-delete"></i>删除
          </el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" @close="handleAddDialogClose"
    :visible.sync="addCatDialogVisible">
      <!-- 主体区域 -->
      <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <!-- :option用来指定选择器的数据源 -->
          <el-cascader
            v-model="selectedKeys" clearable
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged">
          </el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog title="编辑分类" @close="handleEditDialogClose"
    :visible.sync="editCatDialogVisible">
      <!-- 主体区域 -->
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'categories',
  data () {
    return {
      addForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级，默认要添加的是一级分类
        cat_level: 0
      },
      editForm: {
        cat_name: ''
      },
      cateList: [],
      // 父级分类列表
      parentCateList: [],
      // 级联选择器的配置
      // 通过 props.checkStrictly = true 来设置父子节点取消选中关联，从而达到选择任意一级选项的目的
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 级联选择器选中的值
      selectedKeys: [],
      addCatDialogVisible: false,
      editCatDialogVisible: false,
      total: 0,
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 表单校验规则
      rules: {
        cat_name: [{
          required: true,
          message: '请输入分类名称！',
          trigger: 'blur'
        }]
      },
      // treeTable的列的定义
      columns: [
        {
          label: '分类属性',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义位模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ]
    }
  },
  methods: {
    deleteCate (id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败！')
        }
        this.$message.success('删除成功')
        this.getCateList()
      }).catch(() => {
        this.$message.info('取消删除')
      })
    },
    editCate () {
      console.log('5132')
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}`, { cat_name: this.editForm.cat_name })
          if (res.meta.status !== 200) {
            return this.$message.error('编辑分类信息失败！')
          }
          this.$message.success('编辑分类信息成功')
          this.getCateList()
          this.editCatDialogVisible = false
        }
      })
    },
    addCate () {
      console.log(this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('categories', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败')
          }
          this.$message.success('添加分类成功')
          this.getCateList()
          this.addCatDialogVisible = false
        }
      })
    },
    // 监听添加对话框的关闭
    handleAddDialogClose () {
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },
    // 监听编辑对话框的关闭
    handleEditDialogClose () {
      this.editForm = {}
      this.$refs.editFormRef.resetFields()
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取该分类信息失败！')
      }
      this.editForm = res.data
      this.editCatDialogVisible = true
    },
    // 展示添加分类的对话框
    showAddDialog () {
      this.getParentCateList()
      this.addCatDialogVisible = true
    },
    // 监听pagenum的改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 改变每页数量的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 获取分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        console.log(res)
        return this.$message.error('加载分类失败！')
      }
      // 把数据列表赋值给catelist
      this.cateList = res.data.result
      // 赋值数据总条数
      this.total = res.data.total
      console.log(this.cateList)
    },
    async getParentCateList () {
      console.log('4523')
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentCateList = res.data
    },
    parentCateChanged () {
      // 如果 selectedKeys 数组中的 length 大于0， 证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的id
        this.addForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addForm.cat_level = 0
      }
    }
  },
  created () {
    this.getCateList()
  }
}
</script>

<style lang="stylus" scoped>
  .container
    width: 100%;
    height: 100%;
    .treeTable
      margin-top: 20px;
</style>

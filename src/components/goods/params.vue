<template>
  <div class="contaniner">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告信息 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！"
      type="warning" show-icon :closable="false"></el-alert>
      <!-- 商品分类区域 -->
      <el-row style="margin: 15px 0;">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cascaderProps"
            @change="cateChange">
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数页面 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 动态参数的按钮 -->
          <el-button type="primary" :disabled="isBtnDisabled" @click="showAddDialog">添加参数</el-button>
          <!-- 动态参数的表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- v-for循环渲染tag标签 -->
                <el-tag v-for="(item, index) of scope.row.attr_vals" :key="index" closable @close="handleTagClose(scope.row, index)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary"  @click="showEditDialog(scope.row.attr_id)"><i class="el-icon-edit"></i>操作</el-button>
                <el-button size="mini" type="danger" @click="deleteParams(scope.row.attr_id)"><i class="el-icon-delete"></i>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性页面 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 静态属性的按钮 -->
          <el-button type="primary" :disabled="isBtnDisabled" @click="showAddDialog">添加属性</el-button>
          <!-- 静态属性的表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- v-for循环渲染tag标签 -->
                <el-tag v-for="(item, index) of scope.row.attr_vals" :key="index" closable @close="handleTagClose(scope.row, index)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="showEditDialog(scope.row.attr_id)"><i class="el-icon-edit"></i>操作</el-button>
                <el-button size="mini" type="danger" @click="deleteParams(scope.row.attr_id)"><i class="el-icon-delete"></i>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="60%"
      @close="handleAddDialogClose">
      <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="60%"
      @close="handleEditDialogClose">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'params',
  data () {
    return {
      addDialogVisible: false,
      editDialogVisible: false,
      cateList: [],
      // 级联选择器的配置
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedCateKeys: [],
      // 被激活的tab页签的名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      addForm: {},
      editForm: {},
      rules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 展示tag列的input
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    showAddDialog () {
      this.addDialogVisible = true
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(`获取${this.titleText}失败！`)
      }
      this.editForm = res.data
      this.editDialogVisible = true
      console.log(id)
    },
    handleEditDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    handleAddDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    handleTabClick () {
      this.getParamsData()
    },
    handleTagClose (row, index) {
      console.log(index)
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    // 处理标签Input的确认事件
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      console.log(row.inputValue)
      row.inputValue = ''
      // 发请请求时需要将数组转变成字符串，因为服务器中储存格式是字符串
      this.saveAttrVals(row)
    },
    deleteParams (id) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除参数失败！')
        }
        this.$message.success('删除成功')
        this.getParamsData()
      }).catch(() => {
        this.$message.info('取消删除')
      })
    },
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            return this.$message.error(`修改${this.titleText}失败！`)
          }
          this.$message.success(`添加${this.titleText}成功`)
          this.getParamsData()
          this.editDialogVisible = false
        }
      })
    },
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error(`添加${this.titleText}失败！`)
          }
          this.$message.success('添加参数成功')
          this.getParamsData()
          this.addDialogVisible = false
        }
      })
    },
    cateChange () {
      this.getParamsData()
    },
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }
      // 向渲染tag的数组中添加新增的值
      this.$message.success('修改参数成功！')
    },
    async getParamsData () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return null
      }
      // 根据所选分类的Id和当前所处的面板获取相应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败！')
      }
      this.cateList = res.data
    }
  },
  computed: {
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
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
    .el-tag
      margin: 10px;
    .input-new-tag
      width: 120px;
</style>

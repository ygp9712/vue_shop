<template>
  <div class="container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- row是一行 -->
      <el-row :gutter="20">
        <!-- col是一行的细分 -->
        <el-col :span="8">
          <el-input clearable @clear="getUserList" placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table
        :data="userlist"
        style="width: 100%"
        border stripe>
        <el-table-column
          type="index"
          label="#">
        </el-table-column>
        <el-table-column
          prop="username"
          label="名称">
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱">
        </el-table-column>
        <el-table-column
          prop="role_name"
          label="角色">
        </el-table-column>
        <el-table-column
          prop="mobile"
          label="电话">
        </el-table-column>
        <el-table-column
          prop="mg_state"
          label="状态">
          <!-- 通过作用域插槽获取数据渲染开关 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="switchChange(scope.row)"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑用户" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除用户" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="60%"
      @close="handleDialogClose">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
        <el-form-item label="用户名称" prop="username" required>
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" prop="password" required>
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email" required>
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="mobile" required>
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="60%" ref="editFormRef"
      @close="handleEditDialogClose">
      <!-- 内容区域 -->
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名称">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email" required>
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="mobile" required>
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'users',
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }
    return {
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页的数量
        pagesize: 2
      },
      userlist: [],
      total: 0,
      dialogVisible: false,
      editDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {
        username: '',
        password: '',
        mobile: ''
      },
      rules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 12,
            message: '长度在3-12个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '长度在6-15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入联系方式',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 展示用户编辑的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      console.log(id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加用户失败')
          }
          this.$message.success('添加用户成功')
          this.dialogVisible = false
          this.getUserList()
        }
      })
    },
    // 编辑用户信息
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          console.log('通过')
          const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
          if (res.meta.status !== 200) {
            this.$message.error('编辑用户信息失败')
          }
          this.$message.success('编辑用户信息成功')
          this.editDialogVisible = false
          this.getUserList()
        }
      })
    },
    // 删除用户
    async deleteUser (id) {
      console.log(id)
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败！')
        }
        this.$message.success('删除成功')
        this.getUserList()
      }).catch(() => {
        this.$message.info('取消删除')
      })
      console.log(confirmResult)
    },
    // 监听编辑Dialog关闭事件
    handleEditDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 监听添加Dialog关闭事件
    handleDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 状态改变开关
    async switchChange (userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 监听每页数量改变事件
    handleSizeChange (newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码改变事件
    handleCurrentChange (newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 按照参数获取用户列表
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户数据失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(this.userlist)
    }
  },
  created () {
    this.getUserList()
  }
}
</script>

<style lang="stylus" scoped>
  .container
    width: 100%;
    height: 100%;
</style>

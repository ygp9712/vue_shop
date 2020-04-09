<template>
  <div class="container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="dialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="roleList" stripe border>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['roleArea', 'vcenter', index === 0 ? 'topArea' : '']" v-for="(item, index) of scope.row.children" :key="item.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag class="mainTag" closable @close="removeRightById(scope.row, item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row :class="['roleArea2', 'vcenter', index_ === 0 ? 'topArea2' : '']" v-for="(item_,index_) of item.children" :key="item_.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item_.id)">{{item_.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item__) of item_.children" :key="item__.id" type="warning" closable @close="removeRightById(scope.row, item__.id)">{{item__.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column label="角色名称" prop="roleName">
        </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc">
        </el-table-column>
        <el-table-column label="操作" width="280px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="showEditDialog(scope.row.id)">
              <i class="el-icon-edit"></i>编辑
            </el-button>
            <el-button type="danger" size="mini" @click="deleteRole(scope.row.id)">
              <i class="el-icon-delete"></i>删除
            </el-button>
            <el-button type="warning" size="mini" @click="showSetDialog(scope.row)">
              <i class="el-icon-setting"></i>分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="dialogVisible"
      width="60%"
      @close="handleDialogClose">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName" required>
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" required>
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editDialogVisible"
      width="60%" ref="editFormRef"
      @close="handleEditDialogClose">
      <!-- 内容区域 -->
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName" required>
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" required>
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配用户权限" :visible.sync="setDialogVisible"
                width="40%" ref="editFormRef" @close="handleSetDialogClose">
      <!-- 主体区域 -->
      <el-tree :data="rightslist" :props="treeProps" show-checkbox ref="treeRef"
              node-key="id" default-expand-all :default-checked-keys="defKeys">
      </el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'roles',
  data () {
    return {
      currentRoleId: '',
      roleList: [],
      rightslist: [],
      dialogVisible: false,
      editDialogVisible: false,
      setDialogVisible: false,
      // 默认选中的节点id值
      defKeys: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      editForm: {
        roleName: '',
        roleDesc: ''
      },
      rules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 15,
            message: '长度在1-15个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          },
          {
            min: 1,
            max: 15,
            message: '长度在1-15个字符之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 显示分配权限对话框
    async showSetDialog (role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightslist = res.data
      console.log(this.rightslist)
      this.getLeafKeys(role, this.defKeys)
      this.currentRoleId = role.id
      this.setDialogVisible = true
    },
    // 显示编辑角色对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      console.log(id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisible = true
    },
    async setRole () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.currentRoleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色权限失败！')
      }
      this.setDialogVisible = false
      this.getRoleList()
      this.$message.success('分配角色权限成功！')
    },
    // 处理删除角色
    deleteRole (id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败！')
        }
        this.$message.success('删除成功')
        this.getRoleList()
      }).catch(() => {
        this.$message.info('取消删除')
      })
    },
    // 处理编辑角色
    editRole () {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, this.editForm)
          if (res.meta.status !== 200) {
            console.log(res)
            return this.$message.error('编辑用户信息失败')
          }
          this.$message.success('编辑用户信息成功')
          this.editDialogVisible = false
          this.getRoleList()
        }
      })
    },
    // 处理添加角色
    addRole () {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('roles', this.addForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加角色失败')
          }
          this.$message.success('添加角色成功')
          this.dialogVisible = false
          this.getRoleList()
        }
      })
    },
    // 处理添加角色对话框关闭
    handleDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 处理编辑角色对话框关闭
    handleEditDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 处理分配权限对话框关闭
    handleSetDialogClose () {
      this.defKeys = []
    },
    // 获取角色列表
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.roleList = res.data
      console.log(this.roleList)
    },
    //  根据ID删除权限
    removeRightById (role, rightId) {
      this.$confirm('是否删除该权限?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        console.log(123)
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        }
        this.$message.success('删除权限成功！')
        role.children = res.data
      }).catch(() => {
        this.$message.info('已经取消删除')
      })
    },
    // 通过递归获取角色下所有三级权限的id,并保存到defKeys数组中
    getLeafKeys (node, arr) {
      // 如果当前节点不包含children属性，即为三级节点并退出递归
      if (!node.children) {
        return arr.push(node.id)
      }

      // 递归函数体
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    }
  },
  created () {
    this.getRoleList()
  }
}
</script>

<style lang="stylus" scoped>
  .container
    width: 100%;
    height: 100%;
    .el-tag
      margin: 7px;
    .roleArea
      margin: 5px 0;
      padding: 5px 0;
      border-bottom: 1px  solid #eaeaea;
    .roleArea2
      margin: 5px 0;
      padding: 5px 0;
      border-top: 1px  solid #eaeaea;
    .topArea
      border-top: 1px solid #eaeaea;
    .topArea2
      border-top: 0;
    .vcenter
      display: flex;
      align-items: center;
</style>

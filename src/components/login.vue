<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar-box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录区域 -->
      <el-form ref="loginFormRef" class="login-form" :rules="rules"  :model="form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" placeholder="请输入用户名" v-model="form.username" ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input type="password" prefix-icon="iconfont icon-3702mima" placeholder="请输入密码" v-model="form.password" ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button @click="handleLogin" type="primary">登录</el-button>
          <el-button @click="handleReset" type="info">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      form: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username:
          [
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
        ]
      }
    }
  },
  methods: {
    handleLogin () {
      this.$refs.loginFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('login', this.form)
          console.log(res)
          if (res.meta.status !== 200) {
            return this.$message.error('登录失败')
          } else {
            this.$message.success('登录成功')
            window.sessionStorage.setItem('token', res.data.token)
            this.$router.push('/home')
          }
        }
      })
    },
    handleReset () {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="stylus" scoped>
  .login-container
    display: block;
    background: #2b4b6b;
    width: 100%;
    height: 100%;
    .login-box
      width: 450px;
      height: 300px;
      background-color: white;
      border-radius: 3px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      .avatar-box
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 130px;
        width: 130px;
        border-radius: 50%;
        padding: 10px;
        border: 2px solid #eee;
        overflow: hidden;
        box-shadow: 0 0 10px #ddd
        background: white;
        img
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #eee;
    .login-form
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
    .btns
      display: flex;
      justify-content: flex-end;
</style>

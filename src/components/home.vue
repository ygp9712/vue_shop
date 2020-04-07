<template>
    <el-container class="container">
      <!-- 头部区域↓ -->
      <el-header>
        <div class="left-div">
          <img src="../assets/heima.png" alt="">
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="handleLogout">注销
        </el-button>
      </el-header>
      <!-- 头部区域↑ -->
      <!-- 主体区域↓ -->
      <el-container>
        <!-- 侧边栏区域 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="handleCollapse">|||</div>
          <!-- 侧边栏菜单区域 -->
          <el-menu
            :default-active="activePath"
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409EFF"
            :unique-opened="true"
            :collapse="isCollapse"
            :collapse-transition="false"
            :router="true" >
            <!-- 一级菜单 -->
            <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
              <!-- 一级菜单的模板区域 -->
              <template slot="title">
                <i :class="iconsObj[item.id]"></i>
                <span>{{item.authName}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item :index="'/'+subitem.path"
                v-for="subitem in item.children" :key="subitem.id"
                @click="saveNavState('/'+subitem.path)">
                <!-- 二级菜单的模板区域 -->
                <template>
                  <i class="el-icon-menu"></i>
                <span>{{subitem.authName}}</span>
              </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧内容主体 -->
        <el-main>
          <!-- 路由占位符 -->
          <router-view></router-view>
        </el-main>
      </el-container>
      <!-- 主体区域↑ -->
    </el-container>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      isCollapse: false,
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 被激活的链接地址
      activePath: ''
    }
  },
  methods: {
    handleLogout () {
      window.sessionStorage.clear()
      this.$message.info('完成注销')
      this.$router.push('/login')
    },
    handleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    saveNavState (path) {
      window.sessionStorage.setItem('activePath', path)
      this.activePath = path
    },
    // 获取菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menulist = res.data
      console.log(this.menulist)
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>

<style lang="stylus" scoped>
  .container
    height: 100%;
    .el-header
      padding-left: 0;
      background: #373d41
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      font-size: 30px;
      .left-div
        display: flex;
        align-items: center;
        span
          margin-left: 20px;
    .el-aside
      background: #333744
      height: 100%;
      .toggle-button
        background: #4a5064
        color: white;
        font-size: 10px;
        line-height: 24px;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
      .el-menu
        border: 0;
      .iconfont
        margin-right: 8px;
    .el-main
      background: #EAEDF1
</style>

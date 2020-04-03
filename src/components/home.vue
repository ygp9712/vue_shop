<template>
  <div>
    这里是home
    <el-button type="info" @click="handleLogout">注销</el-button>
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      ww: ''
    }
  },
  methods: {
    handleLogout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="stylus" scoped>
  .container
    width: 100%;
    height: 100%
</style>

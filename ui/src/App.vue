<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <AppLogo />
      </el-header>
      <el-main>
        <SealedSecrets />
      </el-main>
      <el-footer class="footer">
        <AppConfig />
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import AppLogo from "./components/AppLogo.vue"
import SealedSecrets from "./components/SealedSecrets.vue"
import AppConfig from "./components/AppConfig.vue"

export default {
  name: 'App',
  components: {
    AppLogo,
    SealedSecrets,
    AppConfig
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  text-align: center;
}
</style>

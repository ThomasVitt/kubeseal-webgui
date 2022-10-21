<template>
  <el-row justify="center">
    <el-col :span="11">
      <a
        id="logo"
        class="navbar-brand"
        href="#"
      >
        <el-image
          :src="logo"
          alt="Kubeseal-Webgui Logo"
          fit="fill"
          style="width: 35px"
        />
      </a>
      <span class="header-first">kubeseal</span>
      <span class="header-second">-webgui</span>
    </el-col>
    <el-col :span="1">
      <el-button
        class="primary"
        round
        @click="toggleDark()"
      >
        <Brightness6 />
      </el-button>
    </el-col>
  </el-row>
</template>

<script>
import { useDark, useToggle } from '@vueuse/core'
import Brightness6 from 'vue-material-design-icons/Brightness6.vue';

const isDark = useDark()

function toggleDark() {
  useToggle(isDark)
}

const logo = require('../assets/logo.png')
export default {
  name: 'AppLogo',
  components: {
    Brightness6,
  },
  data() {
    return {
      logo,
      isDark: useDark()
    }
  }
}
</script>
<style scoped>
.header-first {
  color: #007bff;
}

.header-second {
  color: orange;
}

span {
  font-size: 2.5em;
}
</style>
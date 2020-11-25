<template>
  <header class="clearfix">
    <div class="header_logo">
      <a>
        <img
          :src="logoPro"
          style="width: 150px; height: 30px; vertical-align: middle"
        />
      </a>
    </div>
    <div class="menu_display" @click="showDwon"></div>
  </header>
</template>

<script>
import { mapMutations } from 'vuex'
export default {
  name: 'HeaderLogo',
  props: {
    logoTitle: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isShow: false,
      logoPro: require('@/assets/images/zxdt/logo.jpg'),
    }
  },
  methods: {
    ...mapMutations({
      changeState: 'changeState',
    }),
    showDwon() {
      this.isShow = !this.isShow
      this.changeState(this.isShow)
    },
  },
}
</script>

<style scoped>
header {
  position: relative;
  z-index: 1;
  padding: 10px 0;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  display: block;
  background: #fff;
  width: 100%;
}

.clearfix::before,
.clearfix::after {
  clear: both;
  display: table;
  content: '';
}

.header_logo {
  float: left;
  margin-right: 5px;
  margin-left: 8px;
  width: 185px;
  height: 25px;
}

.menu_display {
  float: right;
  margin-top: 8px;
  margin-right: 10px;
  width: 19px;
  height: 15px;
  border: none;
  background: url(../../assets/images/indexImg.png) -324px 0 no-repeat;
  cursor: pointer;
}
</style>

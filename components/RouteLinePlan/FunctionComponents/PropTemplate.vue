<template>
  <div class="poptemplate-view">
    <div class="poptemplate-header">
      <span class="name-tilte">{{ poiName }}</span>
      <span class="close-prop" @click="closeProp">
        <img :src="img.closeImg" />
      </span>
    </div>
    <div v-show="showDown" class="poptemplate-content">
      <slot name="popup-body"></slot>
    </div>
    <!--<img :src="img.downImg" class="img-down" />-->
  </div>
</template>

<script>
export default {
  name: 'PopTemplate',
  props: ['poiName', 'showDown'],
  data() {
    return {
      img: {
        closeImg: require('@/assets/images/close.png'),
      },
    }
  },
  watch: {},
  methods: {
    /**
     * 关闭弹窗
     */
    closeProp() {
      this.$emit('closeprop')
    },
  },
}
</script>

<style scoped>
.poptemplate-view {
  width: 380px;
  background-color: #fff;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.3);
}
.poptemplate-header {
  width: 100%;
  height: 50px;
  position: relative;
  border-bottom: 1px solid #c3c3c3;
}
.name-tilte {
  position: relative;
  font-weight: 700;
  font-size: 15px;
  top: 20px;
  left: 10px;
  width: 240px;
  height: 20px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}
.close-prop {
  float: right;
  cursor: pointer;
}
.poptemplate-content {
  width: 100%;
  height: calc(100% - 95px);
  padding: 0 10px;
  margin-top: 10px;
}
</style>

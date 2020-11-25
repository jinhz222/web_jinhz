<template>
  <div>
    <div><span class="data-top">区县列表</span></div>
    <div>
      <div v-for="(item, index) in 5" :key="index">
        <div class="block-data" @click="showData(index)">
          <img src="#" />
          <span>金牛区</span>
          <br />
          <span>具体描述</span>
        </div>
      </div>
    </div>
    <div class="data-show" v-show="isShow"></div>
  </div>
</template>

<script>
export default {
  name: 'CityMapData',
  data() {
    return {
      isShow: false,
    }
  },
  methods: {
    showData(index) {
      alert(index)
      this.isShow = !this.isShow
    },
  },
}
</script>

<style lang="scss" scoped>
.data-top {
  position: relative;
  float: left;
  width: 100%;
  margin-bottom: 10px;
  margin-top: 15px;
  margin-left: 10px;
  padding-top: 10px;
  border-bottom-color: rgb(238, 238, 238);
  border-bottom-style: solid;
  border-bottom-width: 1px;
}
.data-show {
  position: absolute;
  top: 10px;
  right: -1050px;
  width: 300px;
  height: 500px;
  background-color: rgba(0, 0, 0, 0.5);
}
.block-data {
  float: left;
  margin-bottom: 5px;
  display: block;
  width: 100%;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}
</style>
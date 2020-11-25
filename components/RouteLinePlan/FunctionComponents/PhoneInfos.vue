<template>
  <div v-show="showFlag" class="phone-div">
    <span>电话：{{ phoneInfo }}</span>
  </div>
</template>

<script>
export default {
  props: ['phoneinfo'],
  data() {
    return {
      showFlag: false,
      phoneInfo: '',
    }
  },
  computed: {},
  watch: {
    phoneinfo(value) {
      if (typeof value !== 'undefined') {
        if (value !== '' && value !== null && value !== ' ') {
          this.phoneInfo = value
          this.showFlag = true
        } else {
          this.showFlag = false
        }
      } else {
        this.showFlag = false
      }
    },
  },
  methods: {},
}
</script>
<style scoped>
.phone-div {
  position: relative;
  float: left;
  padding-left: 57px;
  padding-top: 10px;
  color: #7f7f7f;
  width: 248px;
  font-size: 12px;
  font-family: 'PingFang SC';
  font-weight: 400;
  font-style: normal;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}
</style>

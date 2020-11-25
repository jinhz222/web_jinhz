<template>
  <div v-show="showFlag">
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
<style scoped></style>

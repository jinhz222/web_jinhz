<template>
  <div>
    <div v-for="(item, index) in moreData" :key="index" class="more-info">
      <span class="index-num">{{ index + 1 }})</span>
      {{ item }}
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: ['moreData'],
  data() {
    return {}
  },
  computed: {},
  watch: {},
  methods: {
    showMore() {},
  },
}
</script>

<style scoped>
.more-info {
  font-size: 13px;
  padding-left: 10px;
}
.index-num {
  color: #2f87eb;
}
</style>
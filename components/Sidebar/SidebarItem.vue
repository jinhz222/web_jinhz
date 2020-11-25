<template>
  <div v-if="!item.hidden">
    <template>
      <app-link :to="resolvePath()">
        <el-menu-item :index="resolvePath()">
          <item :icon="itemIcon" :title="itemTitle" />
        </el-menu-item>
      </app-link>
    </template>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'

import AppLink from './AppLink'
import Item from './Item'

export default {
  name: 'SidebarItem',
  components: {
    AppLink,
    Item,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    isNest: {
      type: Boolean,
      default: false,
    },
    basePath: {
      type: String,
      default: '',
    },
  },
  computed: {
    itemIcon() {
      return this.item.meta.icon
    },
    itemTitle() {
      return this.item.meta.title
    },
  },
  methods: {
    resolvePath() {
      const routePath = this.item.path

      if (isExternal(routePath)) {
        return routePath
      }

      if (isExternal(this.basePath)) {
        return this.basePath
      }

      return path.resolve(this.basePath, routePath)
    },
  },
}
</script>

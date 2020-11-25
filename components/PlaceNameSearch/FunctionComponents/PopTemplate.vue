<template>
  <div class="poptemplate-view">
    <div class="poptemplate-header">
      <el-tooltip :content="modalTitle" placement="bottom" effect="light">
        <span class="name-tilte">{{ modalTitle }}</span>
      </el-tooltip>
      <span class="span-share-name" @click="showShare">
        <img :src="img.shareImg" />
      </span>
      <div v-show="isShare" class="span-share-content">
        <input
          v-model="shareText"
          type="text"
          placeholder="正在获取分享链接。。。"
          class="share-text"
        />
        <span class="share-cancel" @click="shareCancel">取消</span>
        <span
          :data-clipboard-text="shareText"
          id="copyText"
          class="share-copy"
          @click="shareCopy"
          >复制</span
        >
      </div>
      <span class="span-collection-name" @click="showCollection">
        <img :src="img.collectionImg" />
      </span>
      <div v-show="isCollection" class="span-collection-content">
        <span class="collection-group">选择分组</span>
        <div class="collection-select">
          <el-select size="small" v-model="value" placeholder="请选择">
            <el-option
              v-for="item in cities"
              :key="item.value"
              :value="item.value"
            >
              <span class="el-icon-folder icon-position"></span>
              <span class="value-position">{{ item.value }}</span>
            </el-option>
          </el-select>
        </div>
        <span class="collection-cancel" @click="closeCollection">取消</span>
        <span class="collection-save" @click="saveCollection">保存</span>
      </div>
      <span @click="$emit('closepopup')">
        <img :src="img.closeImg" />
      </span>
    </div>
    <div class="poptemplate-content">
      <slot name="popup-body"></slot>
    </div>
    <div class="poptemplate-footer">
      <div class="btn-list">
        <div class="btn-item">
          <img :src="img.nearImg" class="btn-img" />
          <span class="btn-content">在附近找</span>
          <img :src="img.rightImg" class="btn-right" />
        </div>
        <div class="btn-item" @click="$emit('setsposition', '起点')">
          <img :src="img.startImg" class="btn-img" />
          <span class="btn-content">设为起点</span>
        </div>
        <div class="btn-item" @click="$emit('setsposition', '途经点')">
          <img :src="img.passImg" class="btn-img" />
          <span class="btn-content">经过这里</span>
        </div>
        <div class="btn-item" @click="$emit('setsposition', '终点')">
          <img :src="img.endImg" class="btn-img" />
          <span class="btn-content">设为终点</span>
        </div>
      </div>
      <div class="search-view">
        <div class="hot-place">
          <a href="javascript:;" @click="$emit('searchnear', '学校')">学校</a>
          <a href="javascript:;" @click="$emit('searchnear', '医院')">医院</a>
          <a href="javascript:;" @click="$emit('searchnear', '公交站')"
            >公交站</a
          >
          <a href="javascript:;" @click="$emit('searchnear', '银行')">银行</a>
        </div>
        <div class="input-search">
          <input
            v-model="nearbyInput"
            type="text"
            class="btn-input"
            @keydown.enter="clickSearch"
          />
          <span @click="clickSearch" class="btn-span">搜索</span>
        </div>
      </div>
    </div>
    <span class="img-down"></span>
  </div>
</template>

<script>
import Clipboard from 'clipboard'
import { poiShare } from '@/api/poiRequest'
import { Message } from 'element-ui'

export default {
  name: 'PopTemplate',
  props: {
    modalTitle: String,
    hotPointid: String,
  },
  data() {
    return {
      nearbyInput: '',
      shareText: null,
      isShare: false,
      isCollection: false,
      img: {
        closeImg: require('@/assets/images/close.png'),
        shareImg: require('@/assets/images/share.png'),
        collectionImg: require('@/assets/images/collection.png'),
        nearImg: require('@/assets/images/2.png'),
        startImg: require('@/assets/images/3.png'),
        passImg: require('@/assets/images/4.png'),
        endImg: require('@/assets/images/5.png'),
        rightImg: require('@/assets/images/1.png'),
        downImg: require('@/assets/images/down.png'),
      },
      cities: [
        {
          value: '收藏夹1',
        },
        {
          value: '收藏夹2',
        },
      ],
      value: '',
    }
  },
  watch: {},
  methods: {
    /**
     * 输入框周边搜索
     */
    clickSearch() {
      this.$emit('searchnear', this.nearbyInput)
      this.nearbyInput = ''
    },
    /**
     * 点击分享
     */
    showShare() {
      this.isCollection = false
      this.isShare = !this.isShare
      if (this.isShare) {
        const self = this
        poiShare(this.hotPointid)
          .then((res) => {
            self.shareText = res.data.url
          })
          .catch((err) => {
            console.log(err)
          })
      }
    },
    /**
     * 取消分享
     */
    shareCancel() {
      this.isShare = false
    },
    /**
     * 复制分享内容
     */
    shareCopy() {
      const clipboardText = new Clipboard('#copyText')
      clipboardText.on('success', (e) => {
        alert('复制成功')
        clipboardText.destroy()
      })
      clipboardText.on('error', (e) => {
        Message({
          message: '该浏览器不支持自动复制',
          type: 'warning',
        })
        clipboardText.destroy()
      })
    },
    /**
     * 点击收藏
     */
    showCollection() {
      this.isShare = false
      this.isCollection = !this.isCollection
    },
    /**
     * 取消收藏
     */
    closeCollection() {
      this.isCollection = false
    },
    /**
     * 保存收藏
     */
    saveCollection() {
      // 进行收藏网络接口的调用
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
  margin-bottom: 5px;
  border-bottom: 1px solid #c3c3c3;
}
.name-tilte {
  width: 280px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}
.poptemplate-header > span:last-child {
  position: absolute;
  right: 10px;
  margin-top: 5px;
  font-size: 12px;
  cursor: pointer;
}
.poptemplate-header > span:first-child {
  position: absolute;
  left: 10px;
  line-height: 20px;
  font-size: 17px;
  margin-top: 25px;
}
.poptemplate-header > span:last-child:hover {
  color: red;
}
.span-share-name {
  position: absolute;
  right: 40px;
  top: 25px;
  cursor: pointer;
}
.span-share-content {
  position: absolute;
  width: 365px;
  left: 5px;
  right: 5px;
  height: 40px;
  top: 50px;
  background-color: #f2f2f2;
}
.share-text {
  position: relative;
  top: 5px;
  height: 25px;
  width: 260px;
  left: 10px;
}
.share-cancel {
  position: relative;
  left: 15px;
  top: 3px;
  text-align: center;
  width: 37px;
  height: 20px;
  display: inline-block;
  background: #3385ff;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}
.share-copy {
  position: relative;
  left: 15px;
  top: 3px;
  text-align: center;
  width: 37px;
  height: 20px;
  display: inline-block;
  background: #3385ff;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}
.span-collection-name {
  position: absolute;
  right: 10px;
  top: 25px;
  cursor: pointer;
}
.span-collection-content {
  position: absolute;
  width: 150px;
  height: 90px;
  top: 49px;
  right: 10px;
  font-size: 14px;
  z-index: 2;
  padding-top: 5px;
  padding-right: 5px;
  padding-bottom: 5px;
  padding-left: 5px;
  display: block;
  background-color: #f2f2f2;
  box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.15);
}
.collection-group {
  position: relative;
  margin-top: 5px;
  margin-right: 5px;
  margin-bottom: 5px;
  margin-left: 5px;
}
.collection-select {
  position: relative;
  margin-top: 5px;
}
.icon-position {
  position: relative;
  left: 5px;
  float: left;
  top: 10px;
}
.value-position {
  position: relative;
  float: left;
  left: 15px;
  color: #8492a6;
  font-size: 13px;
}
.collection-cancel {
  position: relative;
  left: 15px;
  top: 3px;
  text-align: center;
  width: 37px;
  height: 20px;
  display: inline-block;
  background: #3385ff;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}
.collection-save {
  position: relative;
  left: 22px;
  top: 3px;
  text-align: center;
  width: 37px;
  height: 20px;
  display: inline-block;
  background: #3385ff;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}
.poptemplate-content {
  width: 100%;
  height: calc(100% - 95px);
  padding: 0 10px;
  margin-top: 10px;
}
.poptemplate-footer {
  height: 75px;
  width: 100%;
  padding-left: 10px;
  margin-top: 10px;
}
.btn-list {
  display: flex;
  height: 30px;
  width: 360px;
  border: 1px solid #c3c3c3;
}
.btn-item {
  position: relative;
  padding-left: 5px;
  padding-right: 5px;
  cursor: pointer;
  font-size: 14px;
  color: #0078a8;
  border-right: 1px solid #c3c3c3;
}
.btn-img {
  margin-top: 3px;
  float: left;
}
.btn-right {
  position: absolute;
  top: 16px;
  left: 75px;
}
.btn-content {
  margin-top: 3px;
  float: left;
}
.btn-item:first-child {
  border: 1px solid #be0106;
}
.btn-item:last-child {
  border-right: none;
}
.search-view {
  margin-top: 10px;
}
.hot-place {
  position: relative;
}
.hot-place > a {
  float: left;
  text-decoration: none;
  color: #0078a8;
  font-size: 14px;
  margin-left: 5px;
}
.hot-place > a:first-child {
  margin-left: 0;
}
.input-search {
  float: left;
}
.btn-input {
  position: relative;
  float: left;
  left: 10px;
  height: 21px;
  width: 155px;
}
.btn-span {
  position: relative;
  left: 9px;
  margin-top: 0px;
  text-align: center;
  width: 47px;
  height: 27px;
  line-height: 28px;
  display: inline-block;
  background: #3385ff;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}
.btn-down {
  width: 41px;
  height: 29px;
  display: block;
  position: absolute;
  left: 140px;
  background-color: teal;
}
.img-down {
  width: 21px;
  height: 17px;
  position: absolute;
  bottom: -14px;
  left: 170px;
  background-image: url('../images/icon.3453a6e.png');
  background-position: -348px -150px;
  background-repeat: no-repeat;
  display: inline-block;
}
</style>

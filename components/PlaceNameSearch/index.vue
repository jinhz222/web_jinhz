<template>
  <el-container>
    <div class="search-content">
      <!--查询标题-->
      <div class="search-top">
        <span class="search-tilte">地名搜索</span>
      </div>
      <!--地名输入框-->
      <div class="search-input">
        <el-input
          v-model="input"
          placeholder="请输入地名"
          @keyup.enter.native="clickSearch"
          @change="inputChange"
        ></el-input>
        <div @click="clickSearch">
          <img :src="imgInput" class="img-input" />
        </div>
        <!--下拉提示内容-->
        <div
          v-show="isShow.downUp"
          class="drown-content"
          @mouseenter="openDown"
          @mouseleave="closeDown"
        >
          <ul class="drown-ul">
            <li
              v-for="(item, index) in suggestsDate"
              :key="index"
              class="drown-li"
            >
              <div
                :id="index"
                ref="tipDiv"
                class="content-li"
                @mouseenter="tipEnter($event)"
                @mouseleave="tipLeave($event)"
                @click="searchTips($event)"
              >
                <div class="a-li">
                  <poi-name
                    :poiname="suggestsDate[index].name"
                    class="name-li"
                  ></poi-name>
                  <span class="dress-li">{{
                    suggestsDate[index].address
                  }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!--搜索范围选择以及清空-->
      <div class="search-fun">
        <el-checkbox
          v-model="isShow.checked"
          class="search-view"
          @change="checkChange"
          >视野内搜索</el-checkbox
        >
        <div class="search-clear" @click="clearAll">
          <span>清除结果</span>
        </div>
      </div>
      <!--查询内容显示区域-->
      <div v-show="isShow.showContent" class="search-all">
        <!--查询结果显示-->
        <div
          ref="searchDiv"
          class="search-result"
          @mouseenter="showOverfalow"
          @mouseleave="hideOverfalow"
        >
          <div class="results">
            <ul class="no-ul">
              <!--查询显示内容-->
              <li v-for="(item, index) in poiData" :key="index" class="no-li">
                <div
                  :id="index"
                  ref="domDiv"
                  class="place-bolck"
                  @mouseenter="mouseEnter($event)"
                  @mouseleave="mouseLeave($event)"
                  @click="clickResult($event)"
                >
                  <div style="text-decoration: none">
                    <img
                      ref="domImg"
                      :src="imgPosition.positionDiv[index]"
                      class="img-position"
                    />
                    <poi-name
                      :poiname="poiData[index].name"
                      class="place-name"
                    ></poi-name>
                    <phone-info
                      :phoneinfo="poiData[index].phone"
                      class="tel-info"
                    ></phone-info>
                    <br />
                    <address-info
                      :addressinfo="poiData[index].address"
                      class="address-info"
                    ></address-info>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div v-show="isShow.pagerShow" class="bottom-con">
          <!--查询总数控件显示-->
          <div class="search-sum">
            <span>总共{{ resultSum }}个结果</span>
          </div>
          <!--分页控件-->
          <div class="search-paging">
            <el-pagination
              :total="parseInt(resultSum)"
              class="elPaging"
              background
              small
              :pager-count="pagerConfig.pagerCount"
              :page-size="pagerConfig.pageSize"
              :current-page.sync="pagerConfig.currentPage"
              layout="prev, pager, next"
              @next-click="nextClick"
              @current-change="currentChange"
              @prev-click="prevClick"
            ></el-pagination>
          </div>
        </div>
      </div>
    </div>
    <!--弹框-->
    <transition name="fade">
      <div id="popTem" class="content-div" v-show="isShow.showModal">
        <div class="poptemplate-div">
          <pop-template
            id="popDom"
            ref="popDiv"
            :modal-title="nameData.name"
            :hot-pointid="nameData.hotPointID"
            @closepopup="closePopup"
            @searchnear="searchNear"
            @setsposition="setsPosition"
          >
            <template v-slot:popup-body>
              <p class="popup-address">地址：{{ nameData.address }}</p>
              <phone-info
                :phoneinfo="nameData.phone"
                class="popup-phone"
              ></phone-info>
            </template>
          </pop-template>
        </div>
      </div>
    </transition>
  </el-container>
</template>

<script>
import {
  poiSearch,
  citySearch,
  viewSearch,
  nearbySearch,
} from '@/api/poiRequest'
import {
  goto,
  getmapBound,
  addPoint,
  nearbyExtent,
  watchPoint,
  addnewPoint,
  replacePoint,
} from '@/components/PlaceNameSearch/FunctionJSfile/mapFun'
import { mapState, mapMutations } from 'vuex'
import phoneInfo from '@/components/PlaceNameSearch/FunctionComponents/phoneInfo'
import addressInfo from '@/components/PlaceNameSearch/FunctionComponents/addressInfo'
import poiName from '@/components/PlaceNameSearch/FunctionComponents/poiName'
import PopTemplate from '@/components/PlaceNameSearch/FunctionComponents//PopTemplate'

export default {
  name: 'PlaceNameSearch',
  components: {
    phoneInfo,
    addressInfo,
    poiName,
    PopTemplate,
  },
  data() {
    return {
      cityNames: '成都',
      centerLan: String,
      centerLon: String,
      newlantArry: [],
      popName: String,
      flag: Number,
      input: '', // 输入框的双向绑定
      ptGraphic: {}, // 用于存储点Graphic
      lant: '', // 获取经纬度字符串
      lantClick: '', // 获取点击到的经纬度字符串
      resultSum: 0, // 地名查询结果总数
      imgInput: require('@/assets/images/searchH.svg'),
      mapExtent: [], // 用于存储返回的视图范围
      poiDatas: [], // 用于存储查询返回结果信息
      nameData: {}, // 用于存储点击的结果数据
      suggestsDate: [], // 用于存储提示信息
      // 查询所需参数
      searchConfig: {
        searchInfo: '', // 查询所需要的内容
        cityCode: '', // 获取城市的行政编码
        startValue: 0, // 页数点击切换初始值
        mapBound: '', // 用于存储搜索范围
        viewBound: '', // 用于存储视图范围
        searchView: String,
      },
      // 分页所需要变量
      pagerConfig: {
        currentPage: 1,
        pagerCount: 5,
        pageSize: 10,
      },
      isShow: {
        checked: false, // 是否选择视图范围内搜索
        downUp: false, // 用于下拉提示信息的伸缩
        pagerShow: false, // 用于显示分页和查询总数
        showContent: false, // 用于是否显示结果内容
        showModal: false, // 用于是否显示弹窗
      },
      imgPosition: {
        position: require('@/assets/images/position.png'),
        positionDiv: [
          require('@/assets/images/positionL1.png'),
          require('@/assets/images/positionL2.png'),
          require('@/assets/images/positionL3.png'),
          require('@/assets/images/positionL4.png'),
          require('@/assets/images/positionL5.png'),
          require('@/assets/images/positionL6.png'),
          require('@/assets/images/positionL7.png'),
          require('@/assets/images/positionL8.png'),
          require('@/assets/images/positionL9.png'),
          require('@/assets/images/positionL10.png'),
        ],
        positionMap: [
          require('@/assets/images/positionH1.png'),
          require('@/assets/images/positionH2.png'),
          require('@/assets/images/positionH3.png'),
          require('@/assets/images/positionH4.png'),
          require('@/assets/images/positionH5.png'),
          require('@/assets/images/positionH6.png'),
          require('@/assets/images/positionH7.png'),
          require('@/assets/images/positionH8.png'),
          require('@/assets/images/positionH9.png'),
          require('@/assets/images/positionH10.png'),
        ],
        popupPosition: [
          require('@/assets/images/start.png'),
          require('@/assets/images/passing.png'),
          require('@/assets/images/ending.png'),
        ],
      },
    }
  },
  computed: {
    /**
     * 获取地图视图对象
     */
    ...mapState('map', {
      mainView: (state) => state.mainView,
    }),
    /**
     * 将获取到的经纬度字符串按空格分割成数组
     */
    lantArry() {
      return this.lant.split(' ')
    },
    lantClickArry() {
      return this.lantClick.split(' ')
    },
    /**
     * 使用计算属性，每次查询结果改变调用
     */
    poiData() {
      return this.poiDatas
    },
  },
  methods: {
    ...mapMutations({
      setStart: 'setStartPOI',
      setPass: 'setPassPOI',
      setEnd: 'setEndPOI',
    }),
    /**
     * 鼠标离开下拉提示查询结果区域后隐藏下拉提示
     */
    openDown() {
      this.isShow.downUp = true
    },
    closeDown() {
      this.isShow.downUp = false
    },
    /**
     * @param {*} event
     * 鼠标进入查询结果区域后和离开后不同样式的切换
     */
    mouseEnter(event) {
      const divId = event.currentTarget.id
      this.$refs.domDiv[divId].style.backgroundColor = '#f2f2f2'
      this.$refs.domImg[divId].src = this.imgPosition.positionMap[divId]
      this.lant = this.poiDatas[divId].lonlat // 获取到经纬度字符串
      // 在地图上添加红色图标
      replacePoint(this.imgPosition, 'enter', this.mainView, divId)
    },
    mouseLeave(event) {
      // 获取鼠标到达区域的id
      const divId = event.currentTarget.id
      // 设置区域的背景
      this.$refs.domDiv[divId].style.backgroundColor = '#fff'
      // 切换不同颜色的图片
      this.$refs.domImg[divId].src = this.imgPosition.positionDiv[divId]
      this.lant = this.poiDatas[divId].lonlat // 获取到经纬度字符串
      replacePoint(this.imgPosition, 'leave', this.mainView, divId)
    },
    /**
     * @param {*} event
     * 鼠标进入下拉提示区域后和离开后不同样式的切换
     */
    tipEnter(event) {
      // 获取鼠标到达区域的id
      const tipId = event.currentTarget.id
      // 设置区域的背景
      this.$refs.tipDiv[tipId].style.backgroundColor = '#f2f2f2'
    },
    tipLeave(event) {
      // 获取鼠标到达区域的id
      const tipId = event.currentTarget.id
      // 设置区域的背景
      this.$refs.tipDiv[tipId].style.backgroundColor = '#fff'
    },
    /**
     * 鼠标进入查询结果展示区域后和离开后显示下拉条或隐藏下拉条切换
     */
    showOverfalow() {
      this.$refs.searchDiv.style.overflow = 'auto'
    },
    hideOverfalow() {
      this.$refs.searchDiv.style.overflow = 'hidden'
    },
    /**
     * @param {*} event
     * 通过鼠标点击查询的一条结果，在地图上显示位置
     */
    clickResult(event) {
      const divId = event.currentTarget.id
      this.isShow.showModal = true // 显示弹窗
      this.$refs.popDiv.isShare = false // 关闭弹框中的分享控件
      this.$refs.popDiv.isCollection = false // 关闭弹框中的分享控件
      this.nameData = this.poiDatas[divId] // 获取到每条查询结果信息
      this.lantClick = this.poiDatas[divId].lonlat // 获取到经纬度字符串
      watchPoint(
        parseFloat(this.lantArry[1]),
        parseFloat(this.lantArry[0]),
        this.mainView,
        this.newlantArry
      )
      // 根据获取到的经纬度，在地图上进行缩放
      goto(
        parseFloat(this.lantClickArry[1]),
        parseFloat(this.lantClickArry[0]),
        this.mainView
      )
    },
    /**
     * @param {*} value
     * 点击分页切换显示数据
     */
    nextClick(value) {
      this.searchConfig.startValue = (value - 1) * 10
      this.searchUtil()
      this.isShow.showModal = false // 关闭弹窗
    },
    currentChange(value) {
      this.searchConfig.startValue = (value - 1) * 10
      this.searchUtil()
      this.isShow.showModal = false // 关闭弹窗
    },
    prevClick(value) {
      this.searchConfig.startValue = (value - 1) * 10
      this.searchUtil()
      this.isShow.showModal = false // 关闭弹窗
    },
    /**
     * @param {*} event
     * 点击提示信息后，搜索提示信息
     */
    searchTips(event) {
      const idNum = event.currentTarget.id // 获取点击元素的id值
      this.searchConfig.searchInfo = this.suggestsDate[idNum].name
      this.isShow.downUp = false
      // 根据选择的关键字进行查询
      if (this.searchConfig.searchInfo !== '') {
        this.flag = 1
        this.searchConfig.startValue = 0
        this.searchUtil()
        this.pagerConfig.currentPage = 1 // 让分页回到第一页
      }
    },
    /**
     * 点击查询
     */
    clickSearch() {
      // 将输入框双向绑定的值赋值给searchInfo
      this.searchConfig.searchInfo = this.input
      // 根据选择的关键字进行查询
      if (this.searchConfig.searchInfo !== '') {
        this.flag = 1
        this.searchConfig.searchView = this.searchConfig.viewBound
        // 点击查询后将查询开始值初始化为0
        this.searchConfig.startValue = 0
        this.isShow.downUp = false
        this.searchUtil()
        this.pagerConfig.currentPage = 1 // 让分页回到第一页
      }
    },
    /**
     * 附近搜索
     * @param {*} value
     */
    searchNear(value) {
      if (value !== '') {
        this.flag = 2 // 周边查询标志
        this.mainView.graphics.removeAll()
        this.searchConfig.startValue = 0 // 初始查询从0开始
        this.pagerConfig.currentPage = 1 // 让分页回到第一页
        // 获取到弹框中周边查询的关键词
        this.popName = value
        // 获取到点击周边查询这个地名的经纬度
        this.centerLan = this.lantClickArry[1]
        this.centerLon = this.lantClickArry[0]
        // 周边查询网络请求封装
        this.getnearInfo(value)
        // 关闭弹窗
        this.isShow.showModal = false
      } else {
        // 输入框为空
        alert('输入框为空')
      }
    },
    /**
     * 地名查询封装
     */
    searchUtil() {
      if (this.isShow.checked) {
        switch (this.flag) {
          case 1:
            // 进行视图范围内查询
            this.getviewInfo()
            // 弹窗结果与查询数据绑定
            this.showPop()
            break
          // 视图范围内周边查询
          case 2:
            this.getnearInfo(this.popName)
            // 关闭弹窗
            this.isShow.showModal = false
            break
        }
      } else {
        switch (this.flag) {
          // 普通查询
          case 1:
            this.getBound('poi', null)
            // 弹窗结果与查询数据绑定
            this.showPop()
            break
          // 周边查询
          case 2:
            this.getnearInfo(this.popName)
            // 关闭弹窗
            this.isShow.showModal = false
            break
        }
      }
    },
    inputChange() {},
    /**
     * 关闭弹窗
     */
    closePopup() {
      this.isShow.showModal = false
    },
    /**
     * 弹窗点击标点
     * @param {*} value
     */
    setsPosition(value) {
      switch (value) {
        case '起点':
          // 路由跳转到路径导航界面
          this.$router.push({
            path: '/zxdt/route_line',
          })
          this.mainView.graphics.removeAll()
          this.showModal = false
          addPoint(
            parseFloat(this.lantClickArry[1]),
            parseFloat(this.lantClickArry[0]),
            this.imgPosition.popupPosition[0],
            this.ptGraphic,
            this.mainView
          )
          this.isShow.showModal = false // 关闭弹窗
          // 改变起点、途经点、终点在vuex中的state的状态
          this.setStart(this.nameData.name)
          this.setPass('')
          this.setEnd('')
          break
        case '途经点':
          // 路由跳转到路径导航界面
          this.$router.push({
            path: '/zxdt/route_line',
          })
          this.mainView.graphics.removeAll()
          this.showModal = false
          addPoint(
            parseFloat(this.lantClickArry[1]),
            parseFloat(this.lantClickArry[0]),
            this.imgPosition.popupPosition[1],
            this.ptGraphic,
            this.mainView
          )
          this.isShow.showModal = false // 关闭弹窗
          // 改变起点、途经点、终点在vuex中的state的状态
          this.setPass(this.nameData.name)
          this.setStart('')
          this.setEnd('')
          break
        case '终点':
          // 路由跳转到路径导航界面
          this.$router.push({
            path: '/zxdt/route_line',
          })
          this.mainView.graphics.removeAll()
          this.showModal = false
          addPoint(
            parseFloat(this.lantClickArry[1]),
            parseFloat(this.lantClickArry[0]),
            this.imgPosition.popupPosition[2],
            this.ptGraphic,
            this.mainView
          )
          this.isShow.showModal = false // 关闭弹窗
          // 改变起点、途经点、终点在vuex中的state的状态
          this.setEnd(this.nameData.name)
          this.setPass('')
          this.setStart('')
          break
      }
    },
    /**
     * 点击图标，显示弹窗
     */
    showPop() {
      this.mainView.on('click', (event) => {
        this.mainView.hitTest(event).then((respone) => {
          // 获取点击到的图标的经纬度信息
          const latitude = respone.results[0].graphic.geometry.latitude
          const longitude = respone.results[0].graphic.geometry.longitude
          // 监控点击点的屏幕坐标变化，更改其弹框位置
          watchPoint(latitude, longitude, this.mainView, this.newlantArry)
          if (
            longitude === parseFloat(this.lantArry[0]) &&
            latitude === parseFloat(this.lantArry[1])
          ) {
            goto(latitude, longitude, this.mainView)
            // 显示弹窗
            this.isShow.showModal = true
            // 关闭分享控件
            this.$refs.popDiv.isShare = false
            this.$refs.popDiv.isCollection = false
            // 地图进行缩放
          } else {
            for (let i = 0; i < this.poiDatas.length; i++) {
              this.lant = this.poiDatas[i].lonlat // 获取到经纬度字符串
              if (
                longitude === parseFloat(this.lantArry[0]) &&
                latitude === parseFloat(this.lantArry[1])
              ) {
                this.nameData = this.poiDatas[i]
                this.lantClick = this.poiDatas[i].lonlat
                // 地图进行缩放
                goto(latitude, longitude, this.mainView)
                // 显示弹窗
                this.isShow.showModal = true
                // 关闭分享控件
                this.$refs.popDiv.isShare = false
                this.$refs.popDiv.isCollection = false
              }
            }
          }
        })
      })
    },
    /**
     * 当点击在视图范围内搜索时触发方法获取视图范围
     */
    checkChange() {
      if (this.isShow.checked) {
        getmapBound(this, this.mainView, this.mapExtent)
      }
    },
    /**
     * 根据查询结果进行循环添加图标
     */
    forImg(data) {
      for (let i = 0; i < data.length; i++) {
        this.lant = data[i].lonlat
        const lat = parseFloat(this.lantArry[1])
        const lon = parseFloat(this.lantArry[0])
        addPoint(
          lat,
          lon,
          this.imgPosition.positionDiv[i],
          this.ptGraphic,
          this.mainView
        )
      }
    },
    forFor(data) {
      const dataArry = []
      for (let i = 0; i < data.length; i++) {
        this.lant = data[i].lonlat
        const lat = parseFloat(this.lantArry[1])
        const lon = parseFloat(this.lantArry[0])
        const num = {
          name: String,
          address: String,
          phone: String,
          lat: Number,
          lon: Number,
        }
        num.lat = lat
        num.lon = lon
        num.name = data[i].name
        num.address = data[i].address
        num.phone = data[i].phone
        dataArry.push(num)
      }
      addnewPoint(dataArry, this.imgPosition, this.mainView)
    },
    /**
     * 网络请求获取周边地名查询
     */
    getnearInfo(name) {
      const _self = this
      nearbySearch({
        input: name,
        mapBound: this.searchConfig.mapBound,
        queryType: '3',
        pointLonlat: this.centerLon + ',' + this.centerLan,
        queryRadius: '1200',
        start: this.searchConfig.startValue + '',
        count: '10',
        cityCode: this.searchConfig.cityCode,
      })
        .then((res) => {
          _self.resultSum = res.data.count // 获取地名查询总数
          _self.poiDatas = res.data.pois // 获取地名查询结果集
          if (_self.resultSum > 0) {
            _self.isShow.showContent = true
            if (_self.resultSum <= 10) {
              _self.isShow.pagerShow = false // 总数小于或等于6时不显示分页
            } else {
              _self.isShow.pagerShow = true
            }
            _self.mainView.graphics.removeAll()
            // 进行地图缩放
            // 获取到点击周边查询这个地名的经纬度
            const centerlan = _self.centerLan
            const centerlon = _self.centerLon
            goto(parseFloat(centerlan), parseFloat(centerlon), _self.mainView)
            // 添加地图图标
            _self.forImg(_self.poiDatas)
            // _self.forFor(_self.poiDatas)
            // 添加中心点图标
            addPoint(
              centerlan,
              centerlon,
              _self.imgPosition.position,
              _self.ptGraphic,
              _self.mainView
            )
            // 添加搜索范围样式
            nearbyExtent(
              parseFloat(centerlan),
              parseFloat(centerlon),
              _self.ptGraphic,
              _self.mainView
            )
          } else {
            _self.isShow.showContent = false
          }
        })
        .catch((err) => {
          console.log(err + 'aaa')
        })
    },
    /**
     * 网络请求获取行政区内poi数据信息
     */
    getpoiInfo() {
      const _self = this
      poiSearch({
        input: this.searchConfig.searchInfo,
        mapBound: this.searchConfig.mapBound,
        queryType: '1',
        start: this.searchConfig.startValue + '',
        count: '10',
        cityCode: this.searchConfig.cityCode,
      })
        .then((res) => {
          _self.resultSum = res.data.count // 获取地名查询总数
          _self.poiDatas = res.data.pois // 获取地名查询结果集
          if (_self.resultSum > 0) {
            _self.isShow.showContent = true
            if (_self.resultSum <= 10) {
              _self.isShow.pagerShow = false // 总数小于或等于6时不显示分页
            } else {
              _self.isShow.pagerShow = true
            }
            _self.mainView.graphics.removeAll()
            // 进行地图缩放
            _self.lant = _self.poiDatas[0].lonlat // 获取到经纬度字符串
            goto(
              parseFloat(_self.lantArry[1]),
              parseFloat(_self.lantArry[0]),
              _self.mainView
            )
            // 添加地图图标
            // _self.forImg(_self.poiDatas)
            _self.forFor(_self.poiDatas)
          } else {
            _self.isShow.showContent = false
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    /**
     * 网络请求获取视图范围内poi数据信息
     */
    getviewInfo() {
      const _self = this
      viewSearch({
        input: this.searchConfig.searchInfo,
        mapBound: this.searchConfig.searchView,
        queryType: '2',
        start: this.searchConfig.startValue + '',
        count: '10',
      })
        .then((res) => {
          _self.resultSum = res.data.count // 获取地名查询总数
          _self.poiDatas = res.data.pois // 获取地名查询结果集
          if (_self.resultSum > 0) {
            _self.isShow.showContent = true
            if (_self.resultSum <= 10) {
              _self.isShow.pagerShow = false // 总数小于或等于6时不显示分页
            } else {
              _self.isShow.pagerShow = true
            }
            _self.mainView.graphics.removeAll()
            // 进行地图缩放
            _self.lant = _self.poiDatas[0].lonlat // 获取到经纬度字符串
            goto(
              parseFloat(_self.lantArry[1]),
              parseFloat(_self.lantArry[0]),
              _self.mainView
            )
            // 添加地图图标
            // _self.forImg(_self.poiDatas)
            _self.forFor(_self.poiDatas)
          } else {
            _self.isShow.showContent = false
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    /**
     * 网络请求获取下拉查询信息
     */
    gettipInfo(value) {
      const _self = this
      poiSearch({
        input: value,
        mapBound: this.searchConfig.mapBound,
        queryType: '4',
        start: '0',
        count: '6',
        cityCode: this.searchConfig.cityCode,
      })
        .then((res) => {
          _self.suggestsDate = res.data.suggests // 获取返回来的提示信息数组
          if (_self.suggestsDate.length > 0) {
            _self.isShow.downUp = true // 当有返回信息时，展开下拉信息
          } else {
            _self.isShow.downUp = false // 当无返回信息时，关闭下拉信息
          }
          if (_self.input === '' || _self.isShow.downUp === false) {
            _self.suggestsDate = null
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    /**
     * 网络请求获取地图范围信息后，进行poi查询
     */
    getBound(type, value) {
      // 确定查询的地图范围
      const _self = this
      citySearch({
        cityName: this.cityNames,
      })
        .then((res) => {
          // 获取行政区范围
          _self.searchConfig.mapBound = res.data.data[0].bound
          // 获取城市编码
          _self.searchConfig.cityCode = res.data.data[0].cityCode
          if (type === 'poi') {
            _self.getpoiInfo()
          } else if (type === 'tips') {
            _self.gettipInfo(value)
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    /**
     * 清空所有结果
     */
    clearAll() {
      this.isShow.showContent = false // 关闭搜索结果显示
      this.input = '' // 清空输入框
      this.isShow.showModal = false // 关闭弹窗
      this.isShow.downUp = false // 当无输入字符时，收起下拉信息
      this.searchConfig.searchInfo = ''
      this.searchConfig.startValue = 0
      this.isShow.checked = false
      this.mainView.graphics.removeAll() // 清除地图图标
    },
  },
  watch: {
    /**
     * @param {*} value
     * 输入框监控
     */
    input(value) {
      if (value === '') {
        this.mainView.graphics.removeAll()
        this.searchConfig.searchInfo = ''
        this.searchConfig.startValue = 0
        this.isShow.showModal = false // 关闭弹窗
        this.isShow.showContent = false // 关闭搜索结果显示
        this.isShow.downUp = false // 当无输入字符时，收起下拉信息
      } else {
        // 监控输入框信息，提示下拉地名
        this.getBound('tips', value)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.content-div {
  position: absolute;
  width: 380px;
  height: 220px;
  opacity: 1;
  z-index: -1;
}
.poptemplate-div {
  position: absolute;
  bottom: 0px;
  opacity: 1;
  width: 380px;
}
.search-content {
  float: left;
  top: 1px;
  overflow: hidden;
  background: #fff;
  height: 600px;
  width: 100%;
}
.search-top {
  float: left;
  width: 100%;
  margin-bottom: 10px;
  margin-top: 15px;
  margin-left: 10px;
  padding-left: 0px;
  padding-top: 10px;
  border-bottom-color: rgb(238, 238, 238);
  border-bottom-style: solid;
  border-bottom-width: 1px;
}
.search-input {
  float: left;
  padding-left: 10px;
  width: 95%;
  margin-bottom: 10px;
}
.img-input {
  position: absolute;
  right: 15px;
  top: 113px;
  cursor: pointer;
}
.drown-content {
  position: absolute;
  margin-top: 0px;
  width: 80%;
  border-color: rgb(238, 238, 238);
  background-color: white;
  border-style: solid;
  border-width: 1px;
  z-index: 2;
}
.drown-ul {
  list-style: none;
  position: relative;
  padding-left: 0px;
  padding-top: 0px;
  margin-top: 0px;
  margin-bottom: 0px;
}
.drown-li {
  list-style: none;
  position: relative;
  padding-left: 0px;
  padding-top: 0px;
}
.content-li {
  position: relative;
  padding-top: 8px;
  padding-bottom: 5px;
  padding-left: 10px;
  border-color: rgb(238, 238, 238);
  background-color: white;
  border-style: solid;
  border-width: 1px;
  height: 35px;
}
.a-li {
  text-decoration: none;
  cursor: pointer;
}
.name-li {
  position: absolute;
  float: left;
  left: 10px;
  top: 5px;
  font-size: 15px;
  color: #000;
}
.dress-li {
  float: left;
  position: absolute;
  left: 10px;
  top: 26px;
  font-size: 13px;
  color: #7f7f7f;
  width: 210px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}
.search-fun {
  float: left;
  width: 100%;
  margin-bottom: 0px;
}
.search-tilte {
  top: 100px;
  color: #333;
  font-weight: 400;
  font-size: 17px;
}
.search-view {
  position: relative;
  float: left;
  padding-left: 10px;
  padding-top: 0px;
}
.search-clear {
  float: right;
  padding-right: 15px;
  padding-top: 3px;
  color: #3f88e7;
  font-size: 10px;
  text-decoration: none;
  margin-bottom: 10px;
  cursor: pointer;
}
.search-all {
  position: relative;
  float: left;
  width: 100%;
  padding-left: 10px;
  margin-bottom: 0px;
  font-size: 12px;
}
.search-result {
  position: relative;
  background-color: white;
  height: 350px;
  width: 93%;
}
.search-result::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.search-result::-webkit-scrollbar-thumb {
  display: block;
  width: 10px;
  height: 1px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.2);
}
.search-result::-webkit-scrollbar-track-piece {
  height: 1px;
  width: 5px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.1);
}
.place-bolck {
  float: left;
  border-width: 0px;
  background-color: white;
  margin-top: 3px;
  padding-bottom: 8px;
  padding-top: 0px;
  width: 310px;
}
.no-ul {
  float: left;
  padding-top: 0px;
  padding-left: 0px;
}
.no-li {
  float: left;
  padding-bottom: 0px;
  list-style: none;
  cursor: pointer;
}
.img-position {
  position: relative;
  float: left;
  left: 40px;
  top: 12px;
  width: 21px;
  height: 25px;
}
.place-name {
  float: left;
  padding-top: 15px;
  padding-left: 48px;
  color: #169bd5;
  width: 160px;
  font-family: 'PingFang SC';
  font-weight: 500;
  font-style: normal;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}
.address-info {
  float: left;
  padding-left: 67px;
  padding-top: 5px;
  color: #7f7f7f;
  width: 248px;
  font-family: 'PingFang SC';
  font-weight: 400;
  font-style: normal;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}
.tel-info {
  float: left;
  padding-left: 67px;
  padding-top: 8px;
  color: #7f7f7f;
  width: 248px;
  font-family: 'PingFang SC';
  font-weight: 400;
  font-style: normal;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}
.address-info:hover {
  visibility: visible;
}
.place-name:hover {
  visibility: visible;
}
.bottom-con {
  position: relative;
  margin: 0 auto;
  text-align: center;
}
.search-sum {
  position: relative;
  float: left;
  left: 85px;
  top: 35px;
  width: 150px;
  height: 22px;
  font-family: 'PingFang SC Normal', 'PingFang SC';
  font-weight: 400;
  font-style: normal;
  color: rgba(0, 0, 0, 0.647058823529412);
  line-height: 22px;
  font-size: 13px;
  text-align: center;
}
.search-paging {
  position: relative;
  display: flex;
  justify-content: center;
  top: 70px;
  left: -90px;
}
.popup-phone {
  position: relative;
  padding-bottom: 5px;
}
</style>

import {
  loadModules
} from 'esri-loader'
/**
 * 地图缩放
 * @param {*} lat
 * @param {*} lon
 * @param {*} mainView
 */
export function goto(lat, lon, mainView) {
  loadModules(['esri/geometry/Point']).then(([Point]) => {
    const pt = new Point({
      latitude: lat,
      longitude: lon,
    })
    mainView.goTo({
      target: pt,
    })
  })
}
/**
 * 地图上添加位置图标
 * @param {*} dataArry
 * @param {*} imgPosition
 * @param {*} mainView
 */
export function addnewPoint(dataArry, imgPosition, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    for (let i = 0; i < dataArry.length; i++) {
      const pointImg = {
        type: 'point',
        latitude: dataArry[i].lat,
        longitude: dataArry[i].lon,
      }
      const pointSymbol = {
        type: 'picture-marker',
        url: imgPosition.positionDiv[i],
        width: '24px',
        height: '32px',
      }
      const pointAtt = {
        name: dataArry[i].name,
        address: dataArry[i].address,
        phpne: dataArry[i].phone,
        lat: dataArry[i].lat,
        lon: dataArry[i].lon,
      }
      const pointGraphic = new Graphic({
        geometry: pointImg,
        symbol: pointSymbol,
        attributes: pointAtt,
      })
      mainView.graphics.add(pointGraphic)
      mainView.graphics.getItemAt(i).visible = true
    }
  })
}
/**
 * 更换图标样式
 * @param {*} imgPosition
 * @param {*} flag
 * @param {*} mainView
 * @param {*} index
 */
export function replacePoint(imgPosition, flag, mainView, index) {
  if (flag === 'enter') {
    const pointSymbol = {
      type: 'picture-marker',
      url: imgPosition.positionMap[index],
      width: '24px',
      height: '32px',
    }
    if (mainView.graphics.getItemAt(index).symbol !== undefined) {
      mainView.graphics.getItemAt(index).symbol = pointSymbol
    }
  } else if (flag === 'leave') {
    const pointSymbol = {
      type: 'picture-marker',
      url: imgPosition.positionDiv[index],
      width: '24px',
      height: '32px',
    }
    if (mainView.graphics.getItemAt(index).symbol !== undefined) {
      mainView.graphics.getItemAt(index).symbol = pointSymbol
    }
  }
}
/**
 * 坐标实时监控，更改弹框位置
 * @param {*} lat
 * @param {*} lon
 * @param {*} mainView
 * @param {*} newptArry
 */
export function watchPoint(lat, lon, mainView, newptArry) {
  loadModules([
    'esri/geometry/Point',
    'esri/core/watchUtils',
  ]).then(([Point, watchUtils]) => {
    const pt = new Point({
      latitude: lat,
      longitude: lon,
    })
    watchUtils.when(mainView, 'extent', function () {
      const newPt = mainView.toScreen(pt)
      newptArry[0] = newPt.y - 183 + ''
      newptArry[1] = newPt.x - 190 + ''
      document.getElementById('popTem').style.top = newptArry[0] + 'px'
      document.getElementById('popTem').style.left = newptArry[1] + 'px'
    })
  })
}
/**
 * 添加起点、终点
 * @param {*} pointLat
 * @param {*} pointLon
 * @param {*} imgPosition
 * @param {*} pointName
 * @param {*} mainView
 */
export function setPoint(pointLat, pointLon, imgPosition, pointName, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    const pointImg = {
      type: 'point',
      latitude: pointLat,
      longitude: pointLon,
    }
    const pointSymbol = {
      type: 'picture-marker',
      url: imgPosition,
      width: '24px',
      height: '32px',
    }
    const pointAtt = {
      name: pointName,
      lat: pointLat,
      lon: pointLon,
      type: 1,
    }
    const pointGraphic = new Graphic({
      geometry: pointImg,
      symbol: pointSymbol,
      attributes: pointAtt,
    })
    mainView.graphics.add(pointGraphic)
  })
}
/**
 * 添加公交站点
 * @param {*} pointLat
 * @param {*} pointLon
 * @param {*} imgPosition
 * @param {*} busData
 * @param {*} mainView
 */
export function setbusPoint(pointLat, pointLon, imgPosition, busData, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    const pointImg = {
      type: 'point',
      latitude: pointLat,
      longitude: pointLon,
    }
    const pointSymbol = {
      type: 'picture-marker',
      url: imgPosition,
      width: '24px',
      height: '32px',
    }
    const pointAtt = {
      name: busData.name,
      lat: pointLat,
      lon: pointLon,
      stationCount: busData.stationCount,
      direction: busData.direction,
      endTime: busData.endTime,
      type: 2,
    }
    const pointGraphic = new Graphic({
      geometry: pointImg,
      symbol: pointSymbol,
      attributes: pointAtt,
    })
    mainView.graphics.add(pointGraphic)
  })
}
/**
 * 添加公交路线
 * @param {*} linePath
 * @param {*} mainView
 */
export function setbusLine(linePath, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    const lineImg = {
      type: 'polyline',
      paths: linePath,
    }
    const lineSymbol = {
      type: 'simple-line',
      color: [0, 0, 255],
      width: 6,
    }
    const lineGraphic = new Graphic({
      geometry: lineImg,
      symbol: lineSymbol,
    })
    mainView.graphics.add(lineGraphic)
  })
}
/**
 * 添加步行路线
 * @param {*} linePath
 * @param {*} mainView
 */
export function setwalkLine(linePath, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    const lineImg = {
      type: 'polyline',
      paths: linePath,
    }
    const lineSymbol = {
      type: 'simple-line',
      color: [0, 255, 120],
      width: 6,
    }
    const lineGraphic = new Graphic({
      geometry: lineImg,
      symbol: lineSymbol,
    })
    mainView.graphics.add(lineGraphic)
  })
}
/**
 * 添加自驾详细路线
 * @param {*} linePath
 * @param {*} mainView
 */
export function setdriveLine(linePath, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    const lineImg = {
      type: 'polyline',
      paths: linePath,
    }
    const lineSymbol = {
      type: 'simple-line',
      color: [255, 0, 0],
      width: 6,
    }
    const lineAtt = {
      name: 'driveLine',
    }
    const lineGraphic = new Graphic({
      geometry: lineImg,
      symbol: lineSymbol,
      attributes: lineAtt,
    })
    mainView.graphics.add(lineGraphic)
  })
}
/**
 * 添加公交详细路线
 * @param {*} linePath
 * @param {*} mainView
 */
export function morebusLine(linePath, mainView) {
  loadModules([
    'esri/Graphic',
  ]).then(([Graphic]) => {
    const lineImg = {
      type: 'polyline',
      paths: linePath,
    }
    const lineSymbol = {
      type: 'simple-line',
      color: [255, 0, 0],
      width: 6,
    }
    const lineAtt = {
      name: 'busLine',
    }
    const lineGraphic = new Graphic({
      geometry: lineImg,
      symbol: lineSymbol,
      attributes: lineAtt,
    })
    mainView.graphics.add(lineGraphic)
  })
}
/**
 * 删除公交、自驾详细路线
 * @param {*} mainView 
 */
export function Deleteriveline(mainView) {
  const grap = mainView.graphics.getItemAt(
    mainView.graphics.length - 1
  )
  if (grap.attributes.name === 'driveLine' || grap.attributes.name === 'busLine') {
    mainView.graphics.removeAt(mainView.graphics.length - 1)
  }
}
/**
 * 清空地图
 * @param {*} mainView
 */
export function clearMap(mainView) {
  if (mainView.graphics.length > 0) {
    mainView.graphics.removeAll()
  }
}
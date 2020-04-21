/**
 * @param {el} 被拖拽的元素
 * @param {distance} 边缘吸附的距离
 * @return {object} 返回一个对象 里面有解除事件绑定的方法
*/
exports.drag = function drag(el, distance = 0) {

  // 容器的宽高
  var containerWidth = el.offsetWidth
  var containerHeight = el.offsetHeight

  // 容器父元素的宽高
  var containerParentWidth = el.parentNode.offsetWidth
  var containerParentHeight = el.parentNode.offsetHeight

  // 吸附效果的距离
  var distance = distance

  // 容器的初始位置
  var startPoint = { x: 0, y: 0 }
  // 鼠标点击的初始位置
  var mouseDownPoint = { x: 0, y: 0 }

  var isTouch = false

  el.onmousedown = startHandle
  el.addEventListener('touchstart', startHandle)

  document.onmousemove = moveHandle
  document.addEventListener('touchmove', moveHandle, { passive: false })


  document.onmouseup = endHandle
  document.addEventListener('touchend', endHandle)


  function startHandle(e) {
    isTouch = true
    e.preventDefault()

    // 将第一次点击时容器的位置 以及鼠标的位置赋值
    startPoint.x = this.offsetLeft
    startPoint.y = this.offsetTop

    mouseDownPoint.x = e.pageX !== undefined ? e.pageX : e.touches[0].pageX
    mouseDownPoint.y = e.pageY !== undefined ? e.pageY : e.touches[0].pageY

    // mousemove事件绑定在document上
    // console.log('start')
  }

  function moveHandle(e) {
    if (!isTouch) return
    // console.log('move')

    e.preventDefault()

    // 鼠标移动时的位置
    var mouseMovePoint = {
      x: e.pageX !== undefined ? e.pageX : e.touches[0].pageX,
      y: e.pageY !== undefined ? e.pageY : e.touches[0].pageY
    }

    // 鼠标移动的位置与鼠标按下时的初始位置的差
    var dis = {
      x: mouseMovePoint.x - mouseDownPoint.x,
      y: mouseMovePoint.y - mouseDownPoint.y
    }

    // 容器移动的位置 = 鼠标移动的位置与鼠标按下时初始位置的差 + 鼠标点击的初始位置
    var Top = startPoint.y + dis.y,
      Left = startPoint.x + dis.x

    // console.log(Top, Left)

    // 边界处理 以及 边缘吸附
    if (Top < distance) {
      Top = 0
      el.style.top = Top + 'px'
    } else if (Top + containerHeight > containerParentHeight - distance) {
      Top = containerParentHeight - containerHeight
      el.style.left = Left + 'px'
    }

    if (Left < distance) {
      Left = 0
      el.style.left = Left + 'px'
    } else if (Left + containerWidth > containerParentWidth - distance) {
      Left = containerParentWidth - containerWidth
      el.style.left = Left + 'px'
    }

    // 容器移动的位置赋值
    el.style.top = Top + 'px'
    el.style.left = Left + 'px'
  }

  function endHandle(e) {
    if (!isTouch) return
    // console.log('end')

    // 解除鼠标移动事件 顺便解除鼠标抬起的事件
    e.preventDefault()
    // document.onmousemove = document.onmouseup = null;
    isTouch = false
  }
  return {
    removeEventListener: function() {
      el.onmousedown = null
      el.removeEventListener('touchstart', startHandle)

      document.onmousemove = null
      document.removeEventListener('touchmove', moveHandle, { passive: false })


      document.onmouseup = null
      document.removeEventListener('touchend', endHandle)
    } 
  }
}

// 碰撞判断
/**
 * @param {box1} 碰撞物
 * @param {box2} 被碰撞物
 * */ 
exports.isCollision = function isCollision(box1, box2) {
  var isCollided = false
  // container的四条边界
  T1 = box1.offsetTop
  B1 = T1 + box1.offsetHeight
  L1 = box1.offsetLeft
  R1 = L1 + box1.offsetWidth

  // collision的四条边界
  T2 = box2.offsetTop
  B2 = T2 + box2.offsetHeight
  L2 = box2.offsetLeft
  R2 = L2 + box2.offsetWidth

  // 判断不触发碰撞的条件
  if (B1 <= T2 || T1 >= B2 || R1 <= L2 || L1 >= R2) {
      isCollided = false
  } else {
      isCollided = true
  }

  return isCollided
}

//! setting z-index explicitly will overwrite anything done in css...

function init() {
  
  const imgData = [
    { h: 200, w: 200, img: 'mochimochiusagi.gif' },
    { h: 634, w: 450, img: 'popcorn_bunny.png' },
    { h: 264, w: 200, img: 'cocoala.jpg' },
    { h: 200, w: 200, img: 'smile.gif' },
    { h: 660, w: 450, img: 'rhino_banana.jpg' },
    { h: 282, w: 200, img: 'icecream.jpg' },
    { h: 200, w: 200, img: 'boxing_bunny.gif' },
    { h: 562, w: 800, img: 'pizza_squirrel.jpg' },
    { h: 1414, w: 1000, img: 'animals.jpg' },
    { h: 750, w: 500, img: 'bunny_icecream2.jpg' }
  ]

  const portfolio = document.querySelector('.portfolio')
  // const indicator = document.querySelector('.indicator')

  const setting = {
    imgSize: 30,
    images: [],
    screenAspect: 'horizontal',
    aspectKey: 'vh',
    greaterH: null,
    greaterW: null,
    vertRatio: 1,
    horiRatio: 1,
    imgIndex: null,
  }

  const checkOrientation = () =>{
    screenAspect = window.innerHeight > window.innerWidth ? 'vertical' : 'horizontal'
    aspectKey = screenAspect === 'vertical' ? 'vw' : 'vh'
  }
  
  const isActive = target => target.classList.contains('pick')
  const randomPos = () => `${Math.floor(Math.random() * 70)}%`
  const randomAngle = () => Math.floor(Math.random() * 360)
  const isNum = x => typeof x === 'number'
  const px = num => `${num}px`

  const setStyles = ({ target, h, w, x, y, deg }) =>{
    if (h) target.style.height = h
    if (w) target.style.width = w
    if (y) target.style.top = y
    if (x) target.style.left = x
    if (isNum(deg)) target.style.transform = `rotate(${deg}deg)`
  }

  const alt = imgName => {
    let alt = imgName
    ;['.jpg', '.gif', '.png'].forEach(l => alt = alt.replace(l, ''))
    return alt.replace('_', ' ')
  }

  const setVertRatioAndHoriRatio = obj =>{
    const { h, w } = obj
    const isVert = h >= w
    setting.vertRatio = isVert ? h / w : 1
    setting.horiRatio = isVert ? 1 : w / h
  }

  const setRandomAngleAndPosition = (img, obj) => {
    obj.angle = randomAngle()
    obj.topPos = randomPos()
    obj.leftPos = randomPos()

    const { imgSize, vertRatio, horiRatio, aspectKey } = setting

    // TODO set max image size?

    setStyles({
      target: img,
      h: `${imgSize * vertRatio + aspectKey}`,
      w: `${imgSize * horiRatio + aspectKey}`,
      y: obj.topPos,
      x: obj.leftPos,
      deg: obj.angle
    })
  }
  
  const createImage = (obj, index) => {
    const newImg = document.createElement('div')
    setVertRatioAndHoriRatio(obj)
    newImg.classList.add('image_thumb')
    newImg.innerHTML = `<img data-index="${index}" src= "./assets/${obj.img}" alt="${alt(obj.img)}">`
    setRandomAngleAndPosition(newImg, obj)
    
    portfolio.appendChild(newImg)
    setting.images.push(newImg)
  }

  const setUp = () => {
    imgData.forEach((img, i) => createImage(img, i))
    setting.images.forEach(img => img.addEventListener('click', hideOrDisplayImage))
  }

  const reposition = () => {
    checkOrientation()

    imgData.forEach((img, i) => {
      setVertRatioAndHoriRatio(img)
      setRandomAngleAndPosition(setting.images[i], img)
    })
  }

  const hideOrDisplayImage = e => {
    const { images, imgIndex } = setting
    e.target.parentNode.classList.add('pick')

    if (isNum(imgIndex)){
      if (isActive(images[imgIndex])) hideImage(imgIndex)
      images[imgIndex].classList.remove('pick')
    }

    if (isActive(e.target.parentNode)) {
      setting.imgIndex = +e.target.dataset.index
      displayImage(e)
    } 
  }

  const displayImage = e => {    
      const { innerHeight: h, innerWidth: w } = window
      const isHorizontal = screenAspect === 'horizontal'

      
      // TODO set max image size?
      // TODO maybe set maximum window size, and ensure the image fits it.
  
      setting.greaterH = isHorizontal 
        ? h - 50 
        : (w - 20) * (e.target.height / e.target.width)
    
      setting.greaterW = isHorizontal 
        ? (h - 50) * (e.target.width / e.target.height)
        : w - 20
        
      setStyles({
        target: e.target.parentNode,
        w: px(setting.greaterW),
        h: px(setting.greaterH),
        y: px((h - setting.greaterH) / 2),
        x: px((w - setting.greaterW) / 2),
        deg: 0,
      })
  }


  const hideImage = index => {
    setVertRatioAndHoriRatio(imgData[index])
    setRandomAngleAndPosition(setting.images[index], imgData[index])
  }
  
  window.addEventListener('resize', reposition)
  checkOrientation()
  setUp()
  console.log(imgData)
  
}

window.addEventListener('DOMContentLoaded', init)

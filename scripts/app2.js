
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

  const elements = {
    portfolio: document.querySelector('.portfolio'),
    indicator: document.querySelector('.indicator'),
    stackButton: document.querySelector('.stack')
  }


  const setting = {
    imgSize: 30,
    images: [],
    sortedImages: [],
    screenAspect: 'horizontal',
    aspectKey: 'vh',
    greaterH: null,
    greaterW: null,
    vertRatio: 1,
    horiRatio: 1,
    imgIndex: null,
    stack: false,
  }

  const checkOrientation = () =>{
    setting.screenAspect = window.innerHeight > window.innerWidth ? 'vertical' : 'horizontal'
    setting.aspectKey = setting.screenAspect === 'vertical' ? 'vw' : 'vh'
  }
  
  const isActive = target => target.classList.contains('pick')
  const randomPos = () => `${Math.floor(Math.random() * 70)}%`
  const randomAngle = () => Math.floor(Math.random() * 360)
  const isNum = x => typeof x === 'number'
  const px = num => `${num}px`

  const setProperty = (target, property, value, prefix) => {
    target.style.setProperty(`--${prefix ? `${prefix}-` : ''}${property}`, value)
  }

  const setProperties = ({ target, h, w, x, y, deg, z, prefix }) => {
    if (h) setProperty(target, 'height', h, prefix)
    if (w) setProperty(target, 'width', w, prefix)
    if (y) setProperty(target, 'top', y, prefix)
    if (x) setProperty(target, 'left', x, prefix)
    if (isNum(deg)) setProperty(target, 'deg', `${deg}deg`, prefix)
    if (z) setProperty(target, 'z', z, prefix)
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
    const { imgSize, vertRatio, horiRatio, aspectKey, screenAspect } = setting
    const imgHeight = imgSize * vertRatio
    const imgWidth = imgSize * horiRatio

    setProperties({
      target: img,
      h: imgHeight + aspectKey,
      w: imgWidth + aspectKey,
      y: randomPos(),
      x: randomPos(),
      deg: randomAngle(),
    })

    // set card display position
    const { innerHeight: h, innerWidth: w } = window
    const isHorizontal = screenAspect === 'horizontal'
    // TODO set max image size?
    // TODO maybe set maximum window size, and ensure the image fits it.

    setting.greaterH = isHorizontal 
      ? h - 50 
      : (w - 20) * (imgHeight / imgWidth)
  
    setting.greaterW = isHorizontal 
      ? (h - 50) * (imgWidth / imgHeight)
      : w - 20   
    setProperties({
      target: img,
      w: px(setting.greaterW),
      h: px(setting.greaterH),
      y: px((h - setting.greaterH) / 2),
      x: px((w - setting.greaterW) / 2),
      deg: 0,
      prefix: 'display'
    })
  }
  
  const createImage = (obj, index) => {
    const newImg = document.createElement('div')
    setVertRatioAndHoriRatio(obj)
    newImg.classList.add('card')
    newImg.dataset.index = index
    newImg.innerHTML = `<img data-index="${index}" src= "./assets/${obj.img}" alt="${alt(obj.img)}">`
    setRandomAngleAndPosition(newImg, obj)
    
    elements.portfolio.appendChild(newImg)
    setting.images.push(newImg)
  }

  const setUp = () => {
    imgData.forEach((img, i) => createImage(img, i))
    setting.sortedImages = [...setting.images]
    setting.images.forEach(img => img.addEventListener('click', triggerCardAction))
  }

  const positionSortedCards = () => {
    const { innerHeight: h, innerWidth: w } = window
    const defaultX = (w - 200) / 2
    const defaultY = (h - 300) / 2
    const x = 20
    const y = 20
    let z = 900
    
    setting.sortedImages.forEach((card, i) => {
      setProperties({
        target: card,
        x: px(defaultX - x * (setting.images.length - i)),
        y: px(defaultY - y * (setting.images.length - i)),
        deg: 0,
        z: z++,
        prefix: 'stack'
      })
    })
  }

  const reposition = () => {
    checkOrientation()

    imgData.forEach((img, i) => {
      setVertRatioAndHoriRatio(img)
      setRandomAngleAndPosition(setting.images[i], img)
    })

    positionSortedCards()
  }

  const hideOrDisplayImage = e => {
    const { images, imgIndex } = setting
    setting.images.forEach(card => card.classList.remove('pick'))
    e.target.parentNode.classList.add('pick')

    if (isNum(imgIndex) && isActive(images[imgIndex])) {
      hideImage(imgIndex)
      e.target.parentNode.classList.remove('pick')
      setting.imgIndex = null
    }

    if (isActive(e.target.parentNode)) {
      setting.imgIndex = +e.target.dataset.index
    } 
  }

  const triggerCardAction = e => {
    if (setting.stack) {

      const selectedCard = setting.images.find(card => card.dataset.index === e.target.dataset.index)
      const otherCards = setting.sortedImages.filter(card => card.dataset.index !== e.target.dataset.index)
      const { left, top } = selectedCard.getBoundingClientRect()

      setting.sortedImages = [selectedCard,...otherCards]
      positionSortedCards()
      setProperties({
        target: selectedCard,
        x: px(left),
        y: px(top),
        z: 900 + setting.images.length,
        prefix: 'prev-stack'
      })
      selectedCard.classList.add('spin_to_the_back')
      setTimeout(()=> {
        selectedCard.classList.remove('spin_to_the_back')
      }, 800)
    } else {
      hideOrDisplayImage(e)
    }
  }

  const hideImage = index => {
    setVertRatioAndHoriRatio(imgData[index])
    setRandomAngleAndPosition(setting.images[index], imgData[index])
  }
  
  window.addEventListener('resize', reposition)
  checkOrientation()
  setUp()
  reposition()

  elements.stackButton.addEventListener('click', ()=> {
    setting.stack = !setting.stack
    setting.sortedImages.forEach(card => {
      card.classList.toggle('stack')
    })
  })
  
}

window.addEventListener('DOMContentLoaded', init)

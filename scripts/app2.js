
function init() {
  // TODO add reshuffle
  // TODO add shift to grid?
  // TODO refactor inconsistency (img vs card)
  
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
    offsetX: 20,
    offsetY: 20,
    isDragging: false,
  }

  const isActive = target => target.classList.contains('pick')
  const withinBuffer = ({ a, b, buffer }) => Math.abs(a - b) < buffer
  const randomPos = () => `${Math.floor(Math.random() * 70)}%`
  const randomAngle = () => Math.floor(Math.random() * 360)
  const isNum = x => typeof x === 'number'
  const px = num => `${num}px`
  const client = (e, type) => e.type[0] === 'm' ? e[`client${type}`] : e.touches[0][`client${type}`]
  const roundedClient = (e, type) => Math.round(client(e, type))

  const setProperty = (target, property, value, prefix) => {
    target.style.setProperty(`--${prefix ? `${prefix}-` : ''}${property}`, value)
  }

  const setProperties = ({ target, h, w, x, y, deg, z, prefix, delay }) => {
    if (h) setProperty(target, 'height', h, prefix)
    if (w) setProperty(target, 'width', w, prefix)
    if (y) setProperty(target, 'top', y, prefix)
    if (x) setProperty(target, 'left', x, prefix)
    if (isNum(deg)) setProperty(target, 'deg', `${deg}deg`, prefix)
    if (z) setProperty(target, 'z', z, prefix)
    if (isNum(delay)) setProperty(target, 'delay', `${delay}s`, prefix)
  }

  const addEvents = (target, event, action, array) => {
    array.forEach(a => event === 'remove' ? target.removeEventListener(a, action) : target.addEventListener(a, action))
  }
  const mouse = {
    up: (t, e, a) => addEvents(t, e, a, ['mouseup', 'touchend']),
    move: (t, e, a) => addEvents(t, e, a, ['mousemove', 'touchmove']),
    down: (t, e, a) => addEvents(t, e, a, ['mousedown', 'touchstart']),
    enter: (t, e, a) => addEvents(t, e, a, ['mouseenter', 'touchstart']),
    leave: (t, e, a) => addEvents(t, e, a, ['mouseleave', 'touchmove'])
  }

  const drag = (e, target, pos, x, y) => {
    if (e.type[0] === 'm') e.preventDefault()  
    pos.a = pos.c - x
    pos.b = pos.d - y
    const newX = target.offsetLeft - pos.a
    const newY = target.offsetTop - pos.b

    if (!withinBuffer({ a:newX, b: target.offsetLeft, buffer: 1 })) {
      setting.isDragging = true
      setProperties({
        target: target,
        x: px(newX), y: px(newY),
      })
    }
  }


  const addDragAction = target =>{
    const pos = { a: 0, b: 0, c: 0, d: 0 }
    
    const onGrab = e =>{
      if (!setting.stack) {
        pos.c = roundedClient(e, 'X')
        pos.d = roundedClient(e, 'Y')  
        mouse.up(document, 'add', onLetGo)
        mouse.move(document, 'add', onDrag)
        target.classList.add('drag')
      }
    }
    const onDrag = e =>{
      const x = roundedClient(e, 'X')
      const y = roundedClient(e, 'Y')
      drag(e, target, pos, x, y)
      pos.c = x
      pos.d = y
    }
    const onLetGo = () => {
      mouse.up(document, 'remove', onLetGo)
      mouse.move(document,'remove', onDrag)
      target.classList.remove('drag')
      const newX = target.offsetLeft - pos.a
      const newY = target.offsetTop - pos.b
      setProperties({
        target: target,
        x: px(newX), y: px(newY),
      })
      // need to delay this so click action doesn't trigger straight after dragging
      setTimeout(()=> setting.isDragging = false)
    }
    mouse.down(target,'add', onGrab)
  }

  const checkOrientation = () =>{
    setting.screenAspect = window.innerHeight > window.innerWidth ? 'vertical' : 'horizontal'
    setting.aspectKey = setting.screenAspect === 'vertical' ? 'vw' : 'vh'
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

  const setRandomAngleAndPosition = img => {
    const { imgSize, vertRatio, horiRatio, aspectKey, screenAspect } = setting
    const imgHeight = imgSize * vertRatio
    const imgWidth = imgSize * horiRatio

    setProperties({
      target: img,
      w: imgWidth + aspectKey,
      h: imgHeight + aspectKey,
      x: randomPos(), y: randomPos(),
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
      x: px((w - setting.greaterW) / 2),
      y: px((h - setting.greaterH) / 2),
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
    setRandomAngleAndPosition(newImg)
    
    elements.portfolio.appendChild(newImg)
    setting.images.push(newImg)
  }

  const peek = (img, action) => {
    const selectedCardIndex = setting.sortedImages.indexOf(img)
    if (action === 'add' && selectedCardIndex !== setting.sortedImages.length - 1) {
      img.classList.add('peek')
    } else {
      img.classList.remove('peek')
    }
  }

  const setUp = () => {
    imgData.forEach((img, i) => createImage(img, i))
    setting.sortedImages = [...setting.images]
    setting.images.forEach(img => {
      img.addEventListener('click', triggerCardAction)
      addDragAction(img)
      mouse.enter(img, 'add', ()=> peek(img, 'add'))
      mouse.leave(img, 'add', ()=> peek(img, 'remove'))
    })
  }

  const positionStackedCards = () => {
    const { innerHeight: h, innerWidth: w } = window
    const defaultX = (w - 200) / 2
    const defaultY = (h - 300) / 2
    let z = 900
    
    setting.sortedImages.forEach((card, i) => {
      setProperties({
        target: card,
        x: px(defaultX - setting.offsetX * (setting.images.length - i)),
        y: px(defaultY - setting.offsetY * (setting.images.length - i)),
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

    positionStackedCards()
  }

  const hideOrDisplayImage = e => {
    if (!setting.isDragging) {
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
  }

  const moveStackedCards = e => {
    const selectedCard = setting.images.find(card => card.dataset.index === e.target.dataset.index)
    const selectedCardIndex = setting.sortedImages.indexOf(selectedCard)
    const { left, top } = selectedCard.getBoundingClientRect()

    // move selected card to back
    if (selectedCardIndex === setting.sortedImages.length - 1) {
      const otherCards = setting.sortedImages.filter(card => card.dataset.index !== e.target.dataset.index)
      setting.sortedImages = [selectedCard,...otherCards]
      positionStackedCards()
      setProperties({
        target: selectedCard,
        x: px(left), y: px(top),
        z: 900 + setting.images.length,
        delay: 0,
        prefix: 'prev-stack'
      })
      selectedCard.classList.add('spin_to_the_back')
      setTimeout(()=> {
        selectedCard.classList.remove('spin_to_the_back')
      }, 800)

      // move cards on top of selected card to the back
    } else {
      const cardsToMove = setting.sortedImages.filter((_card, i) => i > selectedCardIndex)
      const otherCards = setting.sortedImages.filter((_card, i) => i <= selectedCardIndex)
      setting.sortedImages = [...cardsToMove,...otherCards]
      positionStackedCards()
      cardsToMove.forEach((card, i) => {
        const offset = i + 1
        setProperties({
          target: card,
          x: px(left + (offset * setting.offsetX)),
          y: px(top + (offset * setting.offsetY)),
          z: 9900 + offset,
          delay: offset * 0.05,
          prefix: 'prev-stack'
        })
      })
      cardsToMove.forEach(card => card.classList.add('spin_to_the_back'))
      setTimeout(()=> {
        cardsToMove.forEach(card => card.classList.remove('spin_to_the_back'))
      }, 800 + cardsToMove.length * 50)
    }  
  }

  const triggerCardAction = e => {
    setting.images.forEach(card => card.classList.remove('peek'))
    if (setting.stack) {
      moveStackedCards(e)
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
    setting.sortedImages.forEach(card => card.classList.toggle('stack'))
    setting.images.forEach(card => card.classList.remove('pick'))
  })
  
}

window.addEventListener('DOMContentLoaded', init)

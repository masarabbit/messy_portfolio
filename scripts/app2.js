
function init() {
  // TODO add shift to grid? in which case, what to do with display
  
  const imgData = [
    { h: 500, w: 500, img: 'mochimochiusagi.gif' },
    { h: 634, w: 450, img: 'popcorn_bunny.png' },
    { h: 1320, w: 1000, img: 'cocoala.jpg' },
    { h: 500, w: 500, img: 'smile.gif' },
    { h: 660, w: 450, img: 'rhino_banana.jpg' },
    { h: 634, w: 450, img: 'icecream.jpg' },
    { h: 500, w: 500, img: 'boxing_bunny.gif' },
    { h: 562, w: 800, img: 'pizza_squirrel.jpg' },
    { h: 1414, w: 1000, img: 'animals.jpg' },
    { h: 750, w: 500, img: 'bunny_icecream2.jpg' }
  ]

  const elements = {
    portfolio: document.querySelector('.portfolio'),
    indicator: document.querySelector('.indicator'),
    buttons: document.querySelectorAll('button'),
    displayClone: document.querySelector('.display_clone')
  }

  const setting = {
    imgSize: 30,
    images: [],
    sortedImages: [],
    screenAspect: 'horizontal',
    aspectKey: 'vh',
    vertRatio: 1,
    horiRatio: 1,
    imgIndex: null,
    offsetX: 20,
    offsetY: 20,
    isStacked: false,
    isDragging: false,
    isGrid: false,
  }

  const isActive = target => target.classList.contains('pick')
  const withinBuffer = ({ a, b, buffer }) => Math.abs(a - b) < buffer
  const randomPos = () => `${Math.floor(Math.random() * 70)}%`
  const randomAngle = () => Math.floor(Math.random() * 360)
  const isNum = x => typeof x === 'number'
  const px = num => `${num}px`
  const client = (e, type) => e.type[0] === 'm' ? e[`client${type}`] : e.touches[0][`client${type}`]
  const roundedClient = (e, type) => Math.round(client(e, type))
  const shuffledArray = array => [...array.sort((a, b) => 0.5 - Math.random())]

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
      if (!setting.isStacked && !setting.isGrid) {
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

  const ratio = data =>{
    const { h, w } = data
    const isVert = h >= w

    return { 
      vertRatio: isVert ? h / w : 1,
      horiRatio: isVert ? 1 : w / h
    }
  }

  const setCardDisplayPosition = (card, data) => {
    const { imgSize, screenAspect } = setting
    const { vertRatio, horiRatio } = ratio(data)
    const imgHeight = imgSize * vertRatio
    const imgWidth = imgSize * horiRatio

    // set card display position
    const { innerHeight: h, innerWidth: w } = window
    const isHorizontal = screenAspect === 'horizontal'
    let cardWidth
    let cardHeight

    if (isHorizontal) {
      cardWidth = (h - 50) * (imgWidth / imgHeight)
      // adjust if wider than screen
      cardWidth = cardWidth > w ? w - 20 : cardWidth
      // adjust if bigger than asset
      cardWidth = cardWidth > data.w ? data.w : cardWidth
      cardHeight = cardWidth * (imgHeight / imgWidth)
    } else {
      cardHeight = (w - 20) * (imgHeight / imgWidth)
      // adjust if taller than screen
      cardHeight = cardHeight > h ? h - 50 : cardHeight
      // adjust if bigger than asset
      cardHeight = cardHeight > data.h ? data.h : cardHeight
      cardWidth = cardHeight * (imgWidth / imgHeight)
    }

    setProperties({
      target: card,
      w: px(cardWidth),
      h: px(cardHeight),
      x: px((w - cardWidth) / 2),
      y: px((h - cardHeight) / 2),
      z: 1,
      deg: 0,
      prefix: 'display'
    })
  }

  const setRandomAngleAndPosition = (card, data) => {
    const { imgSize, aspectKey } = setting
    const { vertRatio, horiRatio } = ratio(data)
    const imgHeight = imgSize * vertRatio
    const imgWidth = imgSize * horiRatio

    setProperties({
      target: card,
      w: imgWidth + aspectKey,
      h: imgHeight + aspectKey,
      x: randomPos(), y: randomPos(),
      deg: randomAngle(),
    })
    
    setCardDisplayPosition(card, data)
  }
  
  const createCard = (data, index) => {
    const newImg = document.createElement('div')
    newImg.classList.add('card')
    newImg.dataset.index = index
    newImg.innerHTML = `<img class="${data.h > data.w ? 'vert' : 'hori'}" data-index="${index}" src= "./assets/${data.img}" alt="${alt(data.img)}">`
    setRandomAngleAndPosition(newImg, data)
    
    elements.portfolio.appendChild(newImg)
    setting.images.push(newImg)
  }

  const peek = (card, action) => {
    const selectedCardIndex = setting.sortedImages.indexOf(card)
    if (action === 'add' && selectedCardIndex !== setting.sortedImages.length - 1 && !setting.isGrid) {
      card.classList.add('peek')
    } else {
      card.classList.remove('peek')
    }
  }

  const setUp = () => {
    imgData.forEach((img, i) => createCard(img, i))
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

    imgData.forEach((data, i) => {
      setRandomAngleAndPosition(setting.images[i], data)
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
        z: 9900 + setting.images.length,
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

  const closeDisplayClone = () => {
    elements.displayClone.classList.add('hide')
    setTimeout(()=> {
      elements.displayClone.innerHTML = null
      ;['display','hide'].forEach(className => elements.displayClone.classList.remove(className))    
    }, 400)
  }

  const displayDisplayClone = e => {
    const data = imgData[+e.target.dataset.index]
    elements.displayClone.innerHTML = `<img src= "./assets/${data.img}" alt="${alt(data.img)}">`

    const { left, top } = e.target.parentNode.getBoundingClientRect()
    setProperties({
      target: elements.displayClone,
      x: px(left),
      y: px(top),
      z: 999,
      prefix: 'grid-display'
    })

    setCardDisplayPosition(elements.displayClone, data)
    elements.displayClone.classList.add('display')
  }

  const triggerCardAction = e => {
    setting.images.forEach(card => card.classList.remove('peek'))

    if (setting.isGrid) {
      if (elements.displayClone.innerHTML) {
        closeDisplayClone()
        setTimeout(()=> {
          displayDisplayClone(e)
        }, 400)
      } else {
        displayDisplayClone(e)
      }
    } else if (setting.isStacked && !setting.isGrid) {
      moveStackedCards(e)
    } else {
      hideOrDisplayImage(e)
    }
  }

  const hideImage = index => {
    setRandomAngleAndPosition(setting.images[index], imgData[index])
  }
  
  window.addEventListener('resize', reposition)
  checkOrientation()
  setUp()
  reposition()

  elements.displayClone.addEventListener('click', closeDisplayClone)
  
  const addClickEvent = (btn, className, event) => btn.classList.contains(className) && btn.addEventListener('click', event)
  elements.buttons.forEach(btn => {
    addClickEvent(btn, 'stack_btn', ()=> {
      setting.isStacked = !setting.isStacked
      setting.isGrid = false
      elements.portfolio.classList.remove('grid')
      setting.sortedImages.forEach(card => card.classList.toggle('stack'))
      setting.images.forEach(card => card.classList.remove('pick'))
    })
    addClickEvent(btn, 'shuffle_btn', ()=> {
      if (!setting.isGrid) {
        if (setting.isStacked) setting.sortedImages = shuffledArray(setting.sortedImages)
        reposition()
      }
    })
    addClickEvent(btn, 'grid_btn', ()=> {
      setting.isGrid = !setting.isGrid
      setting.isStacked = false
      elements.portfolio.classList.toggle('grid')
      elements.displayClone.classList.remove('display')
    })
  })
  
}

window.addEventListener('DOMContentLoaded', init)

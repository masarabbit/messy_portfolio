
function init() {

  // TODO consider moving nav position to left and right of page (and display when relevant)

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
    buttons: document.querySelectorAll('button'),
    nav: document.querySelector('nav'),
    indicator: document.querySelector('.indicator')
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
    isDragging: false,
    mode: null,
    navigating: false,
    gridTimer: null,
  }

  const isActive = target => target.classList.contains('pick')
  const overBuffer = ({ a, b, buffer }) => Math.abs(a - b) > buffer
  const randomPos = () => `${Math.floor(Math.random() * 70)}%`
  const randomAngle = () => Math.floor(Math.random() * 360)
  const isNum = x => typeof x === 'number'
  const px = num => `${num}px`
  const client = (e, type) => e.type[0] === 'm' ? e[`client${type}`] : e.touches[0][`client${type}`]
  const roundedClient = (e, type) => Math.round(client(e, type))
  const shuffledArray = array => [...array.sort(() => 0.5 - Math.random())]
  const isStackMode = () => ['stack', 'single_stack'].includes(setting.mode)

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

    if (overBuffer({ a:newX, b: target.offsetLeft, buffer: 1 })) {

      if (overBuffer({ a:newX, b: target.offsetLeft, buffer: 20 }) && document.querySelector('.pick')) { 
        document.querySelector(`.${newX > target.offsetLeft ? 'next_btn' : 'prev_btn'}`).click()
      } else if (!setting.mode && !setting.navigating) {
        setting.isDragging = true
        setProperties({
          target: target,
          x: px(newX), y: px(newY),
        })
      } else if (isStackMode() && overBuffer({ a:newX, b: target.offsetLeft, buffer: 20 })) {
        // swipe stacked cards
        document.querySelector(`.${newX > target.offsetLeft ? 'next_btn' : 'prev_btn'}`).click()
        setting.navigating = true
      }
    }
  }

  const addDragAction = target =>{
    const pos = { a: 0, b: 0, c: 0, d: 0 }
    
    const onGrab = e =>{
      pos.c = roundedClient(e, 'X')
      pos.d = roundedClient(e, 'Y')  
      mouse.up(document, 'add', onLetGo)
      mouse.move(document, 'add', onDrag)
      if (!setting.mode && !setting.navigating) target.classList.add('drag')
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
      if (!setting.mode) {
        target.classList.remove('drag')
        const newX = target.offsetLeft - pos.a
        const newY = target.offsetTop - pos.b
        if (!setting.navigating) {
          setProperties({
            target: target,
            x: px(newX), y: px(newY),
          })
        }
        // need to delay this so click action doesn't trigger straight after dragging
        setTimeout(()=> setting.isDragging = false)
      }
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
      z: 99999,
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
    newImg.innerHTML = `<img class="${data.h > data.w ? 'vert' : 'hori'}" data-index="${index}" src= "../assets/${data.img}" alt="${alt(data.img)}">`
    setRandomAngleAndPosition(newImg, data)
    
    elements.portfolio.appendChild(newImg)
    setting.images.push(newImg)
  }

  const peek = (card, action) => {
    const selectedCardIndex = setting.sortedImages.indexOf(card)
    if (action === 'add' && selectedCardIndex > 0 && !setting.isGrid) {
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

  const calcX = (i, n) => i % n
  const calcY = (i, n) => Math.floor(i / n)
  const setGridNo = w => {
    return w < 300
      ? 2
      : w < 600
        ? 3
        : w < 1000
          ? 6
          : 8
  }

  const positionStackedCards = () => {
    const { innerHeight: h, innerWidth: w } = window
    const defaultX = (w - 200) / 2
    const defaultY = (h - 300) / 2
    let z = 900

    const gridNo = setGridNo(w)
    const gap = 12
    let cardSize = ((w - gap) / gridNo) - gap
    if (gridNo === 8 && cardSize > 148) cardSize = 148
    
    setting.sortedImages.forEach((card, i) => {
      const { w, h } = imgData[card.dataset.index]
      setProperties({
        target: card,
        x: px(defaultX - setting.offsetX * i),
        y: px(defaultY - setting.offsetY * i),
        w: px(300 * (w / h)),
        deg: 0,
        z: z--,
        prefix: 'stack'
      })

      setProperties({
        target: card,
        x: px(gap + (cardSize + gap) * calcX(i, gridNo)),
        // 20 is extra space on top
        y: px(20 + gap + (cardSize + gap) * calcY(i, gridNo)),
        w: px(cardSize),
        h: px(cardSize),
        z: 0 - calcY(i, gridNo),
        prefix: 'grid'
      })
    })

    setProperties({
      target: elements.nav,
      x: px(defaultX + 128),
      y: px(defaultY + 300),
    })
  }

  const reposition = () => {
    checkOrientation()
    imgData.forEach((data, i) => setRandomAngleAndPosition(setting.images[i], data))
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

  const displayOrReorderCards = e => {
    const selectedCard = setting.images.find(card => card.dataset.index === e.target.dataset.index)
    const selectedCardIndex = setting.sortedImages.indexOf(selectedCard)
    const { left, top } = selectedCard.getBoundingClientRect()
    if (document.querySelector('.pick')) {
      const otherCards = setting.sortedImages.filter((_card, i) => i !== selectedCardIndex)
      setting.sortedImages = [selectedCard,...otherCards]
      reposition()
      hideImage(selectedCardIndex)
      e.target.parentNode.classList.remove('pick')
      setting.imgIndex = null
    } else if (selectedCardIndex === 0) {
      hideOrDisplayImage(e)
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

  const changeToNextCard = direction => {
    if (setting.navigating) return
    setting.navigating = true
    const currentCard = document.querySelector('.pick')
    const cardIndex = setting.sortedImages.indexOf(currentCard)
    const nextIndex = direction === 'next' 
      ? cardIndex + 1 === setting.sortedImages.length ? 0 : cardIndex + 1
      : cardIndex - 1 < 0 ? setting.sortedImages.length - 1 : cardIndex - 1
    currentCard.classList.remove('pick')
    setting.sortedImages[nextIndex].classList.add('pick')
    setting.imgIndex = nextIndex
    if (isStackMode()) {    
      const otherCards = setting.sortedImages.filter((_card, i) => i !== nextIndex)
      setting.sortedImages = direction === 'next' 
        ? [...otherCards, setting.sortedImages[nextIndex]]
        : [setting.sortedImages[nextIndex], ...otherCards]
      reposition()
    }
    setTimeout(()=> setting.navigating = false, 300)
  } 

  const handleNextBtn = () => {
    document.querySelector('.pick') 
      ? changeToNextCard('next')
      : spinBackFrontCardToBack()
  }

  const handlePrevBtn = () => {
    document.querySelector('.pick') 
      ? changeToNextCard('prev')
      : spinLastCardToFront()
  }

  const spinBackFrontCardToBack = () => {
    if (setting.navigating) return
    const currentCard = setting.sortedImages[0]
    const { left, top } = currentCard.getBoundingClientRect()

    const otherCards = setting.sortedImages.filter((_card, i) => i > 0)
    setting.sortedImages = [...otherCards, currentCard]
    positionStackedCards()
    setProperties({
      target: currentCard,
      x: px(left), y: px(top),
      z: 9900 + setting.images.length,
      delay: 0,
      prefix: 'prev-stack'
    })

    currentCard.classList.add('spin_to_the_back')
    setTimeout(()=> {
      currentCard.classList.remove('spin_to_the_back')
      setting.navigating = false
    }, 700)
  }

  const spinLastCardToFront = () => {
    if (setting.navigating) return
    const lastIndex = setting.sortedImages.length - 1
    const lastCard = setting.sortedImages[lastIndex]
    const { left, top } = lastCard.getBoundingClientRect()
    const otherCards = setting.sortedImages.filter((_card, i) => i !== lastIndex)
    setting.sortedImages = [lastCard, ...otherCards]
    positionStackedCards()
    const offset = setting.sortedImages.length - 1
    setProperties({
      target: lastCard,
      x: px(left + (offset * setting.offsetX)), 
      y: px(top + (offset * setting.offsetY)),
      z: -99000,
      delay: 0,
      prefix: 'prev-stack'
    })
    lastCard.classList.add('spin_to_the_front')
    setTimeout(()=> {
      lastCard.classList.remove('spin_to_the_front')
      setting.navigating = false
    }, 700)
  }

  const triggerCardAction = e => {
    setting.images.forEach(card => card.classList.remove('peek'))
    if (isStackMode()) {
      displayOrReorderCards(e)
    } else {
      hideOrDisplayImage(e)
    }
  }

  const hideImage = index => setRandomAngleAndPosition(setting.images[index], imgData[index])
  
  const changeMode = mode => {
    setting.mode = setting.mode === mode ? null : mode
  }

  const updateSelectState = mode => {
    elements.buttons.forEach(btn => btn.classList.remove('selected'))
    if (mode) document.querySelector(`.${mode}_btn`).classList[setting.mode === mode ? 'add' : 'remove']('selected')
    if (!setting.mode) document.querySelector('.scatter_btn').classList.add('selected')
    if (mode !== 'grid') {
      clearTimeout(setting.gridTimer)
      elements.portfolio.parentNode.classList.remove('overflow')
    }
  }

  const toggleStackMode = mode => {
    changeMode(mode)
    if (isStackMode()) {
      ;['offsetX', 'offsetY'].forEach(key => setting[key] = mode === 'stack' ? 20 : 0)
      positionStackedCards()
      elements.portfolio.classList.remove('grid')
      elements.portfolio.classList.add('stack')
      setting.images.forEach(card => card.classList.remove('pick'))
    } else {
      elements.portfolio.classList.remove('stack')
    }
    updateSelectState(mode)
  }

  const shuffleCards = () => {
    if (['stack', 'single_stack', 'grid'].includes(setting.mode)) setting.sortedImages = shuffledArray(setting.sortedImages)
    reposition()
  }
  
  const toggleGridMode = () => {
    changeMode('grid')
    if (setting.mode === 'grid') {
      elements.portfolio.classList.add('grid')
      setting.images.forEach(card => card.classList.remove('pick'))
      elements.portfolio.classList.remove('stack')
      setting.gridTimer = setTimeout(()=> elements.portfolio.parentNode.classList.add('overflow'), 400)
    } else {
      elements.portfolio.classList.remove('grid')
    }
    updateSelectState('grid')
  }

  window.addEventListener('resize', reposition)
  checkOrientation()
  setUp()
  reposition()
  updateSelectState()
  
  const addClickEvent = (btn, className, event) => btn.classList.contains(className) && btn.addEventListener('click', event)
  elements.buttons.forEach(btn => {
    addClickEvent(btn, 'scatter_btn', ()=> {
      setting.mode = null
      updateSelectState()
      ;['stack', 'grid'].forEach(className => elements.portfolio.classList.remove(className)) 
    })
    addClickEvent(btn, 'stack_btn', ()=> toggleStackMode('stack'))
    addClickEvent(btn, 'single_stack_btn', ()=> toggleStackMode('single_stack'))
    addClickEvent(btn, 'shuffle_btn', shuffleCards)
    addClickEvent(btn, 'grid_btn', toggleGridMode)
    addClickEvent(btn, 'prev_btn', handlePrevBtn)
    addClickEvent(btn, 'next_btn', handleNextBtn)
  })
}

window.addEventListener('DOMContentLoaded', init)

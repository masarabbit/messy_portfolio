
function init() {

  // TODO maybe gris could be improved further
  
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
    displayCard: document.querySelector('.display_card'),
    // indicator: document.querySelector('.indicator')
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
  }

  const isActive = target => target.classList.contains('pick')
  const withinBuffer = ({ a, b, buffer }) => Math.abs(a - b) < buffer
  const randomPos = () => `${Math.floor(Math.random() * 70)}%`
  const randomAngle = () => Math.floor(Math.random() * 360)
  const isNum = x => typeof x === 'number'
  const px = num => `${num}px`
  const client = (e, type) => e.type[0] === 'm' ? e[`client${type}`] : e.touches[0][`client${type}`]
  const roundedClient = (e, type) => Math.round(client(e, type))
  const shuffledArray = array => [...array.sort(() => 0.5 - Math.random())]

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
      if (!setting.mode) {
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
    imgData.forEach((data, i) => setRandomAngleAndPosition(setting.images[i], data))
    positionStackedCards()
    if (setting.selectedData) setCardDisplayPosition(elements.displayCard, setting.selectedData)
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

  const closeDisplayCard = () => {
    elements.displayCard.classList.add('hide')
    setTimeout(()=> {
      elements.displayCard.innerHTML = null
      ;['display','hide'].forEach(className => elements.displayCard.classList.remove(className))    
    }, 400)
  }

  const displayDisplayCard = e => {
    const data = imgData[+e.target.dataset.index]
    elements.displayCard.innerHTML = `<img src= "./assets/${data.img}" alt="${alt(data.img)}">`

    const { left, top } = e.target.parentNode.getBoundingClientRect()
    setProperties({
      target: elements.displayCard,
      x: px(left),
      y: px(top),
      z: 999,
      prefix: 'grid-display'
    })
    setting.selectedData = data
    setCardDisplayPosition(elements.displayCard, data)
    elements.displayCard.classList.add('display')
  }

  const triggerCardAction = e => {
    setting.images.forEach(card => card.classList.remove('peek'))

    if (setting.mode === 'grid') {
      if (elements.displayCard.innerHTML) {
        closeDisplayCard()
        setTimeout(()=> {
          displayDisplayCard(e)
        }, 400)
      } else {
        displayDisplayCard(e)
      }
    } else if (['stack', 'single_stack'].includes(setting.mode)) {
      moveStackedCards(e)
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
    if (mode) {
      document.querySelector(`.${mode}_btn`).classList[setting.mode === mode ? 'add' : 'remove']('selected')
      document.querySelector('.shuffle_btn').classList[setting.mode === 'grid' ? 'add' : 'remove']('disabled')
    }
    if (!setting.mode) document.querySelector('.scatter_btn').classList.add('selected')
  }

  const toggleStackMode = mode => {
    changeMode(mode)
    if (['stack', 'single_stack'].includes(setting.mode)) {
      ;['offsetX', 'offsetY'].forEach(key => setting[key] = mode === 'stack' ? 20 : 0)
      positionStackedCards()
      elements.portfolio.classList.remove('grid')
      if (elements.displayCard.innerHTML) closeDisplayCard()
      elements.portfolio.classList.add('stack')
      setting.images.forEach(card => card.classList.remove('pick'))
    } else {
      elements.portfolio.classList.remove('stack')
    }
    updateSelectState(mode)
  }

  const shuffleCards = () => {
    if (setting.mode !== 'grid') {
      if (['stack', 'single_stack'].includes(setting.mode)) setting.sortedImages = shuffledArray(setting.sortedImages)
      reposition()
    }
  }
  
  const toggleGridMode = () => {
    changeMode('grid')
    if (setting.mode === 'grid') {
      elements.portfolio.classList.add('grid')
      setting.images.forEach(card => card.classList.remove('pick'))
    } else {
      elements.portfolio.classList.remove('grid')
    }
    if (elements.displayCard.innerHTML) closeDisplayCard()
    updateSelectState('grid')
  }

  window.addEventListener('resize', reposition)
  checkOrientation()
  setUp()
  reposition()
  updateSelectState()

  elements.displayCard.addEventListener('click', closeDisplayCard)
  
  const addClickEvent = (btn, className, event) => btn.classList.contains(className) && btn.addEventListener('click', event)
  elements.buttons.forEach(btn => {
    addClickEvent(btn, 'scatter_btn', ()=> {
      setting.mode = null
      updateSelectState()
      ;['stack', 'grid'].forEach(className => elements.portfolio.classList.remove(className)) 
      if (elements.displayCard.innerHTML) closeDisplayCard()
    })
    addClickEvent(btn, 'stack_btn', ()=> toggleStackMode('stack'))
    addClickEvent(btn, 'single_stack_btn', ()=> toggleStackMode('single_stack'))
    addClickEvent(btn, 'shuffle_btn', shuffleCards)
    addClickEvent(btn, 'grid_btn', toggleGridMode)
  })
  
}

window.addEventListener('DOMContentLoaded', init)

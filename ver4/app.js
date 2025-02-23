
function init() {

  //TODO some of the functions should be outside the card and inside settings.

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

  const roundedClient = (e, type) => Math.round(e.type[0] === 'm' ? e[`client${type}`] : e.touches[0][`client${type}`])
  const px = n => `${n}px`
  const isNum = x => typeof x === 'number'
  const overBuffer = ({ a, b, buffer }) => Math.abs(a - b) > buffer
  const randomPos = () => `${Math.floor(Math.random() * 70)}%`
  const randomAngle = () => Math.floor(Math.random() * 360)

  const elements = {
    portfolio: document.querySelector('.portfolio'),
    buttons: document.querySelectorAll('button'),
    nav: document.querySelector('nav'),
    indicator: document.querySelector('.indicator')
  }

  const mouse = {
    addEvents(target, event, action, array) {
      array.forEach(a => target[`${event}EventListener`](a, action))
    },
    up(t, e, a) { this.addEvents(t, e, a, ['mouseup', 'touchend']) },
    move(t, e, a) { this.addEvents(t, e, a, ['mousemove', 'touchmove']) },
    down(t, e, a) { this.addEvents(t, e, a, ['mousedown', 'touchstart']) },
    enter(t, e, a) { this.addEvents(t, e, a, ['mouseenter', 'touchstart']) },
    leave(t, e, a) { this.addEvents(t, e, a, ['mouseleave', 'touchmove']) }
  }

  const settings = {
    images: [],
    selectedCard: null,
    screenAspect: 'horizontal',
    aspectKey: 'vh',
    mode: 'stack',
    offset: { x: 20, y: 20 },
    checkOrientation() {
      ;[this.screenAspect, this.aspectKey] = window.innerHeight > window.innerWidth ? ['vertical', 'vw'] : ['horizontal', 'vh']
    },
    get isStackMode() { return ['stack', 'single_stack'].includes(this.mode) },
    get lastIndex() { return this.sortedImages.length - 1 },
    spinBackFrontCardToBack() {
      if (this.isNavigating) return
      const currentCard = this.sortedImages[0]
      const { left, top } = currentCard.el.getBoundingClientRect()
      this.sortedImages = [...this.sortedImages.filter((_, i) => i > 0), currentCard]
      positionStackedCards()
      currentCard.setProperties({
        x: px(left), y: px(top),
        z: 9900 + this.images.length,
        prefix: 'prev-stack'
      })
      currentCard.el.classList.add('spin-to-the-back')
      setTimeout(()=> {
        currentCard.el.classList.remove('spin-to-the-back')
        this.isNavigating = false
      }, 700)
    },
    spinLastCardToFront() {
      if (this.isNavigating) return
      const lastCard = this.sortedImages[this.lastIndex]
      const { left, top } = lastCard.el.getBoundingClientRect()
      this.sortedImages = [lastCard, ...this.sortedImages.filter((_, i) => i !== this.lastIndex)]
      positionStackedCards()
      const offset = this.sortedImages.length - 1
      lastCard.setProperties({
        x: px(left + (offset * this.offset.x)), 
        y: px(top + (offset * this.offset.y)),
        z: -99000,
        prefix: 'prev-stack'
      })
      lastCard.el.classList.add('spin-to-the-front')
      setTimeout(()=> {
        lastCard.el.classList.remove('spin-to-the-front')
        this.isNavigating = false
      }, 700)
    }
  }

  positionStackedCards = () => {
    const { innerHeight: h, innerWidth: w } = window
    const defaultX = (w - 200) / 2
    const defaultY = (h - 300) / 2
    let z = 900

    // const gridNo = setGridNo(w)
    // const gap = 12
    // let cardSize = ((w - gap) / gridNo) - gap
    // // this limits the card size to prevent overflow
    // if (gridNo === 8 && cardSize > 148) cardSize = 148
    
    settings.sortedImages.forEach((card, i) => {
      card.setProperties({
        x: px(defaultX - settings.offset.x * i),
        y: px(defaultY - settings.offset.y * i),
        w: px(300 * (card.w / card.h)),
        deg: 0,
        z: z--,
        prefix: 'stack'
      })

      // setProperties({
      //   target: card,
      //   x: px(gap + (cardSize + gap) * calcX(i, gridNo)),
      //   // 20 is extra space on top
      //   y: px(20 + gap + (cardSize + gap) * calcY(i, gridNo)),
      //   w: px(cardSize),
      //   h: px(cardSize),
      //   prefix: 'grid'
      // })
    })

    // setProperties({
    //   target: elements.nav,
    //   x: w > 900 ? px((w - 900) / 2) : px(0),
    //   y: w < 600 ? px(h - 150) : px((h / 2) - 15),
    // })
  }



  window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft') settings.spinBackFrontCardToBack()
    if (e.code === 'ArrowRight') settings.spinLastCardToFront()
    console.log(e.code)
  })



  class artCard {
    constructor(props, index) {
      const aspect = props.h >= props.w ? 'vert' : 'hori'
      Object.assign(this, {
        el: Object.assign(document.createElement('div'), {
          className: 'card',
          innerHTML: `<img class="${aspect}" src= "../assets/${props.img}" alt="${props.img.split('.')[0]}">`,
        }),
        index,
        aspect,
        grabPos: { a: 0, b: 0, c: 0, d: 0 },
        ...props,
      })
      mouse.down(this.el, 'add', this.onGrab)
      elements.portfolio.appendChild(this.el)

      this.setRatio()
      this.setCardSizeAndDisplayPosition()
      this.setRandomAngleAndPosition()

      // this.displayOrReorderCards()
      this.el.addEventListener('click', this.cardAction)
    }
    setRatio() {
      this.ratio = {
        vert: this.aspect === 'vert' ? this.h / this.w : 1,
        hori: this.aspect === 'vert' ? 1 : this.w / this.h
      }
    }
    setCardSizeAndDisplayPosition() {
      const { innerHeight: h, innerWidth: w } = window
      let cardWidth, cardHeight
      if (settings.screenAspect === 'horizontal') {
        const maxSize = (h - 50) * (this.ratio.hori / this.ratio.vert)
        cardWidth = (maxSize > w - 20 ? w - 20 : maxSize)
        cardWidth = Math.min(cardWidth, this.w)
        cardHeight = cardWidth * (this.ratio.vert / this.ratio.hori)
      } else {
        const maxSize = (w - 20) * (this.ratio.vert / this.ratio.hori)
        cardHeight = (maxSize > h - 50 ? h - 50 : maxSize)
        cardHeight = Math.min(cardHeight, this.h)
        cardWidth = cardHeight * (this.ratio.hori / this.ratio.vert)
      }
      this.setProperties({
        w: px(cardWidth),
        h: px(cardHeight),
        x: px((w - cardWidth) / 2),
        y: px((h - cardHeight) / 2),
        z: 99999,
        deg: 0,
        prefix: 'display'
      })
    }
    setRandomAngleAndPosition() {
      this.setProperties({
        w: 30 * this.ratio.hori + settings.aspectKey,
        h: 30 * this.ratio.vert + settings.aspectKey,
        x: randomPos(), y: randomPos(),
        deg: randomAngle(),
      })
    }
    setProperty(property, value, prefix) {
      this.el.style.setProperty(`--${prefix ? `${prefix}-` : ''}${property}`, value)
    }
    setProperties({ w, h, x, y, z = 0, deg = 0, prefix, delay=0 }) {
      ;[
        [w, 'width', w],
        [h, 'height', h],
        [x, 'left', x],
        [y, 'top', y],
        [deg, 'deg', `${deg}deg`],
        [z, 'z', z],
        [isNum(delay), 'delay', `${delay}s`]
      ].forEach(params => params[0] && this.setProperty(params[1], params[2], prefix))
    }
    cardAction = e => {
      settings.images.forEach(card => card.el.classList.remove('peek'))
      settings.isStackMode
        ? this.displayOrReorderCards()
        : this.hideOrDisplayImage()
    }
    get isActive() { return this.el.classList.contains('pick') }
    hideOrDisplayImage = () => {
      if (!settings.isDragging) {
        settings.images.forEach(card => card.el.classList.remove('pick'))
        elements.portfolio.classList.add('display')
        this.el.classList.add('pick')
        if (settings.selectedCard) this.hideImage()
        if (this.isActive) settings.selectedCard = this
      }
    }
    hideImage() {
      elements.portfolio.classList.remove('display')
      settings.selectedCard.el.classList.remove('pick')
      settings.selectedCard = null
      this.setRandomAngleAndPosition()
    }
    displayOrReorderCards = () => {
      // const selectedCard = setting.images.find(card => card.dataset.index === e.target.dataset.index)
      const selectedCardIndex = settings.sortedImages.indexOf(settings.selectedCard)
      const { left, top } = this.el.getBoundingClientRect()

      // if (settings.selectedCard) {
      //   // const otherCards = 
      //   setting.sortedImages = [settings.selectedCard,...setting.images.filter(card => card !== settings.selectedCard)]
      //   reposition()
      //   hideImage(selectedCardIndex)
      //   e.target.parentNode.classList.remove('pick')
      //   setting.imgIndex = null
      // } else if (selectedCardIndex === 0) {
      //   hideOrDisplayImage(e)
      // } else {
        const cardsToMove = settings.images.filter((_card, i) => i > selectedCardIndex)
        const otherCards = settings.images.filter((_card, i) => i <= selectedCardIndex)
        settings.sortedImages = [...cardsToMove,...otherCards]
        // console.log(settings.sortedImages, this.index)
        positionStackedCards()
        cardsToMove.forEach((card, i) => {
          const offset = i + 1
          card.setProperties({
            x: px(left + (offset * settings.offset.x)),
            y: px(top + (offset * settings.offset.y)),
            z: 9900 + offset,
            delay: offset * 0.05,
            prefix: 'prev-stack'
          })
        })
        cardsToMove.forEach(card => card.el.classList.add('spin-to-the-back'))
        setTimeout(()=> {
          cardsToMove.forEach(card => card.el.classList.remove('spin-to-the-back'))
        }, 800 + cardsToMove.length * 50)
      // }  
    }
    drag = (e, x, y) => {
      if (e.type[0] === 'm') e.preventDefault()
      this.grabPos.a = this.grabPos.c - x
      this.grabPos.b = this.grabPos.d - y
      const newX = this.el.offsetLeft - this.grabPos.a
      const newY = this.el.offsetTop - this.grabPos.b

      if (overBuffer({ a: newX, b: this.el.offsetLeft, buffer: 1 })) {
        if (overBuffer({ a: newX, b: this.el.offsetLeft, buffer: 20 }) && document.querySelector('.pick')) {
          // document.querySelector(`.${newX > target.offsetLeft ? 'next_btn' : 'prev_btn'}`).click()
        } else if (!settings.mode && !settings.isNavigating) {
          settings.isDragging = true
          this.setProperties({
            x: px(newX), y: px(newY),
          })
        } else if (settings.isStackMode && overBuffer({ a: newX, b: this.el.offsetLeft, buffer: 20 })) {
          // swipe stacked cards
          // document.querySelector(`.${newX > target.offsetLeft ? 'next_btn' : 'prev_btn'}`).click()
          settings.isNavigating = true
        }
      }

    }
    onGrab = e => {
      this.grabPos.c = roundedClient(e, 'X')
      this.grabPos.d = roundedClient(e, 'Y')
      mouse.up(document, 'add', this.onLetGo)
      mouse.move(document, 'add', this.onDrag)
      this.el.classList.add('drag')
      if (!settings.mode && !settings.isNavigating) this.el.classList.add('drag')
    }
    onDrag = e => {
      const x = roundedClient(e, 'X')
      const y = roundedClient(e, 'Y')
      this.drag(e, x, y)
      this.grabPos.c = x
      this.grabPos.d = y
    }
    onLetGo = () => {
      mouse.up(document, 'remove', this.onLetGo)
      mouse.move(document, 'remove', this.onDrag)
      if (!settings.mode) {
        this.el.classList.remove('drag')
        if (!settings.isNavigating) {
          this.setProperties({
            x: px(this.el.offsetLeft - this.grabPos.a),
            y: px(this.el.offsetTop - this.grabPos.b),
          })
        }
        // need to delay this so click action doesn't trigger straight after dragging
        setTimeout(() => settings.isDragging = false)
      }
    }
  }

  settings.checkOrientation()
  settings.images = imgData.map((img, i) => new artCard(img, i))
  settings.sortedImages = [...settings.images]
  positionStackedCards()

}

window.addEventListener('DOMContentLoaded', init)

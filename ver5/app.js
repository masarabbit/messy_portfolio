window.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.wrapper')
  const randomN = n => Math.floor(Math.random() * n)
  const randomAngle = n => Math.floor(Math.random() * (n || 360)) + 'deg'

  const kebabToCamelCase = str => {
    return str
      .split('-')
      .map((word, i) => {
        if (i)
          return String(word).charAt(0).toUpperCase() + String(word).slice(1)
        return word
      })
      .join('')
  }

  const imgData = [
    // { h: 500, w: 500, img: 'mochimochiusagi.gif' },
    // { h: 634, w: 450, img: 'popcorn_bunny.png' },
    // { h: 1320, w: 1000, img: 'cocoala.jpg' },
    { h: 500, w: 500, img: 'smile.gif' },
    { h: 660, w: 450, img: 'rhino_banana.jpg' },
    { h: 634, w: 450, img: 'icecream.jpg' },
    { h: 500, w: 500, img: 'boxing_bunny.gif' },
    { h: 562, w: 800, img: 'pizza_squirrel.jpg' },
    { h: 1414, w: 1000, img: 'animals.jpg' },
    { h: 750, w: 500, img: 'bunny_icecream2.jpg' },
  ]

  window.addEventListener('resize', () => {
    settings.cards.forEach(card => card.setScatterPos())
  })

  // const colors = ['#6618aa', '#189baa', '#cf7e1c', '#ed559f', '#18aa63']

  const settings = {
    cards: [],
    wrapperState: 'deck',
    get lastCard() {
      return this.cards[this.cards.length - 1]
    },
    get cardsOtherThanLast() {
      return this.cards.slice(0, this.cards.length - 1)
    },
    shuffleFront() {
      this.lastCard.el.setAttribute('state', 'shuffle-back')

      this.cards = [this.lastCard, ...this.cardsOtherThanLast]
      this.cards.forEach(card => {
        card.setOffset()
      })
      setTimeout(() => {
        this.cards.forEach(card => card.setPrevOffset())
      }, 400)
    },
    shuffleBack(card) {
      const cardToMove = card || this.cards[0]
      cardToMove.el.setAttribute('state', 'shuffle-front')

      this.cards = [...this.cards.filter(c => c !== cardToMove), cardToMove]
      this.cards.forEach(card => card.setOffset())
      setTimeout(() => {
        this.cards.forEach(card => {
          card.setPrevOffset()
        })
      }, 400)
    },
    resetPointers() {
      this.pointerdown = null
      this.pointermove = null
    },
    get isDeckLocked() {
      return this.wrapperState !== 'deck'
    },
  }

  document.querySelectorAll('.arrow').forEach(b => {
    b.addEventListener('click', e =>
      settings[kebabToCamelCase(e.target.dataset.action)]()
    )
  })

  wrapper.addEventListener('pointerdown', e => {
    settings.pointerdown = e.pageX
  })

  wrapper.addEventListener('pointermove', e => {
    if (settings.pointerdown) settings.pointermove = e.pageX
  })

  wrapper.addEventListener('pointerleave', () => {
    settings.resetPointers()
  })

  document.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      settings.wrapperState = b.dataset.state
      wrapper.setAttribute('state', settings.wrapperState)
      settings.cards.forEach(card => {
        card.el.classList.remove('selected')
        card.setOffset()
        card.clearProperties()
      })
    })
  })

  class ArtCard {
    constructor({ w, h, img }) {
      const image = `<img style="--ratio: ${w} / ${h};" src="../assets/${img}"/>`
      this.el = Object.assign(document.createElement('div'), {
        className: 'card-wrapper',
        innerHTML: `<div class="card">${image}</div>`,
      })
      wrapper.appendChild(this.el)
      this.card = this.el.querySelector('.card')

      const { width, height } = this.el.getBoundingClientRect()
      this.w = width
      this.h = height
      this.setPrevOffset()
      this.setOffset()
      this.setScatterPos()

      this.el.addEventListener('pointermove', e => {
        this === settings.lastCard || settings.isDeckLocked
          ? this.handleInteraction(e)
          : this.el.classList.add('tilt')
      })
      this.el.addEventListener('pointerleave', () => {
        if (!settings.isDeckLocked) {
          this.handleSwipe()
          this.clearProperties()
        }
      })
      this.el.addEventListener('click', () => {
        if (!settings.isDeckLocked && this !== settings.lastCard) {
          this.el.classList.remove('tilt')
          settings.shuffleBack(this)
        } else {
          this.el.classList.toggle('selected')
        }
      })
    }
    handleSwipe() {
      const { pointerdown: down, pointermove: move, isSwipeLocked } = settings
      if (
        !isSwipeLocked &&
        this === settings.lastCard &&
        down &&
        move &&
        Math.abs(down - move) > 100
      ) {
        down > move ? settings.shuffleBack() : settings.shuffleFront()
        settings.isSwipeLocked = true
        settings.resetPointers()
        setTimeout(() => (settings.isSwipeLocked = false), 500)
      }
    }
    get i() {
      return settings.cards.indexOf(this)
    }
    get offsetProperties() {
      const offset = (settings.cards.length - this.i - 1) * -16 + 'px'
      return { ml: offset, mt: offset, z: this.i }
    }
    setPrevOffset() {
      const { ml, mt, z } = this.offsetProperties
      this.setProperties({ 'prev-ml': ml, 'prev-mt': mt, 'prev-z': z })
      this.el.setAttribute('state', 'neutral')
    }
    setOffset() {
      this.setProperties(this.offsetProperties)
    }
    setScatterPos() {
      // TODO this should probably consider evening this out
      this.setProperties({
        'scatter-x':
          randomN(wrapper.clientWidth) -
          randomN(wrapper.clientWidth) / 2 +
          'px',
        'scatter-y':
          randomN(wrapper.clientHeight) -
          randomN(wrapper.clientHeight) / 2 +
          'px',
        'scatter-angle-x': randomAngle(60),
        'scatter-angle-y': randomAngle(60),
        'scatter-scale': 1 / (1 + randomN(2)),
      })
    }
    handleInteraction(e) {
      const { left, top } = this.el.getBoundingClientRect()
      this.tiltCard({
        x: e.pageX - left,
        y: e.pageY - top,
      })
    }
    get center() {
      return {
        x: this.w / 2,
        y: this.h / 2,
      }
    }
    tiltCard({ x, y }) {
      this.setProperties({
        x: ((y - this.center.y) / this.center.y) * -30 + 'deg',
        y: ((x - this.center.x) / this.center.x) * 30 + 'deg',
        scale: 'scale(1.2)',
        z: 999,
      })
    }
    clearProperties() {
      this.setProperties({
        x: '0deg',
        y: '0deg',
        scale: 'scale(1)',
      })
      this.el.classList.remove('tilt')
    }
    setProperties(properties) {
      Object.keys(properties).forEach(p => {
        this.el.style.setProperty(`--${p}`, properties[p])
      })
    }
  }

  settings.cards = imgData.map(data => {
    return new ArtCard(data)
  })
  settings.cards.forEach(card => card.setOffset())
})

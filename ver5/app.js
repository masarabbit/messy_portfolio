window.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.wrapper')

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
    { h: 750, w: 500, img: 'bunny_icecream2.jpg' },
  ]

  const colors = ['#6618aa', '#189baa', '#cf7e1c', '#ed559f', '#18aa63']

  const settings = {
    shiftLeft() {
      console.log('')
    },
    cards: [],
    get lastCard() {
      return this.cards[this.cards.length - 1]
    },
    get cardsOtherThanLast() {
      return this.cards.slice(0, this.cards.length - 1)
    },
    get cardsOtherThanFirst() {
      return this.cards.slice(1)
    },
  }
  document.querySelectorAll('.arrow').forEach(b => {
    b.addEventListener('click', e => {
      console.log(e.target.dataset.dir)
      if (e.target.dataset.dir === 'right') {
        settings.lastCard.el.setAttribute('state', 'shuffle-back')

        settings.cards = [settings.lastCard, ...settings.cardsOtherThanLast]
        settings.cards.forEach(card => {
          card.setOffset()
        })
        setTimeout(() => {
          settings.cards.forEach(card => card.setPrevOffset())
        }, 500)
      }
      if (e.target.dataset.dir === 'left') {
        settings.cards[0].el.setAttribute('state', 'shuffle-front')

        settings.cards = [...settings.cardsOtherThanFirst, settings.cards[0]]
        settings.cards.forEach(card => card.setOffset())
        setTimeout(() => {
          settings.cards.forEach(card => {
            card.setPrevOffset()
          })
        }, 500)
      }
    })
  })

  class ArtCard {
    constructor({ color, i }) {
      this.el = Object.assign(document.createElement('div'), {
        className: 'card-wrapper',
        innerHTML: '<div class="card"></div>',
      })
      wrapper.appendChild(this.el)
      this.card = this.el.querySelector('.card')
      this.card.style.backgroundColor = color
      console.log('construct')
      const { width: w, height: h } = this.el.getBoundingClientRect()
      this.w = w
      this.h = h
      this.setPrevOffset()
      this.setOffset()

      this.el.addEventListener('pointermove', e => this.handleInteraction(e))
      this.el.addEventListener('pointerleave', () => this.clearProperties())
    }
    get i() {
      return settings.cards.indexOf(this)
    }
    setPrevOffset() {
      this.setProperties({
        'prev-ml': this.i * 20 + 'px',
        'prev-mt': this.i * 20 + 'px',
        'prev-z': this.i,
      })
      this.el.setAttribute('state', 'neutral')
    }
    setOffset() {
      this.setProperties({
        ml: this.i * 20 + 'px',
        mt: this.i * 20 + 'px',
        z: this.i,
      })
    }
    handleInteraction(e) {
      // e.preventDefault()
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
        // ml: '0px',
        // mt: '0px',
        z: 999,
      })
    }
    clearProperties() {
      this.setProperties({
        x: '0deg',
        y: '0deg',
        scale: 'scale(1)',
        // ml: this.i * 20 + 'px',
        // mt: this.i * 20 + 'px',
        z: this.i,
      })
    }
    setProperties(properties) {
      Object.keys(properties).forEach(p => {
        this.el.style.setProperty(`--${p}`, properties[p])
      })
    }
  }

  settings.cards = colors.map((color, i) => {
    return new ArtCard({
      i,
      color,
    })
  })
  settings.cards.forEach(card => card.setOffset())
})

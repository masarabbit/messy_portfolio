
function init() {

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

  const elements = {
    portfolio: document.querySelector('.portfolio'),
    buttons: document.querySelectorAll('button'),
    nav: document.querySelector('nav'),
    indicator: document.querySelector('.indicator')
  }

  const mouse = {
    addEvents(target, event, action, array) {
      array.forEach(a =>  target[`${event}EventListener`](a, action))
    },
    up(t, e, a) { this.addEvents(t, e, a, ['mouseup', 'touchend']) },
    move(t, e, a) { this.addEvents(t, e, a, ['mousemove', 'touchmove']) },
    down(t, e, a) { this.addEvents(t, e, a, ['mousedown', 'touchstart']) },
    enter(t, e, a) { this.addEvents(t, e, a, ['mouseenter', 'touchstart']) },
    leave(t, e, a) { this.addEvents(t, e, a, ['mouseleave', 'touchmove']) }
  }


  class artCard {
    constructor(props, index) {
      const aspect = props.h >= props.w ? 'vert' : 'hori'
      Object.assign(this, {
        el: Object.assign(document.createElement('div'), {
          className: 'card',
          innerHTML: `<img class="${aspect}" data-index="${index}" src= "../assets/${props.img}" alt="${props.img.split('.')[0]}">`,
        }),
        index,
        aspect,
        // offsetX: 20,
        // offsetY: 20,
        grabPos: { a: 0, b: 0, c: 0, d: 0 },
        ...props,
      })
      this.w /= 10,
      this.h /= 10
      this.x = index * 10,
      this.setProperties({...this})

      mouse.down(this.el,'add', this.onGrab)

      elements.portfolio.appendChild(this.el)
      // this.vertRatio = this.aspect === 'vert' ? h / w : 1,
      // this.horiRatio = this.aspect === 'vert' ? 1 : w / h
    }
    setProperty(property, value, prefix) {
      this.el.style.setProperty(`--${prefix ? `${prefix}-` : ''}${property}`, value)
    }
    setProperties({ w, h, x, y, z=0, deg=0, prefix, delay }) {
      ;[
        [w, 'width', `${w}px`],
        [h, 'height', `${h}px`],
        [x, 'left', `${x}px`],
        [y, 'top', `${y}px`],
        [deg, 'deg', `${deg}deg`],
        [z, 'z', z],
        [delay, 'delay', `${delay}s`]
      ].forEach(params => params[0] && this.setProperty(params[1], params[2], prefix))
    }
    drag = (e, x, y) => {
      if (e.type[0] === 'm') e.preventDefault()  
      this.grabPos.a = this.grabPos.c - x
      this.grabPos.b = this.grabPos.d - y
      const newX = this.el.offsetLeft - this.grabPos.a
      const newY = this.el.offsetTop - this.grabPos.b

      console.log(newX, newY)
  
      // if (overBuffer({ a:newX, b: target.offsetLeft, buffer: 1 })) {
  
      //   if (overBuffer({ a:newX, b: target.offsetLeft, buffer: 20 }) && document.querySelector('.pick')) { 
      //     document.querySelector(`.${newX > target.offsetLeft ? 'next_btn' : 'prev_btn'}`).click()
      //   } else if (!setting.mode && !setting.navigating) {
      //     setting.isDragging = true
      //     setProperties({
      //       target: target,
      //       x: px(newX), y: px(newY),
      //     })
      //   } else if (isStackMode() && overBuffer({ a:newX, b: target.offsetLeft, buffer: 20 })) {
      //     // swipe stacked cards
      //     document.querySelector(`.${newX > target.offsetLeft ? 'next_btn' : 'prev_btn'}`).click()
      //     setting.navigating = true
      //   }
      // }
      this.setProperties({
        x: newX, y: newY,
      })
    }
    onGrab = e => {
      this.grabPos.c = roundedClient(e, 'X')
      this.grabPos.d = roundedClient(e, 'Y')  
      mouse.up(document, 'add', this.onLetGo)
      mouse.move(document, 'add', this.onDrag)
      this.el.classList.add('drag')
      // if (!setting.mode && !setting.navigating) target.classList.add('drag')
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
      mouse.move(document,'remove', this.onDrag)
      // if (!setting.mode) {
        this.el.classList.remove('drag')
        // if (!setting.navigating) {
          this.setProperties({
            x: this.el.offsetLeft - this.grabPos.a, y: this.el.offsetTop -  this.grabPos.b,
          })
        // }
        // need to delay this so click action doesn't trigger straight after dragging
        // setTimeout(()=> setting.isDragging = false)
      // }
    }
  }

  imgData.forEach((img, i) => new artCard(img, i))

}

window.addEventListener('DOMContentLoaded', init)

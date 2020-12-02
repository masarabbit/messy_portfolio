function init() {

  const body = document.querySelector('body')
  const imgSize = 30
  let images = []
  let screenAspect = 'horizontal'
  let aspectKey = 'vh'
  let biggerHeight
  let biggerWidth

  checkOrientation()

  function checkOrientation(){
    if (window.innerHeight > window.innerWidth){ 
      screenAspect = 'vertical'
    } else {
      screenAspect = 'horizontal'
    }
  
    if (screenAspect === 'vertical'){
      aspectKey = 'vw'
    } else {
      aspectKey = 'vh'
    }
  }

  // const cover = document.querySelector('.cover')

  const imageArray = [
    { height: 200,width: 200,image: 'mochimochiusagi.gif' },
    { height: 634,width: 450,image: 'popcorn_bunny.png' },
    { height: 264,width: 200,image: 'cocoala.jpg' },
    { height: 200,width: 200, image: 'smile.gif' },
    { height: 660,width: 450, image: 'rhino_banana.jpg' },
    { height: 282,width: 200, image: 'icecream.jpg' },
    { height: 200,width: 200, image: 'boxing_bunny.gif' },
    { height: 562,width: 800, image: 'pizza_squirrel.jpg' },
    { height: 1414,width: 1000, image: 'animals.jpg' },
    { height: 750,width: 500, image: 'bunny_icecream2.jpg' }
  ]

  function createImage(object){
    const portfolio = document.querySelector('.portfolio')
    const newImage = document.createElement('div')
    const randomAngle = Math.floor(Math.random() * 360)
    const randomTopPos = `${Math.floor(Math.random() * 70)}%`
    const randomLeftPos = `${Math.floor(Math.random() * 70)}%`
    let vertRatio = 1
    let horiRatio = 1
    
    if (object.height > object.width || object.height === object.width){
      vertRatio = object.height / object.width
    } else {
      horiRatio = object.width / object.height 
    }

    newImage.classList.add('image_thumb')
    newImage.innerHTML = `<img src = "./assets/${object.image}" alt = "${object.image.replace('_',' ').replace('.jpg','').replace('.gif','').replace('.png','')}">`

    newImage.style.height = `${imgSize * vertRatio + aspectKey}`
    newImage.style.width = `${imgSize * horiRatio + aspectKey}`
    newImage.style.top = randomTopPos
    newImage.style.left = randomLeftPos
    newImage.style.transform = 'rotate(' + randomAngle + 'deg)'
    portfolio.appendChild(newImage)
    
    object.vertRatio = vertRatio
    object.horiRatio = horiRatio
    object.angle = randomAngle
    object.topPos = randomTopPos
    object.leftPos = randomLeftPos

    images.push(newImage)
  }


  function setUp(){
    imageArray.forEach(image =>{ //* display images
      createImage(image)
    })
  
    images.forEach(image =>{
      image.addEventListener('click',displayImage)
    })
  }
  
  
  function reset(){

    images.forEach(image =>{
      image.removeEventListener('click',displayImage)
    })
    
    images = []

    body.innerHTML = `
    <div class ='wrapper'>
      <div class="portfolio"></div>
    </div>`

    setUp()
    checkOrientation()
  }


  function displayImage(e){    
    if (!document.querySelector('.pick')){
      // console.log('no image') 
    } else {
      const prevImage = document.querySelector('.pick')
      hidePrevImage(prevImage)
    }

    if (screenAspect === 'horizontal'){
      // console.log('test')
      biggerHeight = window.innerHeight - 50
      biggerWidth = (window.innerHeight - 50) * ( e.target.width / e.target.height )
    } else {
      // console.log('testB')
      biggerHeight = (window.innerWidth - 20) * ( e.target.height / e.target.width )
      biggerWidth = (window.innerWidth - 20) 
    }
    
    const newPos = (window.innerHeight - biggerHeight ) / 2 
    const newLeft = (window.innerWidth - biggerWidth ) / 2

    e.target.parentNode.style.transform = 'rotate(0deg)'
    e.target.parentNode.style.top = `${newPos}px`
    e.target.parentNode.style.left = `${newLeft}px`
    e.target.parentNode.style.height = `${biggerHeight}px`
    e.target.parentNode.style.width = `${biggerWidth}px` 
    e.target.parentNode.classList.add('pick')

    e.target.parentNode.removeEventListener('click',displayImage)
    e.target.parentNode.addEventListener('click',hideImage)
  }


  function hideImage(e){
    e.target.parentNode.removeEventListener('click',hideImage)
    e.target.parentNode.addEventListener('click',displayImage)

    const index = images.indexOf(e.target.parentNode)
  
    images[index].style.transform = `rotate(${imageArray[index].angle}deg)`
    images[index].style.top = `${imageArray[index].topPos}`
    images[index].style.left = `${imageArray[index].leftPos}`
    images[index].style.height = `${imgSize * imageArray[index].vertRatio + aspectKey}`
    images[index].style.width = `${imgSize * imageArray[index].horiRatio + aspectKey}`
    e.target.parentNode.classList.remove('pick')
  }
  

  function hidePrevImage(prevImage){
    prevImage.removeEventListener('click',hideImage)
    prevImage.addEventListener('click',displayImage)

    const index = images.indexOf(prevImage)
  
    prevImage.style.transform = `rotate(${imageArray[index].angle}deg)`
    prevImage.style.top = `${imageArray[index].topPos}`
    prevImage.style.left = `${imageArray[index].leftPos}`
    prevImage.style.height = `${imgSize * imageArray[index].vertRatio + aspectKey}`
    prevImage.style.width = `${imgSize * imageArray[index].horiRatio + aspectKey}`
    prevImage.classList.remove('pick')
  }

  window.addEventListener('resize', reset)
  
  setUp()
}

window.addEventListener('DOMContentLoaded', init)

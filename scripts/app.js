
//! setting z-index explicitly will overwrite anything done in css...

function init() {

  // const body = document.querySelector('body')
  const imgSize = 30
  const images = []
  let screenAspect = 'horizontal'
  let aspectKey = 'vh'
  let biggerHeight
  let biggerWidth
  let vertRatio = 1
  let horiRatio = 1

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
  
  function setVertRatioAndHoriRatio(object){
    
    //! call something to set image's orientation?

    if (object.height > object.width || object.height === object.width){
      vertRatio = object.height / object.width
      horiRatio = 1
    } else {
      horiRatio = object.width / object.height 
      vertRatio = 1
    }
    
    object.vertRatio = vertRatio
    object.horiRatio = horiRatio
  }

  function setRandomAngleAndPosition(image,object) {
    const randomAngle = Math.floor(Math.random() * 360)
    const randomTopPos = `${Math.floor(Math.random() * 70)}%`
    const randomLeftPos = `${Math.floor(Math.random() * 70)}%`

    image.style.height = `${imgSize * vertRatio + aspectKey}`
    image.style.width = `${imgSize * horiRatio + aspectKey}`
    image.style.top = randomTopPos
    image.style.left = randomLeftPos
    image.style.transform = 'rotate(' + randomAngle + 'deg)'
    
    object.angle = randomAngle
    object.topPos = randomTopPos
    object.leftPos = randomLeftPos
    image.classList.add('z1')
  }


  function createImage(object){
    const portfolio = document.querySelector('.portfolio')
    const newImage = document.createElement('div')

    setVertRatioAndHoriRatio(object)
    
    newImage.classList.add('image_thumb')
    newImage.innerHTML = `<img src = "./assets/${object.image}" alt = "${object.image.replace('_',' ').replace('.jpg','').replace('.gif','').replace('.png','')}">`
    
    setRandomAngleAndPosition(newImage,object)
    
    portfolio.appendChild(newImage)
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

  function reposition() {
    checkOrientation()

    for (let i = 0; i < imageArray.length; i++){
      setVertRatioAndHoriRatio(imageArray[i])
      setRandomAngleAndPosition(images[i],imageArray[i])
      console.log(images[i])
    }
  }
  
  
  // function reset(){

  //   images.forEach(image =>{
  //     image.removeEventListener('click',displayImage)
  //   })
    
  //   images = []

  //   body.innerHTML = `
  //   <div class ='wrapper'>
  //     <div class="portfolio"></div>
  //   </div>`

  //   setUp()
  //   checkOrientation()
  // }


  function displayImage(e){    
    if (!document.querySelector('.pick')){
      // console.log('no image') 
    } else {
      const prevImage = document.querySelector('.pick')
      hidePrevImage(prevImage)
    }

    if (screenAspect === 'horizontal'){ //! this should also check for image ratio
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

    if (Math.floor(Math.random() * 2) === 1){
      setVertRatioAndHoriRatio(imageArray[index])
      setRandomAngleAndPosition(e.target.parentNode,imageArray[index])
    } else {  //* randomly switches between random position and previous position
      images[index].style.transform = `rotate(${imageArray[index].angle}deg)`
      images[index].style.top = `${imageArray[index].topPos}`
      images[index].style.left = `${imageArray[index].leftPos}`
      images[index].style.height = `${imgSize * imageArray[index].vertRatio + aspectKey}`
      images[index].style.width = `${imgSize * imageArray[index].horiRatio + aspectKey}`
    }

    e.target.parentNode.classList.remove('pick')
    e.target.parentNode.classList.remove('z1')
  }
  

  function hidePrevImage(prevImage){
    prevImage.removeEventListener('click',hideImage)
    prevImage.addEventListener('click',displayImage)

    const index = images.indexOf(prevImage)

    if (Math.floor(Math.random() * 2) === 1){
      setVertRatioAndHoriRatio(imageArray[index])
      setRandomAngleAndPosition(prevImage,imageArray[index])
    } else {
      prevImage.style.transform = `rotate(${imageArray[index].angle}deg)`
      prevImage.style.top = `${imageArray[index].topPos}`
      prevImage.style.left = `${imageArray[index].leftPos}`
      prevImage.style.height = `${imgSize * imageArray[index].vertRatio + aspectKey}`
      prevImage.style.width = `${imgSize * imageArray[index].horiRatio + aspectKey}`
    }
    
    prevImage.classList.remove('pick')
    prevImage.classList.remove('z1')
  }

  // window.addEventListener('resize', reset)
  window.addEventListener('resize', reposition)
  
  setUp()
}

window.addEventListener('DOMContentLoaded', init)

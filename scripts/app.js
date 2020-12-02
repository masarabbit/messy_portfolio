function init() {


  const body = document.querySelector('body')
  let images = []
  let screenAspect = 'horizontal'
  let aspectKey = 'vh'
  let imgSize = 25
  let biggerHeight
  let biggerWidth

  if (window.innerHeight > window.innerWidth){ 
    screenAspect = 'vertical'
  }

  if (screenAspect === 'vertical'){
    aspectKey = 'vw'
  } 

  console.log(screenAspect)
  console.log(aspectKey)

  // const cover = document.querySelector('.cover')

  const imageArray = [
    { height: 264,width: 200,image: 'cocoala.jpg' },
    { height: 264,width: 200,image: 'cocoala.jpg' },
    { height: 264,width: 200,image: 'cocoala.jpg' },
    { height: 264,width: 200,image: 'cocoala.jpg' },
    { height: 282,width: 200, image: 'icecream.jpg' },
    { height: 282,width: 200, image: 'icecream.jpg' },
    { height: 282,width: 200, image: 'icecream.jpg' },
    { height: 282,width: 200, image: 'icecream.jpg' }
  ]

  let randomAngles = []
  let randomTopPositions = []
  let randomLeftPositions = []

  function createImage(object){
    const newImage = document.createElement('div')
    const randomAngle = Math.floor(Math.random() * 360)
    const randomTopPos = `${Math.floor(Math.random() * 70)}%`
    const randomLeftPos = `${Math.floor(Math.random() * 70)}%`
    const portfolio = document.querySelector('.portfolio')
    const ratio = object.height / object.width

    // console.log(randomAngle)
    newImage.classList.add('image_thumb')
    newImage.innerHTML = `<img src = "./assets/${object.image}" alt = "${object.image.replace('.jpg','')}">`
    // newImage.style.height = `${object.height}px`
    // newImage.style.width = `${object.width}px`

    newImage.style.height = `${imgSize * ratio}${aspectKey}`
    newImage.style.width = `${imgSize + aspectKey}`
    newImage.style.top = randomTopPos
    newImage.style.left = randomLeftPos
    newImage.style.transform = 'rotate(' + randomAngle + 'deg)'
    portfolio.appendChild(newImage)

    images.push(newImage)
    randomAngles.push(randomAngle)
    randomTopPositions.push(randomTopPos)
    randomLeftPositions.push(randomLeftPos)
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
    randomAngles = []
    randomTopPositions = []
    randomLeftPositions = []

    body.innerHTML = `
    <div class ='wrapper'>
      <div class="portfolio"></div>
    </div>`

    // setTimeout(()=>{
    setUp()
    // },800)

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
    
    console.log(`${screenAspect}_${aspectKey}`)
  }

  function displayImage(e){
      
    if (!document.querySelector('.pick')){
      console.log('no image') 
    } else {
      const prevImage = document.querySelector('.pick')
      hidePrevImage(prevImage)
    }

    e.target.parentNode.style.height = `${window.innerHeight - 50}px`
    e.target.parentNode.style.width = `${(window.innerHeight - 50) * (e.target.width / e.target.height)}px` 
    e.target.parentNode.classList.add('pick')
    
    if (screenAspect === 'horizontal'){
      console.log('test')
      biggerHeight = window.innerHeight - 50
      biggerWidth = (window.innerHeight - 50) * ( e.target.width / e.target.height )
    } else {
      console.log('testB')
      biggerHeight = (window.innerWidth - 40) * ( e.target.height / e.target.width )
      biggerWidth = window.innerWidth - 40
    }
    
    // setTimeout(()=>{
    const newPos = (window.innerHeight - biggerHeight ) / 2 //* this need too be diferent?
    const newLeft = (window.innerWidth - biggerWidth ) / 2
    // console.log(e.target)
    e.target.parentNode.style.transform = 'rotate(0deg)'
    e.target.parentNode.style.top = `${newPos}px`
    e.target.parentNode.style.left = `${newLeft}px`

    e.target.parentNode.removeEventListener('click',displayImage)
    e.target.parentNode.addEventListener('click',hideImage)
    // },500)
 
  }

  function hideImage(e){

    e.target.parentNode.removeEventListener('click',hideImage)
    e.target.parentNode.addEventListener('click',displayImage)

    const index = images.indexOf(e.target.parentNode)
    const ratio = imageArray[index].height / imageArray[index].width
    
    images[index].style.transform = `rotate(${randomAngles[index]}deg)`
    images[index].style.top = `${randomTopPositions[index]}`
    images[index].style.left = `${randomLeftPositions[index]}`
    images[index].style.height = `${imgSize * ratio}${aspectKey}`
    images[index].style.width = `${imgSize + aspectKey}`
    e.target.parentNode.classList.remove('pick')
  }
  

  function hidePrevImage(prevImage){

    prevImage.removeEventListener('click',hideImage)
    prevImage.addEventListener('click',displayImage)

    const index = images.indexOf(prevImage)
    const ratio = imageArray[index].height / imageArray[index].width
    
    prevImage.style.transform = `rotate(${randomAngles[index]}deg)`
    prevImage.style.top = `${randomTopPositions[index]}`
    prevImage.style.left = `${randomLeftPositions[index]}`
    prevImage.style.height = `${imgSize * ratio}${aspectKey}`
    prevImage.style.width = `${imgSize + aspectKey}`
    prevImage.classList.remove('pick')
  }

  window.addEventListener('resize', reset)
  
  setUp()
}

window.addEventListener('DOMContentLoaded', init)


// function reposition(){
//   const imageDisplayed = document.querySelectorAll('.image_thumb')
//   const randomTopPos = `${Math.floor(Math.random() * 70)}%`
//   const randomLeftPos = `${Math.floor(Math.random() * 70)}%`

//   imageDisplayed.forEach( image =>{
//     console.log(image)
//     // const index = images.indexOf(image)
//     // image.style.top = `${randomTopPositions[index]}`
//     // image.style.left = `${randomLeftPositions[index]}`
//     image.style.top = `${randomTopPos}%`
//     image.style.left = `${randomLeftPos}%`
//   })
// }




//  e.target.parentNode.style.height = `${window.innerHeight - 50}px`
//     e.target.parentNode.style.width = `${(window.innerHeight - 50) * (e.target.width / e.target.height)}px` 
//     e.target.parentNode.classList.add('pick')
    
//     setTimeout(()=>{
//       const newPos = (window.innerHeight - e.target.offsetHeight) / 2
//       const newLeft = (window.innerWidth - e.target.offsetWidth) / 2
//       // console.log(e.target)
//       e.target.parentNode.style.transform = 'rotate(0deg)'
//       e.target.parentNode.style.top = `${newPos}px`
//       e.target.parentNode.style.left = `${newLeft}px`

//       e.target.parentNode.removeEventListener('click',displayImage)
//       e.target.parentNode.addEventListener('click',hideImage)
//     },500)
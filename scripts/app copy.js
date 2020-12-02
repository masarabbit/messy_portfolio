function init() {


  const body = document.querySelector('body')
  let images = []

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

    // console.log(randomAngle)
    newImage.classList.add('image_thumb')
    newImage.innerHTML = `<img src = "./assets/${object.image}" alt = "${object.image.replace('.jpg','')}">`
    newImage.style.height = `${object.height}px`
    newImage.style.width = `${object.width}px`
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
    console.log('test')
    setUp()
    // },800)
  }



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


  function displayImage(e){
      
    if (!document.querySelector('.pick')){
      console.log('no image') 
    } else {
      const prevImage = document.querySelector('.pick')
      hidePrevImage(prevImage)
    }

    e.target.parentNode.style.height = `${window.innerHeight - 50}px`
    e.target.parentNode.style.width = `${(window.innerHeight - 50) * (e.target.width / e.target.height)}px` 
    
    setTimeout(()=>{
      const newPos = (window.innerHeight - e.target.offsetHeight) / 2
      const newLeft = (window.innerWidth - e.target.offsetWidth) / 2
      // console.log(e.target)
      e.target.parentNode.style.transform = 'rotate(0deg)'
      e.target.parentNode.style.top = `${newPos}px`
      e.target.parentNode.style.left = `${newLeft}px`
      e.target.parentNode.classList.add('pick')

      e.target.parentNode.removeEventListener('click',displayImage)
      e.target.parentNode.addEventListener('click',hideImage)
    },500)
 
  }

  function hideImage(e){

    e.target.parentNode.removeEventListener('click',hideImage)
    e.target.parentNode.addEventListener('click',displayImage)

    const index = images.indexOf(e.target.parentNode)
    
    images[index].style.transform = `rotate(${randomAngles[index]}deg)`
    images[index].style.top = `${randomTopPositions[index]}`
    images[index].style.left = `${randomLeftPositions[index]}`
    images[index].style.height = `${imageArray[index].height}px`
    images[index].style.width = `${imageArray[index].width}px`
    e.target.parentNode.classList.remove('pick')
  }
  

  function hidePrevImage(prevImage){

    prevImage.removeEventListener('click',hideImage)
    prevImage.addEventListener('click',displayImage)

    const index = images.indexOf(prevImage)
    
    prevImage.style.transform = `rotate(${randomAngles[index]}deg)`
    prevImage.style.top = `${randomTopPositions[index]}`
    prevImage.style.left = `${randomLeftPositions[index]}`
    prevImage.style.height = `${imageArray[index].height}px`
    prevImage.style.width = `${imageArray[index].width}px`
    prevImage.classList.remove('pick')
  }

  window.addEventListener('resize', reset)
  
  setUp()
}

window.addEventListener('DOMContentLoaded', init)
import express  from 'express'
const router = express.Router()


router.get("/" , (request , response) => {
    console.log('blog home page');
    
    response.send("blog home page")
})


router.get('/about' , (request , response) =>{
    response.json({message : "Blog home page"})
})


router.get("/:slug" , (request, response) =>{
    response.json({message : "Blog slug page" , data : request.params.slug})
})


export default router
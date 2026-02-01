import express from 'express'
const app = express();

app.use(express.static('public'))   //it is just like middleware

const port = 4000;

app.get('/' , (req, res)=> {
        res.send("hello world");
    
})

app.get('/about', (req, res) => {
    res.send('Welcome to the about page')
})


app.get("/contact" , (req , res) =>{
        res.send("welcome to the contact page")
})


app.get("/blog" , (req, res) => {
    res.send("All blogs are here")
})


app.get('/blog/:slug' , (req, res) => {
    let slug = req.params.slug.replace('-' , ' ')
    console.log(req.params)
    console.log(req.query)
    res.send(`Welcome to the ${slug}`)
})
app.listen(port , () => {
    console.log("this is app is listening on " , port);
    
})
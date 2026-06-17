import express  from "express";
import blogs from './routes/blog.js'

const app = express()
app.use(express.static('public'));

app.use('/blogs', blogs)
app.get("/" , (req, res) => {
    res.sendFile('public/index.html' , {root: __dirname})
        // res.json({message : "Hi welcome to the home route"})
})


app.post('/' , (req, res) => {
    console.log("Hello to the post request on the server side");
    
    res.json({message : "hello post request"})
})


app.put("/add" , (req, res) => {
    res.json({
        data : [1 , 2 , 3],
        message : "Data has been updated"
    })
})

app.listen(4000 , () => {
    console.log("server is running on 4000 port")
})
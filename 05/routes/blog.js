import express from 'express'
const app = express()
const router = express.Router()

// a middleware function with no mount path. This code is executed for every request to the router
router.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})


router.get("/" , (req , res) => {
    res.send("Blog Home Page")
})

export default router
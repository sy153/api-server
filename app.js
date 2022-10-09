// 创建服务器
const express = require('express')
const app = express()
const port = 8080

// 配置cors跨域
const cors = require('cors')
app.use(cors())

// 配置解析表单数据的中间件
app.use(express.urlencoded({extended:false}))

// 导入joi
const joi = require('joi')

// 在路由之前 封装res.cc()
app.use((req,res,next)=>{
    // status = 1 失败
    res.cc = function(err,status = 1){
        // err 可能是错误对象 或者是字符串
        res.send({
            status:status,
            message:err instanceof Error ? err.message : err
        })
    }
    next()
}) 

// 在路由之前配置解析token的包
const expressJWT = require('express-jwt')
const config = require('./config')
app.use(expressJWT({secret:config.jwtSecretKey}).unless({path:[/^\/api/]}))

// 托管静态资源
app.use('/uploads',express.static('./uploads'))

// 导入使用路由 user.js
const userRouter = require('./router/user.js')
app.use('/api',userRouter)

// 导入并使用路由 userinfo.js
const userinfoRouter = require('./router/userinfo')
app.use('/my',userinfoRouter)

// 导入并使用文章分类模块
const artcateRouter = require('./router/artcate')
app.use('/my/article',artcateRouter)

// 导入并使用文章的路由模块
const articleRouter = require('./router/article')
app.use('/my/article',articleRouter)

// 定义错误级别的中间件
app.use((err,req,res,next)=>{
    // joi验证失败
    if(err instanceof joi.ValidationError) return res.cc(err)
    // express-jwt错误
    if(err.name === 'UnauthorizedError') return res.cc('身份认证失败')
    // 其他错误
    res.cc('未知错误')
    next()
})



app.listen(port,()=>{
    console.log('express server running at http://127.0.0.1:8080');
})
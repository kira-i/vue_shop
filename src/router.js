import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'

Vue.use(Router)


const router =  new Router({
    routes: [
        {path: '/', redirect: '/login'},
        {
            path: '/login',
            component: Login
        },
        {path:'/home',component:Home}
    ]
})

router.beforeEach((to,from,next)=>{

    //判断请求路径是否为login,如果不是,则需要判断是否携带token,否==>跳转到登录页面,反之则放行
    if(to.path === '/login') return next()
    const tokenStr = window.sessionStorage.getItem('token');
    if(!tokenStr) return next('/login')
    next()

})

export default router
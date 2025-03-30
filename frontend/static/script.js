import home from './components/home.js'
import login from './components/Login.js'
import register from './components/register.js'
import navbar from './components/navbar.js'
import foot from './components/foot.js'
import admin_navbar from './components/admin_navbar.js'
import user_navbar from './components/user_navbar.js'
import manage_users from './components/manage_users.js'
import adminHome from './components/adminHome.js'
import managesubjects from './components/managesubjects.js'
import managechapters from './components/managechapters.js'
import managequizzes from './components/managequizzes.js'
import managequestion from './components/managequestion.js'
import userHome from './components/userHome.js'
import userScores from './components/userScores.js'
import userSubjects from './components/userSubjects.js'
import userChapters from './components/userChapters.js'
import userQuiz from './components/userQuiz.js'
import attemptQuiz from './components/attemptQuiz.js'

const routes=[
    {path:'/',component:home},
    {path:'/login',component:login},
    {path:'/register',component:register},
    {path:'/admin',component:adminHome},
    {path:'/admin/manage_users',component:manage_users},
    {path:'/admin/manage_subjects',component:managesubjects},
    {path:'/admin/manage_chapters/:subject_id',component:managechapters},
    {path:'/admin/manage_quizzes/:chapter_id',component:managequizzes},
    {path:'/admin/questions/:quiz_id',component:managequestion},
    {path:'/user',component:userHome},
    {path:'/user/subjects',component:userSubjects},
    {path:'/user/subjects/:subject_id/chapters',component:userChapters},
    {path:'/user/chapters/:chapter_id/quizzes',component:userQuiz},
    {path:'/user/quizzes/:quiz_id/attempt',component:attemptQuiz},
    {path:'/user/scores',component:userScores},

]

const router=new VueRouter({
    routes:routes
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = !!sessionStorage.getItem('Authentication_token');
    const userRole = sessionStorage.getItem('User_role');
    if (to.path === '/login' && isLoggedIn) {
        if (userRole === 'admin') {
            next('/admin'); 
        } else {
            next('/user'); 
        }
    } else if (to.path === '/' && isLoggedIn) {
        if (userRole === 'admin') {
            next('/admin');
        } else {
            next('/user');
        }
    } else {
        next(); 
    }
});

const app=new Vue({
    el: '#app',
    router:router,
    template:`
        <div class="container">
        <component :is="currentNavbar" class="navbar"></component>
        <div class="router-wrapper">
            <router-view></router-view>
        </div>
        <footer-bar class="footer"></footer-bar>
    </div>
    `
    ,
    data(){
        return{
            isLoggedIn:false,
            user_role:'',
        };
    },
    computed:{
        currentNavbar(){
            if(this.isLoggedIn){
                if(this.user_role=='admin'){
                    return 'admin_navbar';
                }
                else{
                    return 'user_navbar';
                }
            }
            else{
                return 'navigation-bar';
        }
    }
    },
    methods:{
        logout(){
            fetch('/api/logout',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    'Authentication-token':sessionStorage.getItem('Authentication_token')
                },
            })
            .then(response=>response.json())
            .then(data=>{
                sessionStorage.removeItem('Authentication_token');
                sessionStorage.removeItem('User_id');
                sessionStorage.removeItem('User_role');
                this.isLoggedIn=false;
                this.user_role='';
                this.$router.push('/login')
            })
            this.$forceUpdate();
        },
        checkLoginStatus() {
            const token = sessionStorage.getItem('Authentication_token');
            const role = sessionStorage.getItem('User_role');
            if (token) {
                this.isLoggedIn = true;
                this.user_role = role || '';
            } else {
                this.isLoggedIn = false;
                this.user_role = '';
            }
        },
    },
    mounted() {
            this.checkLoginStatus(); 
    },
    components:{
        'admin_navbar':admin_navbar,
        'user_navbar':user_navbar,
        'navigation-bar':navbar,
        'footer-bar':foot
    },
});
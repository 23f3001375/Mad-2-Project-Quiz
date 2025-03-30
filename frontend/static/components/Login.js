export default {
  template: `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh; background-color:#dfdfdf;">
      <div class="p-4 border rounded" style="background:white;color: black;">
        <h2 class="text-center">Login</h2>
        <form @submit.prevent="loginPerson">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" v-model="LoginData.email" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="LoginData.password" required>
          </div>
          <button type="submit" class="btn btn-dark w-100">Login</button>
        </form>
        <p class="mt-3 text-center">
          Don't have an account? <router-link to="/register" class="text-dark">Register</router-link>
        </p>
      </div>
    </div>
  `,
  data:function(){
    return{
      LoginData:{
        email:'',
        password:'',
      }
    }
  },
  methods:{
    loginPerson:function(){
      fetch('/api/login',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify(this.LoginData)
      })
      .then(response=>{
        if(response.status==403){
          console.log("Your account is blocked")
          sessionStorage.clear()
          throw new Error("You are blocked from using the website")
        }
        else if(response.status==401){
          console.log("Invalid Login")
          sessionStorage.clear()
          throw new Error("Invalid Login")
        }
        return response.json()
      })
      .then(data=>{
        console.log(data)
        if(Object.keys(data).includes("token")){
          sessionStorage.setItem("Authentication_token",data.token)
          sessionStorage.setItem("User_id",data.id)
          sessionStorage.setItem("User_role",data.role)
          this.$root.isLoggedIn=true
          this.$root.user_role=data.role
          this.$forceUpdate();
          if(data.role=='admin'){
            this.$router.replace('/admin')
          }
          else{
            this.$router.replace('/user')
          }
        }
        else{
          throw new Error("Invalid Login")
        }})
        .catch(error=>console.error('Error:',error))
      }
  }
};

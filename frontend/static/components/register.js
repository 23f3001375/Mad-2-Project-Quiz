export default {
    template: `
      <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh; background-color: #dfdfdf;">
        <div class="p-4 border rounded" style="background: white; width: 350px;">
          <h3 class="text-center mb-3">Register</h3>
          <form @submit.prevent="registerPerson">
            <div class="mb-2">
              <label class="form-label">Username</label>
              <input type="text" class="form-control" v-model="RegisterData.username" placeholder="Enter username" required>
            </div>
            <div class="mb-2">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="RegisterData.email" placeholder="Enter email" required>
            </div>
            <div class="mb-2">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" placeholder="Enter password" v-model="RegisterData.password"required>
            </div>
            <div class="mb-3">
              <label class="form-label">Date of Birth</label>
              <input type="date" class="form-control" v-model="RegisterData.dob" required>
            </div>
            <button class="btn btn-dark w-100">Register</button>
          </form>
          <p class="text-center mt-3">
            Already have an account? 
            <router-link to='/login' class="text-dark fw-bold">Login</router-link>
          </p>
        </div>
      </div>
    `,
    data:function(){
      return{
        RegisterData:{
          username:'',
          email:'',
          password:'',
          dob:''
        }
      }
    },
    methods:{
      registerPerson:function(){
        fetch('/api/register',{
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify(this.RegisterData)
        })
        .then(response=>{
          if(response.status==401){
            throw new Error("Account already exists")
          }
          return response.json()
        })
        .then(data=>{
          console.log(data)
          this.$router.push('/login')
        })
        .catch(error=>console.error('Error:',error))
      }
    }
  };
  
export default{
    template:`
    <div class="container">
        <div class="button-wrapper mb-2">
          <button class="btn btn-primary" @click="csvReport">Download CSV</button>
        </div>
        <div class="row">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Users</h5>
              <p class="card-text">{{usersCount}}</p>
            </div>
          </div>
        </div>
        <div class="row">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Subjects</h5>
              <p class="card-text">{{ subjectsCount }}</p>
            </div>
          </div>
        </div>
        <div class="row">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Chapters</h5>
              <p class="card-text">{{ chaptersCount }}</p>
            </div>
          </div>
        </div>
        <div class="row">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Quizzes</h5>
              <p class="card-text">{{ quizCount }}</p>
            </div>
          </div>
        </div>
        <div class="row">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Quiz Attempts</h5>
              <p class="card-text">{{ quizAttemptsCount }}</p>
            </div>
          </div>
        </div>        
    </div>
    `,
    data:function(){
        return{
          usersCount:0,
          subjectsCount:0,
          chaptersCount:0,
          quizCount:0,
          quizAttemptsCount:0,
        }
    },
    created(){
      fetch('/api/admin/home',{
        method:'GET',
        headers:{
          'Content-Type':'application/json',
          'Authentication-token':sessionStorage.getItem("Authentication_token"),
        },
      })
      .then(response=>response.json())
      .then(data=>{
        console.log(data)
        this.usersCount = data.usersCount
        this.subjectsCount = data.subjectsCount
        this.chaptersCount = data.chaptersCount
        this.quizCount = data.quizCount
        this.quizAttemptsCount = data.quizAttemptsCount
      })
      .catch(err=>console.error("Error:",err))
    },
    methods:{
      csvReport(){
        fetch('/api/export',{
          method:'GET',
          headers:{
            'Content-Type':'application/json',
            'Authentication-token':sessionStorage.getItem("Authentication_token"),
          },
        })
        .then(response=>response.json())
        .then(data=>{
          console.log(data)
          window.location.href = `/api/csv_result/${data.id}`
        })
        .catch(err=>console.error("Error:",err))
      },

    }
}

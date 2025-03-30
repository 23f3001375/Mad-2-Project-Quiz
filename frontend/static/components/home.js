export default {
  template: `
    <div style="background-color:#dfdfdf; color:black;">
      <section class="hero text-center py-5" style="background-color:#dfdfdf; color:black;">
        <h1>Challenge Your Knowledge!</h1>
        <p>Take fun and engaging quizzes to test your skills.</p>
        <router-link to='/login' class="btn btn-light me-2">Take a Quiz</router-link>
        <router-link to='/register' class="btn btn-dark">Create an Account</router-link>
      </section>
      <div class="card-body" style="background-color:#dfdfdf; color:black;">
        <h5 class="card-title">Explore Quizzes in various subjects</h5>
        <p class="card-text">Science, Math, Social, Computers... many more</p>
        <router-link to='/register' class="btn btn-dark">Join Today</router-link>
      </div>
      </div>
    </div>
  `
};

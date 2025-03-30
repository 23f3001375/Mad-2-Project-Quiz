export default{
    template:`
    <div class="container">
    <div class="card bar" :class="timerClass">
    <div class="card-body">
        <div class="card-body d-flex justify-content-between">
          <span class="timer">Time Left: {{ formattedTime }}</span>
          <button class="btn btn-dark" @click="submitQuiz">Submit</button>
        </div>
    </div></div>
      <div class="questions-list" style="background-color: #f8f9fa;">
        <div v-for="(question, index) in questionsData" :key="index" class="question-card p-3 mb-3 border rounded">
          <p class="question-text mb-2"><strong>Q{{ index + 1 }}:</strong> {{ question.question }}</p>
            <div class="form-check" v-for="(option, optIndex) in [question.option1, question.option2, question.option3, question.option4]" :key="optIndex">
            <input
              type="radio"
              :name="'question-' + index"
              :value="optIndex+1"
              v-model="userAnswers[question.id]"
              class="form-check-input"/>
            <label class="form-check-label">{{ option }}</label>
          </div>
        </div>
      </div>
    </div>
    `,
    data:function(){
        return{
            questionsData:[],
            userAnswers:{},
            timeLeft:0,
            timer:null
        };
    },
    mounted(){
        this.getQuestions();
        this.startTimer();
    },
    beforeUnmount(){
        clearInterval(this.timer);
    },
    computed: {
      formattedTime() {
          const minutes = Math.floor(this.timeLeft / 60);
          const seconds = this.timeLeft % 60;
          return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      },
      timerClass(){
        if(this.timeLeft<60){
          return "bg-danger text-white";
        }else if(this.timeLeft<300){
          return "bg-warning text-white";
        }else{
          return "bg-light";
        }
      }
    },
    methods:{
        getQuestions(){
            const quizId = this.$route.params.quiz_id;
            fetch(`/api/user/quizzes/${quizId}/attempt`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-token': sessionStorage.getItem('Authentication_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.questionsData =data.questions;
                this.timeLeft = data.duration*60;
            })
            .catch(error => console.error('Error:', error));
        },
        submitQuiz(){
          console.log("clicked")
          console.log(this.userAnswers);
          const quizId = this.$route.params.quiz_id;
          fetch(`/api/user/quizzes/${quizId}/submit`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authentication-token': sessionStorage.getItem('Authentication_token')
              },
              body: JSON.stringify(this.userAnswers)
          })
          .then(response => response.json())
          .then(data => {
              console.log(data);
              this.$router.push('/user/scores');
          })
          .catch(error => console.error('Error:', error));
        },
        startTimer() {
          this.timer = setInterval(() => {
              if (this.timeLeft > 0) {
                  this.timeLeft--;
              } else {
                  clearInterval(this.timer);
                  this.submitQuiz();
              }
          }, 1000);
        },
    },
}
export default{
    template:`
    <div class="container">
      <div class="button-wrapper mb-3">
        <button class="btn btn-dark" @click="showQuestionForm = true">Add Question</button>
      </div>
      <div class="questions-list">
        <div v-for="(question, index) in questionsData" :key="index" class="question-card p-3 mb-3 border rounded">
          <p class="question-text mb-2"><strong>Q{{ index + 1 }}:</strong> {{ question.question }}</p>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">1.{{ question.option1 }}</li>
            <li class="list-group-item">2.{{ question.option2 }}</li>
            <li class="list-group-item">3.{{ question.option3 }}</li>
            <li class="list-group-item">4.{{ question.option4 }}</li>
          </ul>
          <p class="correct-answer mt-2">
            <strong>Correct Answer:</strong> Option {{ question.correctOption }}
            <button class="btn btn-success" @click="openEditForm(question)">Edit</button>
            <button class="btn btn-danger" @click="confirmDelete(question.id)">Delete</button>
          </p>
        </div>
      </div>
      <div v-if="showQuestionForm" class="modal-overlay">
        <div class="modal-content">
          <h3>Add Question</h3>
          <input type="text" v-model="newQuestion.question" class="form-control mb-2" placeholder="Question Text" />
          <input type="text" v-model="newQuestion.option1" class="form-control mb-2" placeholder="Option 1" />
          <input type="text" v-model="newQuestion.option2" class="form-control mb-2" placeholder="Option 2" />
          <input type="text" v-model="newQuestion.option3" class="form-control mb-2" placeholder="Option 3" />
          <input type="text" v-model="newQuestion.option4" class="form-control mb-2" placeholder="Option 4" />
          <input type="number" v-model="newQuestion.correctOption" class="form-control mb-2" placeholder="Correct Option (1-4)" />
          <button class="btn btn-primary mb-2" @click="addQuestion">Submit</button>
          <button class="btn btn-secondary" @click="showQuestionForm = false">Cancel</button>
        </div>
      </div>
    <div v-if="editQuestion" class="modal-overlay">
      <div class="modal-content">
        <h3>Edit Question</h3>
        <input type="text" v-model="editQuestionData.question" class="form-control mb-2" placeholder="Question" />
        <input type="text" v-model="editQuestionData.option1" class="form-control mb-2" placeholder="Option 1"/>
        <input type="text" v-model="editQuestionData.option2" class="form-control mb-2" placeholder="Option 2"/>
        <input type="text" v-model="editQuestionData.option3" class="form-control mb-2" placeholder="Option 3"/>
        <input type="text" v-model="editQuestionData.option4" class="form-control mb-2" placeholder="Option 4"/>
        <input type="number" v-model="editQuestionData.correctOption" class="form-control mb-2" placeholder="Correct Option"/>
        <button class="btn btn-primary mb-2" @click="updateQuestion">Update</button>
        <button class="btn btn-secondary" @click="editQuestion = false">Cancel</button>
      </div>
    </div>
    <div v-if="showDeleteWarning" class="delete-warning-overlay">
    <div class="delete-warning-content">
        <p>Are you sure you want to delete this Question?</p>
        <button class="btn btn-danger" @click="deleteQuestion">Yes, Delete</button>
        <button class="btn btn-secondary" @click="showDeleteWarning = false">Cancel</button>
    </div>
    </div>
    </div>
    `,
    data:function(){
        return{
            showForm:false,
            editQuestion:false,
            questionsData: [],
            showQuestionForm: false,
            showDeleteWarning: false,
            deleteQuestionId:null,
            newQuestion: {
                question: '',
                option1:'',
                option2:'',
                option3:'',
                option4:'',
                correctOption: null,
            },
            editQuestionData: {
                id: null,
                question: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                correctOption: null,
            },
        };
    },
    mounted(){
        this.getQuestions();
    },
    methods:{
        getQuestions(){
            const quizId = this.$route.params.quiz_id;
            fetch(`/api/admin/questions/${quizId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-token': sessionStorage.getItem('Authentication_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.questionsData = data;
            })
            .catch(error => console.error('Error:', error));
        },
        addQuestion(){
            const quizId = this.$route.params.quiz_id;
            fetch(`/api/admin/questions/add/${quizId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-token': sessionStorage.getItem('Authentication_token')
                },
                body: JSON.stringify({
                    question: this.newQuestion.question,
                    option1: this.newQuestion.option1,
                    option2: this.newQuestion.option2,
                    option3: this.newQuestion.option3,
                    option4: this.newQuestion.option4,
                    correctOption: this.newQuestion.correctOption,
                })
            })
            .then(response => response.json())
            .then(data => {
                if(data.success===false){
                    console.log(data.error);
                    return;
                }
                this.questionsData.push({
                    id: data.id,
                    question: data.question,
                    option1: data.option1,
                    option2: data.option2,
                    option3: data.option3,
                    option4: data.option4,
                    correctOption: data.correctOption,
                });
                this.showQuestionForm = false;
                this.newQuestion = {
                    question: '',
                    option1:'',
                    option2:'',
                    option3:'',
                    option4:'',
                    correctOption: null,
                };
            })
            .catch(error => console.error('Error:', error));
        },
        confirmDelete:function(question_id){
            this.deleteQuestionId=question_id
            this.showDeleteWarning=true
        },
        deleteQuestion:function(){
            fetch(`/api/admin/questions/delete/${this.deleteQuestionId}`,{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-token': sessionStorage.getItem("Authentication_token")
                },
            })
            .then(response=>response.json())
            .then(data=>{
                console.log(data)
                if(data.success){
                    this.questionsData = this.questionsData.filter(question => question.id !== this.deleteQuestionId)
                }
                this.showDeleteWarning = false;
                this.deleteQuestionId = null;
            })
            .catch(error=>console.error("Error:",error))
        },
        openEditForm:function(question){
            this.editQuestionData = { ...question };
            this.editQuestion = true;
        },
        updateQuestion:function(){
            fetch(`/api/admin/questions/edit/${this.editQuestionData.id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-token': sessionStorage.getItem("Authentication_token")
                },
                body: JSON.stringify(this.editQuestionData)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                    if(data.success){
                        let index = this.questionsData.findIndex(question => question.id === this.editQuestionData.id);
                        if(index !== -1) {
                            this.questionsData[index] = { ...this.editQuestionData };
                        }
                    }
                    this.editQuestion = false;
                    this.editQuestionData = {
                        id: null,
                        question: '',
                        option1: '',
                        option2: '',
                        option3: '',
                        option4: '',
                        correctOption: null,
                    };
            })
            .catch(error => console.error('Error:', error));
        }
    }
}
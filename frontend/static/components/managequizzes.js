export default {
    template: `
    <div>
    <div class="d-flex justify-content-center">
        <input type="text" class="form-control w-50"placeholder="Search.." v-model="searchQuery" @focus="searchActive=true" />
    </div>
    <div class="button-wrapper">
        <button class="btn btn-dark" @click="showForm=true">Add Quiz</button>
    </div>
    <table class="table table-hover table-striped mt-2">
        <thead>
            <tr>
                <th scope="col">Id</th>
                <th scope="col">Quiz Name</th>
                <th scope="col">Deadline</th>
                <th scope="col">Duration</th>
                <th scope="col">View Quiz</th>
                <th scope="col">Edit Quiz</th>
                <th scope="col">Delete Quiz</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="quiz in filteredQuizzes" :key="quiz.id">
                <td>{{quiz.id}}</td>
                <td>{{quiz.name}}</td>
                <td>{{quiz.date}}</td>
                <td>{{quiz.duration}}</td>
                <td><button class="btn btn-primary" @click="viewQuiz(quiz.id)">View</button></td>
                <td><button class="btn btn-success" @click="openEditForm(quiz)">Edit</button></td>
                <td><button class="btn btn-danger" @click="confirmDelete(quiz.id)">Delete</button></td>
            </tr>
        </tbody>
    </table>
    <div v-if="showForm" class="modal-overlay">
      <div class="modal-content">
        <h3>Add Quiz</h3>
        <input type="text" v-model="addQuizData.quizname" class="form-control mb-2" placeholder="Quiz Title" />
        <input type="date" v-model="addQuizData.quizdate" class="form-control mb-2" placeholder="Quiz date"/>
        <input type="number" v-model="addQuizData.duration" class="form-control mb-2" placeholder="Quiz Duration"/>
        <button class="btn btn-primary mb-2" @click="addQuiz">Submit</button>
        <button class="btn btn-secondary" @click="showForm = false">Cancel</button>
      </div>
    </div>
    <div v-if="editQuiz" class="modal-overlay">
      <div class="modal-content">
        <h3>Edit Subject</h3>
        <input type="text" v-model="editQuizData.name" class="form-control mb-2" placeholder="Quiz Name" />
        <input type="date" v-model="editQuizData.date" class="form-control mb-2" placeholder="Quiz Date"/>
        <input type="number" v-model="editQuizData.duration" class="form-control mb-2" placeholder="Quiz Duration"/>
        <button class="btn btn-primary mb-2" @click="updateQuiz">Update</button>
        <button class="btn btn-secondary" @click="editQuiz = false">Cancel</button>
      </div>
    </div>
    <div v-if="showDeleteWarning" class="delete-warning-overlay">
    <div class="delete-warning-content">
        <p>Are you sure you want to delete this subject?</p>
        <button class="btn btn-danger" @click="deleteQuiz">Yes, Delete</button>
        <button class="btn btn-secondary" @click="showDeleteWarning = false">Cancel</button>
    </div>
    </div>
    </div>
    `,
    data:function(){
        return{
            showForm:false,
            editQuiz:false,
            showDeleteWarning:false,
            deleteQuizId:null,
            addQuizData:{
                quizname:'',
                quizdate:'',
                duration:'',
            },
            quizzesData:{
                quizzes:[]
            },
            editQuizData:{
                id:null,
                name:'',
                date:'',
                duration:'',
            },
            searchQuery:'',
            searchActive:false,
        }
    },
    methods:{
        addQuiz:function(){
            const chapterId=this.$route.params.chapter_id
            if(!this.addQuizData.quizname || !this.addQuizData.quizdate || !this.addQuizData.duration){
                console.log("Both fields are needed")
                return;
            }
            fetch('/api/admin/manage_quizzes/addquiz', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-token': sessionStorage.getItem("Authentication_token")
                },
                body: JSON.stringify({
                    quizname: this.addQuizData.quizname,
                    quizdate: this.addQuizData.quizdate,
                    quizduration: this.addQuizData.duration,
                    chapterId: chapterId
                    })
                })
              .then(response =>{
                    if(!response.ok){
                        console.log("Transaction Failed")
                        throw new Error("Error Occureed")
                    }
                    return response.json()
                })
              .then(data=>{
                    console.log(data)
                    if(data.success){
                        this.quizzesData.quizzes.push({
                            id:data.id,
                            name: data.name,
                            duration: data.duration,
                            date: data.date,
                        })
                    }
                    this.showForm = false;
              })
              .catch(error=>console.error("Err:",error))
        },
        confirmDelete:function(quiz_id){
            this.deleteQuizId=quiz_id
            this.showDeleteWarning=true
        },
        deleteQuiz:function(){
            console.log("Deleting quiz with ID:", this.deleteQuizId);
            fetch(`/api/admin/manage_quizzes/deletequiz/${this.deleteQuizId}`,{
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
                    this.quizzesData.quizzes = this.quizzesData.quizzes.filter(quiz=>quiz.id !== this.deleteQuizId)
                    this.$forceUpdate()
                }
                this.showDeleteWarning = false;
                this.deleteQuizId = null;
            })
            .catch(error=>console.error("Error:",error))
        },
        openEditForm:function(quiz){
            this.editQuizData = { ...quiz };
            this.editQuiz = true;
        },
        updateQuiz:function(){
            fetch(`/api/admin/manage_quizzes/editquiz/${this.editQuizData.id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-token': sessionStorage.getItem("Authentication_token")
                },
                body: JSON.stringify(this.editQuizData)
              })
              .then(response => response.json())
              .then(data => {
                console.log(data)
                    if(data.success){
                        let index = this.quizzesData.quizzes.findIndex(quiz =>quiz.id === this.editQuizData.id);
                        if(index !== -1) {
                            this.quizzesData.quizzes[index] = { ...this.editQuizData };
                        }
                    }
                    this.editQuiz = false;
              })
              .catch(error => console.error("Error:", error));
        },
        viewQuiz:function(quiz_id){
            this.$router.push(`/admin/questions/${quiz_id}`)
        }
    },
    mounted(){
        const chapterId=this.$route.params.chapter_id
        fetch(`/api/admin/manage_quizzes/${chapterId}`,{
            method:'GET',
            headers:{
                    'Content-Type':'application/json',
                    'Authentication-token':sessionStorage.getItem("Authentication_token"),
            },
        })
        .then(response=>{
            console.log(response)
            if(!response.ok){
                throw new Error("Loading Failed")
            }
            return response.json()})
        .then(data=>{
            console.log(data)
            this.quizzesData={
                quizzes:data.quizzes,
            }
        })
        .catch(err=>console.error("Err:",err))
    },
    computed:{
        filteredQuizzes:function(){
            if(!this.searchQuery){
                return this.quizzesData.quizzes;
            }
            return this.quizzesData.quizzes.filter(quiz=>{
                return quiz.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            })
        }
    }
}
  
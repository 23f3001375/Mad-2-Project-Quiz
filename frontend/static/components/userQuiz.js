export default{
    template:`
    <div>
    <div class="d-flex justify-content-center">
        <input type="text" class="form-control w-50"placeholder="Search.." v-model="searchQuery" @focus="searchActive=true" />
    </div>
        <table class="table table-hover table-striped mt-2">
        <thead>
            <tr>
                <th scope="col">Id</th>
                <th scope="col">Quiz Name</th>
                <th scope="col">Quiz Start Date</th>
                <th scope="col">Duration(mins)</th>
                <th scope="col">Attempt</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="quiz in filteredQuizzes" :key="quiz.id">
                <td>{{quiz.id}}</td>
                <td>{{quiz.name}}</td>
                <td>{{quiz.date}}</td>
                <td>{{quiz.duration}}</td>
                <td><button class="btn btn-primary" @click="attemptQuiz(quiz.id)">Attempt</button></td>
            </tr>
        </tbody>
    </table>
    </div>
    `,
    data:function(){
        return{
            quizzesData:{
                quizzes:[],
                chapter_name:'',
            },
            searchQuery:'',
            searchActive:false,
        };
    },
    mounted(){
        this.getQuizzes();
    },
    methods:{
        getQuizzes(){
            const chapterId = this.$route.params.chapter_id;
            fetch(`/api/user/chapters/${chapterId}/quizzes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-token': sessionStorage.getItem('Authentication_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.quizzesData={
                    quizzes:data.quizzes,
                    chapter_name:data.chapter_name,
                };
            })
            .catch(error => console.error('Error:', error));
        },
        attemptQuiz(quizId){
            this.$router.push(`/user/quizzes/${quizId}/attempt`);
        },
    },
    computed:{
        filteredQuizzes(){
            if(!this.searchQuery){
                return this.quizzesData.quizzes;
            }
            return this.quizzesData.quizzes.filter(quiz => {
                return quiz.name.toLowerCase().includes(this.searchQuery.toLowerCase());
            });
        }
    }
}
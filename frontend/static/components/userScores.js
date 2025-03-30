export default{
    template:`
    <div class="container">
        <table class="table table-hover table-striped mt-2">
        <thead>
            <tr>
                <th scope="col">Id</th>
                <th scope="col">Quiz Name</th>
                <th scope="col">Score</th>
                <th scope="col">Total Questions</th>
                <th scope="col">Date of Attempt</th>
            </tr>
        </thead>
        <tbody>
        <tr v-for="scores in Scores.scoresData" :key="scores.score_id">
            <td>{{scores.quiz_id}}</td>
            <td>{{scores.quiz_name}}</td>
            <td>{{scores.score}}/{{scores.totalScore}}</td>
            <td>{{scores.questions}}</td>
            <td>{{scores.time}}</td>
        </tr>
        </tbody>
    </table>
    </div>
    `,
    data:function(){
        return{
            Scores:{
                scoresData:[]
            },
            total_questions:0
        }
    },
    mounted(){
        this.getUserScores();
    },
    methods:{
        getUserScores(){
            fetch('/api/user/scores',{
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authentication-token':sessionStorage.getItem('Authentication_token')
                }
            })
            .then(response=>response.json())
            .then(data=>{
                console.log(data);
                this.Scores.scoresData = data;
            })
            .catch(error=>console.error('Error:',error));
        }
    }
}
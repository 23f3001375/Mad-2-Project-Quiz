export default{
    template:`
    <div class="container">
      <h3>Welcome, {{username}}</h3>
      <h3>Quiz Summary</h3>
      <canvas id="quizChart" width="500" height="150"></canvas>
    </div>
    `,
    data(){
        return {
            username:'',
            quizData:[],
            quizChart:null,
        }
    },
    created(){
        this.fetchUserData();
        this.fetchQuizData();
    },
    methods:{
        fetchUserData:function(){
            fetch('/api/user',{
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authentication-token':sessionStorage.getItem("Authentication_token"),
                },
            })
            .then(response=>response.json())
            .then(data=>{
                this.username = data.username
            })
            .catch(err=>console.error("Error:",err))
        },
        fetchQuizData:function(){
            fetch('/api/user/summary',{
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authentication-token':sessionStorage.getItem("Authentication_token"),
                },
            })
            .then(response=>response.json())
            .then(data=>{
                this.quizData = data
                this.renderChart()
            })
            .catch(err=>console.error("Error:",err))
        },
        renderChart:function(){
            const ctx = document.getElementById('quizChart').getContext('2d');
            const labels = this.quizData.map(quiz => quiz.quiz_name);
            const scores = this.quizData.map(quiz => quiz.percentage);
            if(this.quizChart){
                this.quizChart.destroy();
            }
            this.quizChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Quiz Scores',
                        data: scores,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            min: 0,
                            max: 100,
                            ticks: {
                                stepSize: 10,
                            },
                            title: {
                                display: true,
                                text: 'Percentage'
                            },
                            beginAtZero: true
                        },
                        x:{
                            title: {
                                display: true,
                                text: 'Quiz Name'
                            }
                        }
                    }
                }
            });
        },
    }
}
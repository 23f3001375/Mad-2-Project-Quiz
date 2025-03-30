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
                <th scope="col">Chapter Name</th>
                <th scope="col">Description</th>
                <th scope="col">View Quizzes</th>
            </tr>
        </thead>
        <tbody>
        <tr v-for="chapter in filteredChapters" :key="chapter.chapter_id">
            <td>{{chapter.chapter_id}}</td>
            <td>{{chapter.chapter_name}}</td>
            <td>{{chapter.desc}}</td>
            <td><button class="btn btn-primary" @click="viewQuizzes(chapter.chapter_id)">View</button></td>
        </tr>
        </tbody>
    </table>
    </div>
    `,
    data:function(){
        return{
            chaptersData:{
                chapters:[],
                subject_name:'',
            },
            searchQuery:'',
            searchActive:false,
        };
    },
    mounted(){
        this.getChapters();
    },
    methods:{
        getChapters(){
            const subjectId = this.$route.params.subject_id;
            fetch(`/api/user/subjects/${subjectId}/chapters`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-token': sessionStorage.getItem('Authentication_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.chaptersData={
                    chapters:data.chapters,
                    subject_name:data.subject_name,
                };
            })
            .catch(error => console.error('Error:', error));
        },
        viewQuizzes(chapterId){
            this.$router.push(`/user/chapters/${chapterId}/quizzes`);
        },
    },
    computed:{
        filteredChapters(){
            if(!this.searchQuery){
                return this.chaptersData.chapters;
            }
            return this.chaptersData.chapters.filter(chapter=>{
                return chapter.chapter_name.toLowerCase().includes(this.searchQuery.toLowerCase());
            });
        }
    }
}
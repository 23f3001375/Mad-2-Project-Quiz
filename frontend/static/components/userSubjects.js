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
                <th scope="col">Subject Name</th>
                <th scope="col">Description</th>
                <th scope="col">View Chapters</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="subject in filteredSubjects" :key="subject.id">
                <td>{{subject.id}}</td>
                <td>{{subject.name}}</td>
                <td>{{subject.desc}}
                <td><button class="btn btn-primary" @click="viewChapters(subject.id)">View</button></td>
            </tr>
        </tbody>
    </table>
    </div>
    `,
    data:function(){
        return{
            SubjectsData: {
                subjects:[],
            },
            searchQuery:'',
            searchActive:false,
        };
    },
    mounted(){
        this.getSubjects();
    },
    methods:{
        getSubjects(){
            fetch(`/api/user/subjects`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-token': sessionStorage.getItem('Authentication_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.SubjectsData.subjects = data;
            })
            .catch(error => console.error('Error:', error));
        },
        viewChapters(subjectId){
            this.$router.push(`/user/subjects/${subjectId}/chapters`);
        },
    },
    computed:{
        filteredSubjects(){
            if(!this.searchQuery){
                return this.SubjectsData.subjects;
            }
            return this.SubjectsData.subjects.filter(subject => {
                return subject.name.toLowerCase().includes(this.searchQuery.toLowerCase());
            });
        }
    }
}
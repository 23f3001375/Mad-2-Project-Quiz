export default{
    template:`
    <div>
    <div class="card w-25 mb-2">
        <div class="card-header" style="background-color:#bec7cc;text-align:center">
            <h6>Subject Name: {{this.chaptersData.subjectName}}</h6>
        </div>
    </div>
    <div class="d-flex justify-content-center">
        <input type="text" class="form-control w-50"placeholder="Search.." v-model="searchQuery" @focus="searchActive=true" />
    </div>
    <div class="button-wrapper">
        <button class="btn btn-dark" @click="showForm=true">Add Chapters</button>
    </div>
        <table class="table table-hover table-striped mt-2">
        <thead>
            <tr>
                <th scope="col">Id</th>
                <th scope="col">Chapter Name</th>
                <th scope="col">Description</th>
                <th scope="col">View Quizzes</th>
                <th scope="col">Edit Chapter</th>
                <th scope="col">Delete Chapter</th>
            </tr>
        </thead>
        <tbody>
        <tr v-for="chapter in filteredChapters" :key="chapter.chapter_id">
            <td>{{chapter.chapter_id}}</td>
            <td>{{chapter.chapter_name}}</td>
            <td>{{chapter.desc}}</td>
            <td><button class="btn btn-primary" @click="viewQuizzes(chapter.chapter_id)">View</button></td>
            <td><button class="btn btn-success" @click="openEditForm(chapter)">Edit</button></td>
            <td><button class="btn btn-danger" @click="confirmDelete(chapter.chapter_id)">Delete</button></td>
        </tr>
        </tbody>
    </table>
    <div v-if="showForm" class="modal-overlay">
      <div class="modal-content">
        <h3>Add Chapter</h3>
        <input type="text" v-model="addChapterData.chaptername" class="form-control mb-2" placeholder="Chapter Name" />
        <input type="text" v-model="addChapterData.chapterdesc" class="form-control mb-2" placeholder="Chapter Description"/>
        <button class="btn btn-primary mb-2" @click="addChapter">Submit</button>
        <button class="btn btn-secondary" @click="showForm = false">Cancel</button>
      </div>
    </div>
    <div v-if="editChapter" class="modal-overlay">
      <div class="modal-content">
        <h3>Edit Chapter</h3>
        <input type="text" v-model="editChapterData.name" class="form-control mb-2" placeholder="Chapter Name" />
        <input type="text" v-model="editChapterData.desc" class="form-control mb-2" placeholder="Chapter Description"/>
        <button class="btn btn-primary mb-2" @click="updateChapter">Update</button>
        <button class="btn btn-secondary" @click="editChapter = false">Cancel</button>
      </div>
    </div>
    <div v-if="showDeleteWarning" class="delete-warning-overlay">
    <div class="delete-warning-content">
        <p>Are you sure you want to delete this subject?</p>
        <button class="btn btn-danger" @click="deleteChapter">Yes, Delete</button>
        <button class="btn btn-secondary" @click="showDeleteWarning = false">Cancel</button>
    </div>
    </div>
    </div>
    `,
    data:function(){
        return{
            showForm:false,
            editChapter:false,
            showDeleteWarning:false,
            deleteChapterId:null,
            chaptersData:{
                chapters:[],
                subjectName:'',
            },
            addChapterData:{
                chaptername:'',
                chapterdesc:'',
            },
            editChapterData:{
                id:null,
                name:'',
                desc:''
            },
            searchQuery:'',
            searchActive:false,
        }
    },
    mounted(){
        const subjectId=this.$route.params.subject_id
        fetch(`/api/admin/manage_chapters/${subjectId}`,{
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authentication-token':sessionStorage.getItem("Authentication_token"),
            },
        })
        .then(response=>response.json())
        .then(data=>{
            console.log(data)
            this.chaptersData={
                chapters:data.chapters,
                subjectName:data.subject_name,
            }
        })
    },
    methods:{
        addChapter:function(){
            const subjectId=this.$route.params.subject_id
            if(!this.addChapterData.chaptername || !this.addChapterData.chapterdesc){
                console.log("Both fields are needed")
                return;
            }
            fetch('/api/admin/manage_chapters/addchapter', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-token': sessionStorage.getItem("Authentication_token")
                },
                body: JSON.stringify({
                    chaptername: this.addChapterData.chaptername,
                    chapterdesc: this.addChapterData.chapterdesc,
                    subjectId: subjectId
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
                        this.chaptersData.chapters.push({
                            chapter_id:data.chapter_id,
                            chapter_name: data.chapter_name,
                            desc: data.desc,
                        })
                    }
                    this.showForm = false;
              })
              .catch(error=>console.error("Err:",error))
        },
        confirmDelete:function(chapter_id){
            this.deleteChapterId=chapter_id
            this.showDeleteWarning=true
        },
        deleteChapter:function(){
            fetch(`/api/admin/manage_chapters/deletechapter/${this.deleteChapterId}`,{
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
                    this.chaptersData.chapters = this.chaptersData.chapters.filter(chapter =>chapter.chapter_id !== this.deleteChapterId)
                }
                this.showDeleteWarning = false;
                this.deleteChapterId = null;
            })
            .catch(error=>console.error("Error:",error))
        },
        openEditForm:function(chapter){
            this.editChapterData = { ...chapter };
            this.editChapter = true;
        },
        updateChapter:function(){
            fetch(`/api/admin/manage_chapters/editchapter/${this.editChapterData.chapter_id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-token': sessionStorage.getItem("Authentication_token")
                },
                body: JSON.stringify(this.editChapterData)
              })
              .then(response => response.json())
              .then(data => {
                console.log(data)
                    if(data.success){
                        let index = this.chaptersData.chapters.findIndex(chapter => chapter.id === this.editChapterData.id);
                        if(index !== -1) {
                            this.chaptersData.chapters[index] = { ...this.editChapterData };
                        }
                    }
                    this.editChapter = false;
              })
              .catch(error => console.error("Error:", error));
        },
        viewQuizzes:function(chapter_id){
            this.$router.push(`/admin/manage_quizzes/${chapter_id}`)
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
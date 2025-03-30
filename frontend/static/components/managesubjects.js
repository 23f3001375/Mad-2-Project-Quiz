export default {
    template: `
    <div>
    <div class="d-flex justify-content-center">
        <input type="text" class="form-control w-50"placeholder="Search.." v-model="searchQuery" @focus="searchActive=true" />
    </div>
    <div class="button-wrapper">
        <button class="btn btn-dark" @click="showForm=true">Add Subject</button>
    </div>
    <table class="table table-hover table-striped mt-2">
        <thead>
            <tr>
                <th scope="col">Id</th>
                <th scope="col">Subject Name</th>
                <th scope="col">Description</th>
                <th scope="col">View Chapters</th>
                <th scope="col">Edit Subject</th>
                <th scope="col">Delete Subject</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="subject in filteredSubjects" :key="subject.id">
                <td>{{subject.id}}</td>
                <td>{{subject.name}}</td>
                <td>{{subject.desc}}
                <td><button class="btn btn-primary" @click="viewChapters(subject.id)">View</button></td>
                <td><button class="btn btn-success" @click="openEditForm(subject)">Edit</button></td>
                <td><button class="btn btn-danger" @click="confirmDelete(subject.id)">Delete</button></td>
            </tr>
        </tbody>
    </table>
    <div v-if="showForm" class="modal-overlay">
      <div class="modal-content">
        <h3>Add Subject</h3>
        <input type="text" v-model="addSubjectData.subjectname" class="form-control mb-2" placeholder="Subject Name" />
        <input type="text" v-model="addSubjectData.subjectDesc" class="form-control mb-2" placeholder="Subject Description"/>
        <button class="btn btn-primary mb-2" @click="addSubject">Submit</button>
        <button class="btn btn-secondary" @click="showForm = false">Cancel</button>
      </div>
    </div>
    <div v-if="editSubject" class="modal-overlay">
      <div class="modal-content">
        <h3>Edit Subject</h3>
        <input type="text" v-model="editSubjectData.name" class="form-control mb-2" placeholder="Subject Name" />
        <input type="text" v-model="editSubjectData.desc" class="form-control mb-2" placeholder="Subject Description"/>
        <button class="btn btn-primary mb-2" @click="updateSubject">Update</button>
        <button class="btn btn-secondary" @click="editSubject = false">Cancel</button>
      </div>
    </div>
    <div v-if="showDeleteWarning" class="delete-warning-overlay">
    <div class="delete-warning-content">
        <p>Are you sure you want to delete this subject?</p>
        <button class="btn btn-danger" @click="deleteSubject">Yes, Delete</button>
        <button class="btn btn-secondary" @click="showDeleteWarning = false">Cancel</button>
    </div>
    </div>
    </div>
    `,
    data:function(){
        return{
            showForm:false,
            editSubject:false,
            showDeleteWarning:false,
            deleteSubjectId:null,
            addSubjectData:{
                subjectname:'',
                subjectDesc:'',
            },
            SubjectsData:{
                subjects:[]
            },
            editSubjectData: {
                id: null,
                name: '',
                desc: ''
            },
            searchQuery:'',
            searchActive:false,
        }
    },
    methods:{
        addSubject:function(){
            if(!this.addSubjectData.subjectname || !this.addSubjectData.subjectDesc){
                console.log("Both fields are needed")
                return;
            }
            fetch('/api/admin/manage_subjects/addsubject', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-token': sessionStorage.getItem("Authentication_token")
                },
                body: JSON.stringify(this.addSubjectData)
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
                        this.SubjectsData.subjects.push({
                            id:data.id,
                            name: data.name,
                            desc: data.desc,
                        })
                    }
                    this.showForm = false;
              })
              .catch(error=>console.error("Err:",error))
        },
        confirmDelete:function(subject_id){
            this.deleteSubjectId=subject_id
            this.showDeleteWarning=true
        },
        deleteSubject:function(){
            fetch(`/api/admin/manage_subjects/deletesubject/${this.deleteSubjectId}`,{
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
                    this.SubjectsData.subjects = this.SubjectsData.subjects.filter(subject => subject.id !== this.deleteSubjectId)
                }
                this.showDeleteWarning = false;
                this.deleteSubjectId = null;
            })
            .catch(error=>console.error("Error:",error))
        },
        openEditForm:function(subject){
            this.editSubjectData = { ...subject };
            this.editSubject = true;
        },
        updateSubject:function(){
            fetch(`/api/admin/manage_subjects/editsubject/${this.editSubjectData.id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-token': sessionStorage.getItem("Authentication_token")
                },
                body: JSON.stringify(this.editSubjectData)
              })
              .then(response => response.json())
              .then(data => {
                console.log(data)
                    if(data.success){
                        let index = this.SubjectsData.subjects.findIndex(subject => subject.id === this.editSubjectData.id);
                        if(index !== -1) {
                            this.SubjectsData.subjects[index] = { ...this.editSubjectData };
                        }
                    }
                    this.editSubject = false;
              })
              .catch(error => console.error("Error:", error));
        },
        viewChapters:function(subject_id){
            this.$router.push(`/admin/manage_chapters/${subject_id}`)
        }
    },
    mounted(){
        fetch('/api/admin/manage_subjects',{
            method:'GET',
            headers:{
                    'Content-Type':'application/json',
                    'Authentication-token':sessionStorage.getItem("Authentication_token"),
            },
        })
        .then(response=>response.json())
        .then(data=>{
            console.log(data)
            this.SubjectsData.subjects=data
        })
        .catch(err=>console.error("Err:",err))
    },
    computed:{
        filteredSubjects:function(){
            if(!this.searchQuery){
                return this.SubjectsData.subjects;
            }
            return this.SubjectsData.subjects.filter(subject=>{
                return subject.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            })
        }
    }
}
  
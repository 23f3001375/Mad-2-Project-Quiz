export default{
    template:`
    <div>
    <div class="d-flex justify-content-center">
        <input type="text" class="form-control w-50"placeholder="Search.." v-model="searchQuery" @focus="searchActive=true" />
    </div>
    <table class="table table-striped">
        <thead>
            <tr>
                <th scope="col">User-Id</th>
                <th scope="col">Username</th>
                <th scope="col">Email</th>
                <th scope="col">DOB</th>
                <th scope="col">Active</th>
            </tr>
    </thead>
    <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{user.id}}</td>
            <td>{{user.username}}</td>
            <td>{{user.email}}</td>
            <td>{{user.dob}}</td>
            <td><button 
            :class="user.active ? 'btn btn-danger' : 'btn btn-success' " 
            type="submit" @click="userStatus(user.id,!user.active)">
                {{user.active? 'Block' : 'Unblock' }}
                </button>
            </td>
        </tr>
    </tbody>
    </table>
    </div>
    `,
    data:function(){
        return{
            UsersData:{
                users:[]
            },
            searchQuery:'',
            searchActive:false
        }
    },
    mounted(){
        fetch('/api/admin/manage_users',{
            method:'GET',
            headers:{
                    'Content-Type':'application/json',
                    'Authentication-token':sessionStorage.getItem("Authentication_token"),
            },
        })
        .then(response=>response.json())
        .then(data=>{
            console.log(data)
            this.UsersData.users=data
        })
        .catch(err=>console.error("Err:",err))
    },
    methods:{
        userStatus:function(user_id,new_status){
            fetch(`/api/admin/manage_users/changestatus/${user_id}`,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    'Authentication-token':sessionStorage.getItem("Authentication_token")
                },
                body:JSON.stringify({active:new_status})
            })
            .then(response=>response.json())
            .then(data=>{
                console.log(data)
                const user=this.UsersData.users.find(u=>u.id===user_id)
                if(user){
                    user.active=new_status
                }
            })
            .catch(err=>console.error("Error:",err))
        }
    },
    computed: {
        filteredUsers: function() {
            const query = this.searchQuery.toLowerCase();
            return this.UsersData.users.filter(user => {
                return (
                    user.username.toLowerCase().includes(query) ||
                    user.id.toString().includes(this.searchQuery)
                );
            });
        }
    }
}

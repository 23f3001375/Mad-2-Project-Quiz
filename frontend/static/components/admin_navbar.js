export default {
    template: `
    <nav class="navbar navbar-expand-lg" style="background-color:#222222; width: 100%;">
        <div class="container-fluid">
          <a class="navbar-brand text-white fw-bold" href="#">Quiz-Admin</a>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <router-link to="/admin" class="nav-link text-white">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/admin/manage_users" class="nav-link text-white">Manage Users</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/admin/manage_subjects" class="nav-link text-white">Manage Subjects</router-link>
              </li>
              <li class="nav-item">
                    <a class="nav-link text-danger" href="#" @click="logout">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    `,
    methods: {
        logout() {
            this.$root.logout();
        }
    }
};

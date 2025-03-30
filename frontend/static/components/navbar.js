export default {
  template: `
    <nav class="navbar navbar-expand-lg" style="background-color:#222222; width: 100%;">
      <div class="container-fluid">
        <a class="navbar-brand text-white fw-bold" href="#">Quiz Masters</a>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link text-white">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/login" class="nav-link text-white">Login</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/register" class="nav-link text-white">Register</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `
};

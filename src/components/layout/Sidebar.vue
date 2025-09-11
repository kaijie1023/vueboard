<script></script>

<template>
  <aside class="sidebar">
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  background: var(--c-sidebar-bg);
  color: var(--c-sidebar-text);
  padding: 1rem;
  grid-area: side-nav;
}
nav ul {
  list-style: none;
  padding: 0;
}
nav li {
  margin: 0.5rem 0;
}
nav a {
  color: inherit;
  text-decoration: none;
}
nav a:hover {
  text-decoration: underline;
}
</style>

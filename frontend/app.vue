<style lang="scss">

body {
  background-color: lightyellow;
  margin:0;
  padding: 0 20px;
  font-family: Georgia, Verdana, Geneva, Tahoma, sans-serif;
  font-size: 16pt;
}


a {
  text-decoration: none;
  &:hover {
    color: green;
  }
}

h2 {
  font-size: 150%;
  color: darkslateblue;
}

header {
  margin: 1em 1em 1em;
  border-bottom: darkgreen 2px solid;

  color: darkslateblue;

  img {
    margin-bottom: 1ex;
    vertical-align: top;
  }

  h1 {
    font-size: 250%;
    margin: 0em;
  }

  nav {
    float: right;
    margin-right: 20px;
    font-size: 120%;
    font-weight: bold;
    
    ul {
      margin: 0;
    }

    li {
      display: inline-block;
    }
    a {
      padding: 1em;
    }
  }
}


</style>

<template>
  <div id="top">
  <header>
    <nav>
      <ul>
        <li><NuxtLink to="/">Table</NuxtLink></li>
        <li><NuxtLink to="/clear">Clear</NuxtLink></li>
        <li><NuxtLink to="/about">About</NuxtLink></li>
      </ul>
    </nav>
    
    
    <h1><NuxtLink to="/"><img src="/img/netid.png" alt=""> NetID</NuxtLink></h1>

  </header>

  <main>
    <NuxtPage />
  </main>

  </div>
</template>




<template>
  <h2>Clear</h2>
    <p>
      <span v-if="ok">Token:</span>
      <span v-else>Bad token!!! Correct:</span>
      <input v-model="token" @keydown.enter="postdata" placeholder="token" type="password" />
    </p>
    <p>
      <button  @click.prevent="postdata" >Clear all IDs!</button>
    </p>
</template>

<script setup>
  const token = ref('')
  const ok = ref(true)

 async function postdata() {
    const { data: data} = await useFetch(
      "http://localhost:54321/api/clear", {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      method: 'POST',
      body: {
        token: token.value
      }
    })

    if (data.value.success) {
      return navigateTo('/')
    } else {
      ok.value = false
      token.value = ''
    }

  }
</script>

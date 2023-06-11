<script>
export default {
  data() {
    return {
      message: ''
    }
  }
}
</script>

<template>
  <h2>Pokus</h2>
  <p>Message is: {{ message }}</p>
	<input v-model="message" placeholder="edit me" />
</template>

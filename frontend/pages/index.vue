<template><div>

  <div id="refresh">
    <button :disabled="refreshing" @click="refreshAll">Refetch</button>
  </div>

  <h2>Table of nics</h2>

    <table>
      <thead>
        <th>Nick <input v-model="nick" type="text" placeholder="filter"></th>
        <th>Addreses <input v-model="address" type="text" placeholder="filter"></th>
        <th>Age</th>
        <th>Create</th>
      </thead>
      <tr v-for="(item, key) in data" :key="key">
        <td>{{ key }}</td>
        <td>
          <ul v-for="address in item['addresses']" :key="address">
            <li>{{ address }}</li>
          </ul>
        </td>
        <td>
          <span style="color:#777">{{ item["atime"]  }}</span><br />
          {{ timeview(item["atime_diff"]) }}
        </td>
        <td>
          <span style="color:#777">{{ item["ctime"]  }}</span><br />
          {{ timeview(item["ctime_diff"]) }}
        </td>
      </tr>
    </table>

{{nick}} {{address}}

</div></template>

<script setup>
// data
const { data: data } = await useFetch('http://localhost:54321/status')
  
</script>


<script>

export default {
  data() {
    return {
      nick: '',
      address: '',
    }
  }
}

// refreshing
const refreshing = ref(false)
const refreshAll = async () => {
  refreshing.value = true
  try {
    await refreshNuxtData()
  }
  finally {
    refreshing.value = false
  }
}

setInterval(refreshAll, 7777);

function filtred() {
  return data;
}


// time view 
function timeview(seconds) {
  var days, hours, minutes

  days =  parseInt(seconds / 24 / 60 / 60)
  seconds %=  24*60*60
  hours =  parseInt(seconds / 60 / 60)
  seconds %=  60*60
  minutes =  parseInt(seconds / 60)
  seconds %=  60
  
  var time = '';
  var print_sec = true;
  var print_min = true;
  if (days) {
    time += days + ' days';
    print_min = false;
    print_sec = false;
  }
  if (hours) {
    time += ' ' + hours + ' hours';
    print_sec = false;
  }
  if (minutes && print_min) {
    time += ' ' + minutes + ' minutes';
  }
  if (print_sec) {
    time += ' ' + seconds + ' seconds';
  }
  return time
}

</script>


<style lang="scss">

#refresh {
  float: right;
  button {
    font-size: 16pt;
  }
}

table {
  border-collapse: collapse;
  width: 100%;

  th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: #04AA6D;
    color: white;
  }

  td, th {
    border: 1px solid #ddd;
    padding: 8px;
  }

  tr:nth-child(even){background-color: #f2f2f2;}
  tr:hover {background-color: #ddd;}

}


</style>

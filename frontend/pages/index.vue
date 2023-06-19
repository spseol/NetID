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
    
    a {
      color: white;
      &:hover {
        color: darkslateblue;
      }
    }
    a.active {
      color: yellow;
    }
    
  }

  td, th {
    border: 1px solid #ddd;
    padding: 8px;
  }

  tr:nth-child(even){background-color: #f2f2f2;}
  tr:hover {background-color: #ADC;}

}

</style>


<template><div>

  <div id="refresh">
    <button :disabled="refreshing" @click="refreshClick">Refetch</button>
  </div>

  <h2>Table of nicks
    <img v-if="loadedData.pending.value" src="/img/load.gif"  style="height: 0.88em;"/>
  </h2>


    <div v-if="err">
      <h3>Data se nepodařilo načíst! Sorry</h3>
      <p> {{ loadedData.error }} </p>
      <img src="/img/error.jpg" alt="Sorry Error" style="width:100%">
    </div>

    <table v-else>
      <thead>
        <tr>
          <th>
            <a href="#" id="nick_down" :class="[sorting,{active: sorting.nick_down}]"
              @click.prevent="chsort">🠛</a>
            <a href="#" id="nick_up" :class="[sorting,{active: sorting.nick_up}]"
              @click.prevent="chsort">🠙</a>
          <a href="#" @click.prevent="swsort('nick')">Nick </a> 
          <input v-model="nick" type="text" placeholder="filter">
        </th>
        <th>
          ID
        </th>
        <th>
          <a href="#" id="addr_down" :class="{active: sorting.addr_down}"
             @click.prevent="chsort"> 🠛 </a>
          <a href="#" id="addr_up" :class="{active: sorting.addr_up}"
             @click.prevent="chsort"> 🠙 </a>
          <a href="#" @click.prevent="swsort('addr')">Addresses </a>
          <input v-model="address" type="text" placeholder="filter">
        </th>
        <th>
          <a href="#" id="age_down" :class="{active: sorting.age_down}"
             @click.prevent="chsort"> 🠛 </a>
          <a href="#" id="age_up" :class="{active: sorting.age_up}"
             @click.prevent="chsort"> 🠙 </a>
          <a href="#" @click.prevent="swsort('age')">Age</a>
        </th>
        <th>
          <a href="#" id="create_down" :class="{active: sorting.create_down}"
             @click.prevent="chsort"> 🠛 </a>
          <a href="#" id="create_up" :class="{active: sorting.create_up}"
             @click.prevent="chsort"> 🠙 </a>
          <a href="#" @click.prevent="swsort('create')">Create</a>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in table2" :key="item.nick">
          <td>{{ item.nick }}</td>
          <td>{{ item.id }}</td>
          <td>
            <ul>
              <li v-for="address in item.addresses" :key="address">{{ address }}</li>
            </ul>
          </td>
          <td>
            <span style="color:#777">{{ item.atime  }}</span><br />
            {{ timeview(item.atime_diff) }}
          </td> 
          <td>
            <span style="color:#777">{{ item.ctime  }}</span><br />
            {{ timeview(item.ctime_diff) }}
          </td>
        </tr>
      </tbody>
    </table>

</div></template>


<script setup>
const refreshInterval = 7777

const nick = ref('');
const address = ref('');
const err = ref(false);
const sorting= reactive({
  nick_up: false,
  nick_down: false,
  addr_up: false,
  addr_down: false,
  age_up: false,
  age_down: false,
  create_up: false,
  create_down: false,
})

// data
const loadedData = useFetch('http://localhost:54321/api/status');


onMounted( () => {
  setTimeout( refreshAuto, 100);
  console.log(`the component is now mounted.`)
})

const table2 = computed( () => {
  const table = loadedData.data

  if (loadedData.data.value == null ) {
    err.value = true;
    return [];
  } else {
    err.value = false;
  }
  

  let tab = [];
  const nick_re = nick.value == '' ? new RegExp(/.*/) : new RegExp(nick.value,"i");
  const address_re = address.value == '' ? new RegExp(/.*/) : new RegExp(address.value,"i");

  for (let i = 0; i < table.value.length; i++) {
    const item = table.value[i];
    if (nick_re.test(item.nick) && address_re.test(item.addresses.join(' '))) {
      tab.push(item)
    }
    
  }



  // sorting IP addresses
  for (let i=0; i< tab.length; i++) {
    tab[i].addresses = tab[i].addresses.sort((a, b) => {
          const num1 = Number(a.split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
          const num2 = Number(b.split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
          return num1 - num2;
      });
  }

  // sorting By Nick
  if (sorting.nick_down) {
    return tab.sort( (a,b) => {
      let fa = a.nick.toLowerCase();
      let fb = b.nick.toLowerCase();

      return fa.localeCompare(fb, undefined, {
          numeric: true,
          sensitivity: 'base'
      })
    })
  }
  if (sorting.nick_up) {
    return tab.sort( (a,b) => {
      let fa = a.nick.toLowerCase();
      let fb = b.nick.toLowerCase();

      return fb.localeCompare(fa, undefined, {
          numeric: true,
          sensitivity: 'base'
      })
    })
  }

  // sorting By Addresses
  if (sorting.addr_down) {
    return tab.sort( (a,b) => {
      let fa = ''
      for (let i=0; i<a.addresses.length; i++) {
        fa += a.addresses[i].split(".").map((num) => (`000${num}`).slice(-3) ).join("")
      }
      let fb = '';
      for (let i=0; i<b.addresses.length; i++) {
        fb += b.addresses[i].split(".").map((num) => (`000${num}`).slice(-3) ).join("")
      }

      if (fa < fb) {
          return -1;
      }
      if (fa > fb) {
          return 1;
      }
      return 0; 
    })
  }
  if (sorting.addr_up) {
    return tab.sort( (a,b) => {
      let fa = ''
      for (let i=0; i<a.addresses.length; i++) {
        fa += a.addresses[i].split(".").map((num) => (`000${num}`).slice(-3) ).join("")
      }
      let fb = '';
      for (let i=0; i<b.addresses.length; i++) {
        fb += b.addresses[i].split(".").map((num) => (`000${num}`).slice(-3) ).join("")
      }

      if (fa < fb) {
          return 1;
      }
      if (fa > fb) {
          return -1;
      }
      return 0; 
    })
  }

  // sorting By Age
  if (sorting.age_down) {
    return tab.sort( (a,b) => {
      return b.atime_stamp - a.atime_stamp 
    } )
  }
  if (sorting.age_up) {
    return tab.sort( (a,b) => {
      return a.atime_stamp - b.atime_stamp 
    } )
  }

  // sorting By Create
  if (sorting.create_down) {
    return tab.sort( (a,b) => {
      return b.ctime_stamp - a.ctime_stamp 
    } )
  }
  if (sorting.create_up) {
    return tab.sort( (a,b) => {
      return a.ctime_stamp - b.ctime_stamp 
    } )
  }
  return tab
})


let intervalID  = setInterval(refreshAuto, refreshInterval);
// refreshing
const refreshing = ref(false)
async function refreshAuto() {
  refreshing.value = true
  try {
    await loadedData.refresh()
    if (loadedData.data.value == null ) {
      err.value = true;
    } else {
      err.value = false;
    }

  }
  finally {
    refreshing.value = false
  }
}

function refreshClick(e) {
  clearInterval(intervalID)
  refreshAuto();
  intervalID  = setInterval(refreshAuto, refreshInterval);
}



function chsort(event) {
  for (let key in  sorting) {
    if (key == event.target.id) {
      sorting[key] = true;
    } else {
      sorting[key] = false;
    }
  }
}

function swsort(click) {
  let state = ''

  for (let key in  sorting) {
    if (sorting[key]) {
      state = key;    // zapamatuji si aktuální stav
    }
  }
  if (state.includes(click))  {
    // pokud kliknu na to co se používá
    sorting[click+'_up'] = !  sorting[click+'_up'];
    sorting[click+'_down'] = ! sorting[click+'_down'];
  } else {
    // pokud kliknu na něco jiného
    sorting[state] = false;
    sorting[click+'_down'] = true;
  }

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



<template>
  <v-app dark>
    <!-- <v-app-bar app color="black" dark> -->
    <v-main>
      <NetworkGraph />
    </v-main>
    <!-- </v-app-bar> -->
  </v-app>
</template>

<script>
import NetworkGraph from "./components/NetworkGraph";

export default {
  name: "App",

  components: {
    NetworkGraph,
  },

  data: () => ({}),
};
</script>

<style>
v-app {
  background-color: #fff7ae;
}
</style>
